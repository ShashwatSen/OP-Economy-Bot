const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const animalsPath = path.join(__dirname, '../../config/animals.json');
const animalsData = JSON.parse(fs.readFileSync(animalsPath, 'utf8'));

const rarities = {
  S: { chance: 0.02, reward: [300, 500] },   // Legendary creatures
  A: { chance: 0.05, reward: [150, 250] },   // Rare
  B: { chance: 0.10, reward: [80, 120] },    // Uncommon
  C: { chance: 0.13, reward: [40, 70] },     // Common
  D: { chance: 0.70, reward: [10, 30] }      // Very common
};

module.exports = {
  name: 'autohunt',
  description: 'Send your crew to automatically hunt for One Piece creatures! 🦊🏴‍☠️',
  aliases: ['ah', 'voyage', 'huntb'],
  async execute(message, args, db) {
    const user = message.author;
    const userId = user.id;
    const berries = db.get(`berries_${userId}`) || 0;
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply('⚠️ **Oi!** Specify how many hunts to run, e.g. `!autohunt 5`');
    }

    const costPerHunt = 10;
    const totalCost = amount * costPerHunt;

    if (berries < totalCost) {
      return message.reply(`❌ You need **${totalCost.toLocaleString()} Berries** to hunt ${amount} times.`);
    }

    db.add(`berries_${userId}`, -totalCost);

    const durationPerHunt = 5 * 60 * 1000;
    const totalMinutes = amount * 5;

    const startEmbed = new EmbedBuilder()
      .setTitle('🌊 Voyage Across the Grand Line!')
      .setDescription(
        `🏴‍☠️ **${user.username}** has sent their crew out to hunt!\n\n` +
        `💰 Total Cost: **${totalCost.toLocaleString()} Berries**\n` +
        `🕐 Duration: **${totalMinutes} minutes**\n\n` +
        `Each hunt takes **5 minutes**, and the crew may return with rare finds!`
      )
      .setColor('#00A3FF')
      .setFooter({ text: '⚓ The hunt begins... rarer creatures await!' })
      .setTimestamp();

    message.reply({ embeds: [startEmbed] });

    const pickAnimal = () => {
      const roll = Math.random();
      let cumulative = 0;
      for (const rarity in rarities) {
        cumulative += rarities[rarity].chance;
        if (roll <= cumulative) {
          const animalsOfRarity = Object.keys(animalsData).filter(a => animalsData[a].rarity === rarity);
          if (animalsOfRarity.length > 0) {
            const chosen = animalsOfRarity[Math.floor(Math.random() * animalsOfRarity.length)];
            return { name: chosen, rarity };
          }
          break;
        }
      }
      const allAnimals = Object.keys(animalsData);
      const randomAnimal = allAnimals[Math.floor(Math.random() * allAnimals.length)];
      return { name: randomAnimal, rarity: 'D' };
    };

    for (let i = 1; i <= amount; i++) {
      setTimeout(() => {
        const { name, rarity } = pickAnimal();
        const emoji = animalsData[name].emoji || '🐾';
        const rewardRange = rarities[rarity].reward;
        const reward = Math.floor(Math.random() * (rewardRange[1] - rewardRange[0] + 1)) + rewardRange[0];

        db.add(`animal_${userId}_${name}`, 1);
        db.push(`zoo_${userId}`, name);
        db.add(`berries_${userId}`, reward);

        const embed = new EmbedBuilder()
          .setTitle('🦜 Crew Voyage Report!')
          .setDescription(
            `Your crew caught a **${emoji} ${name}** *(Rank ${rarity})*!\n\n` +
            `They also earned **${reward.toLocaleString()} Berries** during the voyage! 💰`
          )
          .setColor(rarity === 'S' ? '#FFD700' : rarity === 'A' ? '#00FFAA' : '#FFFFFF')
          .setFooter({ text: `Voyage ${i}/${amount} | Rarity: ${rarity}` })
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
      }, i * durationPerHunt);
    }
  }
};
