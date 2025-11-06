const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'slot',
  description: 'Try your luck at the Grand Line Slots! 🎰',
  aliases: ['slots', 'spin'],
  cooldown: 5,
  async execute(message, args, db) {
    const user = message.author;
    const userId = user.id;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) {
      return message.reply('❌ Please specify a valid bet amount. Example: `!slot 100`');
    }

    const cash = db.get(`cash_${userId}`) || 0;
    if (cash < bet) {
      return message.reply('💸 You do not have enough Berries to play, captain!');
    }

    const symbols = [
      '🍒', // Common
      '🍋',
      '🍉',
      '⭐', // Rare
      '💎', // Epic
      '🏴‍☠️' // Legendary
    ];

    const spin = () => symbols[Math.floor(Math.random() * symbols.length)];

    const slots = [spin(), spin(), spin()];

    const loadingEmbed = new EmbedBuilder()
      .setTitle('🎰 Grand Line Slots')
      .setDescription(
        `💰 **Bet:** ${bet.toLocaleString()} Berries\n\n` +
        `Spinning the reels... ⏳`
      )
      .setColor('#FFD700');

    const msg = await message.reply({ embeds: [loadingEmbed] });

    setTimeout(async () => {
      let resultText = '';
      let color = '#FFD700';
      let winAmount = 0;

      const [a, b, c] = slots;

      if (a === b && b === c) {
        if (a === '🏴‍☠️') winAmount = bet * 10;
        else if (a === '💎') winAmount = bet * 5;
        else if (a === '⭐') winAmount = bet * 3;
        else winAmount = bet * 2;

        db.add(`cash_${userId}`, winAmount);
        resultText = `🎉 **Jackpot!** You rolled ${slots.join(' ')}\nYou won **${winAmount.toLocaleString()} Berries! 💰**`;
        color = '#00FF00';
      } 
      else if (a === b || b === c || a === c) {
        winAmount = Math.floor(bet * 1.5);
        db.add(`cash_${userId}`, winAmount);
        resultText = `✨ **Nice!** You rolled ${slots.join(' ')}\nYou won **${winAmount.toLocaleString()} Berries!**`;
        color = '#00CCFF';
      } 
      else {
        // Loss
        db.add(`cash_${userId}`, -bet);
        resultText = `❌ **No luck this time, captain...**\n${slots.join(' ')}\nYou lost **${bet.toLocaleString()} Berries. ☠️**`;
        color = '#FF0000';
      }

      const resultEmbed = new EmbedBuilder()
        .setTitle('🎰 Grand Line Slots - Results')
        .setDescription(resultText)
        .setColor(color)
        .setFooter({ text: '⚓ Rain Dinners Casino welcomes you again, captain!' })
        .setTimestamp();

      await msg.edit({ embeds: [resultEmbed] });
    }, 2500);
  }
};
