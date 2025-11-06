const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'coinflip',
  description: 'Flip a coin at the Grand Line Casino! 🪙',
  aliases: ['cf'],
  cooldown: 5,
  async execute(message, args, db) {
    const user = message.author;
    const userId = user.id;

    const bet = parseInt(args[0]);
    const choice = args[1]?.toLowerCase();

    if (isNaN(bet) || bet <= 0) {
      return message.reply('❌ Please specify a valid bet amount. Example: `!coinflip 100 heads`');
    }

    const cash = db.get(`cash_${userId}`) || 0;

    if (cash < bet) {
      return message.reply('💸 You do not have enough Berries, captain!');
    }

    if (!choice || (choice !== 'heads' && choice !== 'tails')) {
      return message.reply('🪙 Please choose either `heads` or `tails`. Example: `!coinflip 100 heads`');
    }

    const result = Math.random() < 0.5 ? 'heads' : 'tails';

    const flipEmbed = new EmbedBuilder()
      .setTitle('🪙 Coin Flip - Grand Line Casino')
      .setColor('#FFD700')
      .setDescription('Flipping the coin... ⏳');

    const flipMessage = await message.reply({ embeds: [flipEmbed] });

    setTimeout(() => {
      let resultText = '';
      let color = '#FFD700';

      if (choice === result) {
        db.add(`cash_${userId}`, bet);
        resultText = `🎉 **You won!**\n\nThe coin landed on **${result.toUpperCase()}**.\nYou earned **${bet.toLocaleString()} Berries! 💰**`;
        color = '#00FF00';
      } else {
        db.add(`cash_${userId}`, -bet);
        resultText = `❌ **You lost!**\n\nThe coin landed on **${result.toUpperCase()}**.\nYou lost **${bet.toLocaleString()} Berries... ☠️**`;
        color = '#FF0000';
      }

      const resultEmbed = new EmbedBuilder()
        .setTitle('🪙 Coin Flip Result')
        .setDescription(resultText)
        .setColor(color)
        .setFooter({ text: '⚓ The Grand Line Casino awaits your next gamble!' })
        .setTimestamp();

      flipMessage.edit({ embeds: [resultEmbed] });
    }, 2000);
  }
};
