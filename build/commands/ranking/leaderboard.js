const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'leaderboard',
  description: 'Display the top 25 richest pirates on the Grand Line! 🏴‍☠️',
  aliases: ['lb', 'bountyboard'],
  async execute(message, args, db) {
    const allUsers = db
      .all()
      .filter(entry => entry.ID.startsWith('cash_') && typeof entry.data === 'number');

    if (allUsers.length === 0) {
      return message.reply('❌ No pirates found on the leaderboard yet!');
    }

    const sortedUsers = allUsers.sort((a, b) => b.data - a.data).slice(0, 25);

    const embed = new EmbedBuilder()
      .setTitle('🏴‍☠️ Grand Line Bounty Board 🪙')
      .setColor('#FFD700')
      .setThumbnail('https://i.imgur.com/Bo8Yq1F.png')
      .setFooter({ text: '⚓ The higher your cash, the higher your bounty!' })
      .setTimestamp();

    for (let i = 0; i < sortedUsers.length; i++) {
      const userId = sortedUsers[i].ID.split('_')[1];
      const amount = sortedUsers[i].data;
      const userObj = await message.client.users.fetch(userId).catch(() => null);

      let medal = '';
      if (i === 0) medal = '🥇';
      else if (i === 1) medal = '🥈';
      else if (i === 2) medal = '🥉';
      else medal = `#${i + 1}`;

      embed.addFields({
        name: `${medal} ${userObj ? userObj.username : '🏴‍☠️ Unknown Pirate'}`,
        value: `💰 **${amount.toLocaleString()} Berries**`,
        inline: false
      });
    }

    
    message.reply({ embeds: [embed] });
  }
};
