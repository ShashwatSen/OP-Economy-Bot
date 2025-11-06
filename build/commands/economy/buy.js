const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function loadJSON(filename) {
  try {
    const filePath = path.join(process.cwd(), 'build/config', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`❌ Failed to load ${filename}:`, err.message);
    return [];
  }
}

const SHOP_ITEMS = {
  Animals: loadJSON('animals.json'),
  Weapons: loadJSON('weapons.json'),
  Abilities: loadJSON('abilities.json'),
  Armor: loadJSON('armors.json'),
  DungeonKeys: loadJSON('dungeonkeys.json'),
  Miscellaneous: loadJSON('misc.json')
};

module.exports = {
  name: 'buy',
  description: 'Purchase an item from the Grand Line Market 🛒',
  aliases: ['purchase', 'get'],
  
  async execute(message, args, db) {
    const user = message.author;
    const userId = user.id;
    const berries = db.get(`berries_${userId}`) || 0;

    if (!args.length) {
      return message.reply('⚠️ Please specify an item name to buy. Example: `!buy Sandai Kitetsu`');
    }

    const query = args.join(' ').toLowerCase();

    const allItems = Object.values(SHOP_ITEMS).flat();
    const item = allItems.find(i => i.name.toLowerCase() === query || i.id?.toLowerCase() === query);

    if (!item) {
      return message.reply('❌ That item is not sold in the Grand Line Market!');
    }

    if (!item.price || item.price <= 0) {
      return message.reply('❌ This item cannot be purchased.');
    }

    if (berries < item.price) {
      const shortfall = item.price - berries;
      return message.reply(`💴 You need **${shortfall.toLocaleString()}** more Berries to buy **${item.name}**.`);
    }

    db.add(`berries_${userId}`, -item.price);
    db.push(`inv_${userId}`, item.id);

    const embed = new EmbedBuilder()
      .setTitle('🛍️ Purchase Successful!')
      .setDescription(
        `**${user.username}**, you bought **${item.name}** for **${item.price.toLocaleString()} Berries!** 💴\n\n` +
        `It has been added to your inventory.\n\n` +
        `🧭 *"A fine choice, captain! May it serve you well on the seas!"*`
      )
      .addFields(
        { name: '📦 Item ID', value: item.id || 'unknown', inline: true },
        { name: '💰 Price', value: `${item.price.toLocaleString()} Berries`, inline: true },
        { name: '⭐ Rarity', value: item.rarity || 'Common', inline: true }
      )
      .setColor('#00FFAA')
      .setFooter({ text: '⚓ Visit the Grand Line Market again soon!' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
