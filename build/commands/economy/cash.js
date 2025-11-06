const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'cash',
  description: 'Check how much money you currently have. 💰',
  aliases: ['balance', 'bal', 'money', 'berries', 'berry', 'cash'],
  cooldown: 2,
  async execute(message, args, db, client) {
    const user = message.author;
    const userId = user.id;
    const cash = db.get(`cash_${userId}`) || 0;

    let rank = '';
    if (cash >= 100000) rank = '💎 **Millionaire Pirate!**';
    else if (cash >= 10000) rank = '💰 **Wealthy Adventurer!**';
    else if (cash >= 1000) rank = '🪙 **Treasure Hunter!**';
    else if (cash >= 100) rank = '🧭 **Starting Explorer.**';
    else rank = '🍂 **Broke Wanderer... time to grind!**';

    const flavorTexts = [
      "The sea of riches awaits! 🌊",
      "Keep grinding — every berry counts! 💪",
      "Don’t forget to claim your daily reward. 🎁",
      "Your next treasure might be legendary! 🗺️",
    ];
    const randomFlavor = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];

    const embed = new EmbedBuilder()
      .setColor('#00ff99')
      .setAuthor({ name: `${user.username}'s Wallet 💵`, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setDescription(`**Current Balance:** 🪙 \`${cash.toLocaleString()} Berries\`\n${rank}`)
      .setFooter({ text: randomFlavor })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
