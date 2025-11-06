const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'give',
  description: '💸 Give cash to another user.',
  aliases: ['pay', 'transfer'],
  cooldown: 5,
  async execute(message, args, db) {
    const sender = message.author;
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target || isNaN(amount) || amount <= 0) {
      return message.reply('❌ Please mention a valid user and enter a positive amount. Example: `!give @user 500`');
    }

    if (target.bot) {
      return message.reply('🤖 You cannot give cash to bots.');
    }

    if (target.id === sender.id) {
      return message.reply('🙃 You can’t give cash to yourself, silly pirate!');
    }

    const senderCash = db.get(`cash_${sender.id}`) || 0;

    if (senderCash < amount) {
      return message.reply('❌ You don’t have enough cash for this transaction.');
    }

    db.add(`cash_${sender.id}`, -amount);
    db.add(`cash_${target.id}`, amount);

    const flavorTexts = [
      'Generosity sails high today! 🏴‍☠️',
      'Sharing your loot, are we? ⚓',
      'A true pirate’s honor — fair trade of treasure! 🗺️',
      'The Grand Line smiles upon generous hearts. 🌊',
      'The Straw Hats would be proud! ☠️',
    ];
    const randomFlavor = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];

    const embed = new EmbedBuilder()
      .setColor('#00ff88')
      .setAuthor({ name: `${sender.username} → ${target.username}`, iconURL: sender.displayAvatarURL({ dynamic: true }) })
      .setDescription(`💸 **${sender.username}** gave **${amount.toLocaleString()}** cash to **${target.username}**!`)
      .setFooter({ text: randomFlavor })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
