const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'prefix',
  description: 'Change or view the bot prefix for your server. ✏️',
  aliases: ['setprefix', 'changeprefix'],
  async execute(message, args, db, client) {
    const guildId = message.guild?.id;
    const user = message.author;

    const currentPrefix = db.get(`prefix_${guildId}`) || client.defaultPrefix || 'op';
    if (!args[0]) {
      const viewEmbed = new EmbedBuilder()
        .setTitle('⚓ Current Den Den Mushi Frequency')
        .setDescription(`The current command prefix in this server is **\`${currentPrefix}\`**`)
        .setColor('#1E90FF')
        .setFooter({ text: 'Use !prefix <newPrefix> to change it.' });
      return message.reply({ embeds: [viewEmbed] });
    }

    const newPrefix = args[0];

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ Only server captains (admins) can change the prefix!');
    }

    if (newPrefix.length > 5) {
      return message.reply('❌ Prefix too long! Please choose something shorter (max 5 characters).');
    }

    db.set(`prefix_${guildId}`, newPrefix);
    client.prefix = newPrefix;

    const embed = new EmbedBuilder()
      .setTitle('✏️ Den Den Mushi Frequency Updated')
      .setDescription(`✅ Prefix successfully changed to **\`${newPrefix}\`**\n\nNow use commands like:\n\`${newPrefix}help\``)
      .setColor('#00FF7F')
      .setFooter({ text: `Changed by ${user.username}`, iconURL: user.displayAvatarURL() })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
