const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'blackjack',
  description: 'Play a game of Blackjack against the dealer. 🃏',
  aliases: ['bj'],
  cooldown: 5,
  async execute(message, args, db) {
    const user = message.author;
    const userId = user.id;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) {
      return message.reply('❌ Please specify a valid bet amount. Example: `!blackjack 100`');
    }

    let cash = db.get(`cash_${userId}`) || 0;

    if (cash < bet) {
      return message.reply('💸 You do not have enough cash, captain.');
    }

    const suits = ['♥️', '♦️', '♣️', '♠️'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    function drawCard() {
      const suit = suits[Math.floor(Math.random() * suits.length)];
      const value = values[Math.floor(Math.random() * values.length)];
      return { suit, value };
    }

    function calcScore(hand) {
      let total = 0;
      let aces = 0;

      for (const card of hand) {
        if (['J', 'Q', 'K'].includes(card.value)) total += 10;
        else if (card.value === 'A') {
          aces++;
          total += 11;
        } else total += parseInt(card.value);
      }

      while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
      }

      return total;
    }

    let playerHand = [drawCard(), drawCard()];
    let dealerHand = [drawCard(), drawCard()];

    const getHandString = hand => hand.map(c => `${c.value}${c.suit}`).join('  ');
    const dealerShown = `${dealerHand[0].value}${dealerHand[0].suit}  [❓]`;

    const embed = new EmbedBuilder()
      .setTitle('🃏 Blackjack - Grand Line Casino')
      .setDescription(
        `💰 **Bet:** ${bet}\n\n` +
        `🏴‍☠️ **Your Hand:** ${getHandString(playerHand)}\n` +
        `🧮 **Total:** ${calcScore(playerHand)}\n\n` +
        `👑 **Dealer’s Hand:** ${dealerShown}\n\n` +
        `🎯 Hit to draw another card, or Stand to keep your total.`
      )
      .setColor('#FFD700')
      .setFooter({ text: 'Blackjack at Rain Dinners Casino - One Piece Edition' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hit').setLabel('Hit 🃏').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('stand').setLabel('Stand 🏁').setStyle(ButtonStyle.Secondary)
    );

    const gameMessage = await message.reply({ embeds: [embed], components: [row] });

    let gameOver = false;

    const collector = gameMessage.createMessageComponentCollector({
      filter: i => i.user.id === userId,
      time: 60000
    });

    collector.on('collect', async i => {
      if (gameOver) return;

      if (i.customId === 'hit') {
        playerHand.push(drawCard());
        const playerTotal = calcScore(playerHand);

        if (playerTotal > 21) {
          gameOver = true;
          db.add(`cash_${userId}`, -bet);

          const bustEmbed = new EmbedBuilder()
            .setTitle('💥 You busted!')
            .setDescription(
              `🏴‍☠️ **Your Hand:** ${getHandString(playerHand)} (${playerTotal})\n` +
              `👑 **Dealer’s Hand:** ${getHandString(dealerHand)} (${calcScore(dealerHand)})\n\n` +
              `❌ You lost **${bet}** cash, captain!`
            )
            .setColor('#FF0000');
          return i.update({ embeds: [bustEmbed], components: [] });
        }

        const hitEmbed = new EmbedBuilder()
          .setTitle('🃏 Blackjack - Grand Line Casino')
          .setDescription(
            `💰 **Bet:** ${bet}\n\n` +
            `🏴‍☠️ **Your Hand:** ${getHandString(playerHand)}\n` +
            `🧮 **Total:** ${playerTotal}\n\n` +
            `👑 **Dealer’s Hand:** ${dealerShown}\n\n` +
            `🎯 Hit again or Stand to end your turn.`
          )
          .setColor('#FFD700');
        await i.update({ embeds: [hitEmbed], components: [row] });
      }

      if (i.customId === 'stand') {
        gameOver = true;

        while (calcScore(dealerHand) < 17) {
          dealerHand.push(drawCard());
        }

        const playerTotal = calcScore(playerHand);
        const dealerTotal = calcScore(dealerHand);

        let result = '';
        let color = '#FFD700';

        if (dealerTotal > 21 || playerTotal > dealerTotal) {
          db.add(`cash_${userId}`, bet);
          result = `🎉 You won **${bet}** cash!`;
          color = '#00FF00';
        } else if (playerTotal < dealerTotal) {
          db.add(`cash_${userId}`, -bet);
          result = `❌ You lost **${bet}** cash.`;
          color = '#FF0000';
        } else {
          result = `🤝 It's a tie, captain.`;
          color = '#AAAAAA';
        }

        const finalEmbed = new EmbedBuilder()
          .setTitle('🏁 Game Over - Results')
          .setDescription(
            `🏴‍☠️ **Your Hand:** ${getHandString(playerHand)} (${playerTotal})\n` +
            `👑 **Dealer’s Hand:** ${getHandString(dealerHand)} (${dealerTotal})\n\n` +
            `${result}`
          )
          .setColor(color);

        await i.update({ embeds: [finalEmbed], components: [] });
      }
    });

    collector.on('end', async () => {
      if (!gameOver) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('⌛ Game Timed Out')
          .setDescription('You took too long, captain. The dealer sails away with your bet!')
          .setColor('#FF0000');
        db.add(`cash_${userId}`, -bet);
        await gameMessage.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
};
