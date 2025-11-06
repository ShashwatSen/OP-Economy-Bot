const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'hunt',
  description: '🐾 Hunt for rare One Piece animals!',
  aliases: ['h'],
  cooldown: 5,
  async execute(message, args, db, client) {
    const user = message.author;
    const userId = user.id;
    let cash = db.get(`cash_${userId}`) || 0;

    if (cash < 5) {
      return message.reply('❌ You need at least **5 cash** to go hunting.');
    }

    db.add(`cash_${userId}`, -5);

    const pets = JSON.parse(fs.readFileSync('./config/pets.json', 'utf8'));

    const rarityWeights = {
      'S': 2,   // Ultra rare
      'A': 5,
      'B': 10,
      'C': 25,
      'D': 58   // Common
    };

    const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
    const roll = Math.random() * totalWeight;
    let sum = 0;
    let chosenRarity = 'D';

    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      sum += weight;
      if (roll <= sum) {
        chosenRarity = rarity;
        break;
      }
    }

    const possiblePets = pets.filter(p => p.Rarity === chosenRarity);
    const pet = possiblePets[Math.floor(Math.random() * possiblePets.length)];

    let amount = 1;
    if (pet.Rarity === 'D') {
      amount = Math.floor(Math.random() * 16) + 5; // 5–20
    }

    const rewardCash = Math.floor(Math.random() * 50) + 25;
    db.add(`cash_${userId}`, rewardCash);

    db.add(`pet_${userId}_${pet.Name}`, amount);
    db.push(`inventory_${userId}.pets`, { ...pet, Amount: amount });

    const rarityColors = {
      'S': '#ffcc00',
      'A': '#ff6600',
      'B': '#00ccff',
      'C': '#00ff99',
      'D': '#cccccc'
    };

    const embed = new EmbedBuilder()
      .setColor(rarityColors[pet.Rarity] || '#ffffff')
      .setAuthor({ name: `${user.username} went hunting! 🏹`, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setDescription(
        `🎯 You discovered an **${pet.Rarity}-Rank** pet!\n\n` +
        `${pet.Emoji} **${pet.Name}** × **${amount}**\n\n` +
        `💰 You also earned **${rewardCash} cash**!`
      )
      .setThumbnail('https://media.tenor.com/jkTKyS5oAF0AAAAC/hunting-anime.gif')
      .setFooter({ text: 'Hunting cost: -5 cash | Try again soon!' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
