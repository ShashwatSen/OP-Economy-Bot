const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const configDir = path.join(__dirname, '../../config');

function loadJSON(filename) {
  try {
    const filePath = path.join(configDir, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`❌ Failed to load ${filename}:`, err.message);
    return [];
  }
}

const ANIMALS = loadJSON('animals.json');
const WEAPONS = loadJSON('weapons.json');
const ABILITIES = loadJSON('abilities.json');
const ARMOR = loadJSON('armor.json') || [];
const DUNGEON_KEYS = loadJSON('dungeonkeys.json') || [];
const MISC = loadJSON('misc.json');

module.exports = {
  name: 'inventory',
  description: 'View all items and creatures you own. 🎒',
  aliases: ['inv', 'bag', 'items'],

  async execute(message, args, db) {
    const user = message.author;
    const userId = user.id;
    const boughtItems = db.get(`inv_${userId}`) || [];

    const ownedAnimals = [];
    for (const animal of ANIMALS) {
      const count = db.get(`animal_${userId}_${animal.Name}`) || 0;
      if (count > 0) {
        ownedAnimals.push({
          name: `${animal.Emoji} ${animal.Name}`,
          count,
          rarity: animal.Rarity,
        });
      }
    }

    const categorized = {
      Weapons: [],
      Abilities: [],
      Armor: [],
      DungeonKeys: [],
      Miscellaneous: [],
    };

    const categories = {
      Weapons: WEAPONS,
      Abilities: ABILITIES,
      Armor: ARMOR,
      DungeonKeys: DUNGEON_KEYS,
      Miscellaneous: MISC,
    };

    for (const id of boughtItems) {
      for (const [categoryName, categoryItems] of Object.entries(categories)) {
        const found = categoryItems.find(i => i.id === id);
        if (found) categorized[categoryName].push(found);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎒 ${user.username}'s Pirate Inventory`)
      .setColor('#FFD700')
      .setDescription('Your treasures, weapons, and discoveries from across the Grand Line.')
      .setFooter({ text: '⚓ Guard your loot carefully, captain!' })
      .setTimestamp();

    if (ownedAnimals.length > 0) {
      embed.addFields({
        name: '🐾 Animals',
        value: ownedAnimals
          .map(a => `${a.name} ×${a.count} (${a.rarity})`)
          .join('\n'),
        inline: false,
      });
    }

    const emojiMap = {
      Weapons: '⚔️',
      Abilities: '🍇',
      Armor: '🛡️',
      DungeonKeys: '🔑',
      Miscellaneous: '🎒',
    };

    for (const [categoryName, items] of Object.entries(categorized)) {
      if (items.length > 0) {
        embed.addFields({
          name: `${emojiMap[categoryName]} ${categoryName}`,
          value: items
            .map(i => `${i.Emoji || '📦'} ${i.Name || i.name} (${i.Rarity || 'N/A'})`)
            .join('\n'),
          inline: false,
        });
      }
    }

    if (
      ownedAnimals.length === 0 &&
      Object.values(categorized).every(arr => arr.length === 0)
    ) {
      embed.setDescription(
        '🪶 You currently have no items or creatures, captain.\n' +
        'Go on hunts, voyages, or buy something from the shop!'
      );
    }

    message.reply({ embeds: [embed] });
  },
};
