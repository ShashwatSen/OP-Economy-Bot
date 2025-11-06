const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'shop',
  description: 'Browse the Grand Line Market and buy legendary items! 🏴‍☠️',
  aliases: ['store', 'market'],
  async execute(message, args, db) {
    const animals = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/animals.json')));
    const weapons = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/weapons.json')));
    const abilities = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/abilities.json')));
    const misc = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/misc.json')));
    const armors = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/armors.json')));
    const dungeonKeys = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/dungeonkeys.json')));

    const SHOP_ITEMS = {
      Animals: animals.map(a => ({
        name: `${a.name} ${a.emoji}`,
        price: a.price,
        description: a.description,
        rarity: a.rarity,
        id: `animal_${a.id}`
      })),
      Weapons: weapons.map(w => ({
        name: `${w.name} ${w.emoji}`,
        price: w.price,
        description: w.description,
        rarity: w.rarity,
        id: `weapon_${w.id}`
      })),
      Abilities: abilities.map(f => ({
        name: `${f.name} ${f.emoji || ''}`,
        price: f.price || 0,
        description: f.description || 'A mysterious power from the seas.',
        rarity: f.rarity || 'Unknown',
        id: `ability_${f.id || f.name.toLowerCase().replace(/\s+/g, '_')}`
      })),
      Armor: armors.map(a => ({
        name: `${a.name} ${a.emoji || ''}`,
        price: a.price || 0,
        description: a.description || 'Durable armor for true warriors.',
        rarity: a.rarity || 'Unknown',
        id: `armor_${a.id || a.name.toLowerCase().replace(/\s+/g, '_')}`
      })),
      DungeonKeys: dungeonKeys,
      Miscellaneous: misc.map(m => ({
        name: `${m.name} ${m.emoji}`,
        price: m.price,
        description: m.description,
        rarity: m.rarity,
        id: `misc_${m.id}`
      }))
    };

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('shop_category')
      .setPlaceholder('🛒 Select a Category')
      .addOptions([
        { label: '🐾 Animals', value: 'Animals', emoji: '🐾', description: 'Rare creatures from around the world.' },
        { label: '⚔️ Weapons', value: 'Weapons', emoji: '⚔️', description: 'Powerful weapons for battle.' },
        { label: '🍇 Abilities', value: 'Abilities', emoji: '🍇', description: 'Devil Fruits and mystical powers.' },
        { label: '🛡️ Armor', value: 'Armor', emoji: '🛡️', description: 'Protect yourself like a true warrior.' },
        { label: '🔑 Dungeon Keys', value: 'DungeonKeys', emoji: '🔑', description: 'Keys to legendary dungeons.' },
        { label: '💰 Miscellaneous', value: 'Miscellaneous', emoji: '💰', description: 'Treasure, materials, and more!' }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const shopEmbed = new EmbedBuilder()
      .setTitle('🏴‍☠️ Grand Line Market')
      .setDescription('Browse through the categories below to see what treasures await!')
      .setColor('#FFD700')
      .setFooter({ text: 'Use the select menu to explore different categories.' })
      .setTimestamp();

    const msg = await message.reply({ embeds: [shopEmbed], components: [row] });

    const filter = i => i.customId === 'shop_category' && i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async interaction => {
      const category = interaction.values[0];
      const items = SHOP_ITEMS[category];

      const embed = new EmbedBuilder()
        .setTitle(`🛍️ ${category} Shop`)
        .setColor('#00BFFF')
        .setDescription(
          items
            .map(
              (item, i) =>
                `**${i + 1}. ${item.name}**\n💰 **Price:** ${item.price}\n⭐ **Rarity:** ${item.rarity}\n🗒️ *${item.description}*\n`
            )
            .join('\n')
        )
        .setFooter({ text: 'Use the buy command to purchase an item (e.g. !buy <item_id>)' });

      await interaction.update({ embeds: [embed], components: [row] });
    });

    collector.on('end', async () => {
      try {
        await msg.edit({ components: [] });
      } catch (err) {
      }
    });
  }
};
