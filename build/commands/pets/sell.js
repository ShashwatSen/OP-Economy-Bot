const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const animalsPath = path.join(__dirname, '../../config/animals.json');
const animalsData = JSON.parse(fs.readFileSync(animalsPath, 'utf8'));

const rarityValues = {
  S: 500,
  A: 250,
  B: 120,
  C: 60,
  D: 25
};

module.exports = {
  name: 'sell',
  description: 'Sell your hunted creatures and earn Berries! 💴',
  aliases: ['trade', 'market'],
  async execute(message, args, db) {
    const user = message.author;
    const userId = user.id;
    const animal = args[0]?.toLowerCase();

    const getAnimalValue = (name) => {
      const data = animalsData[name];
      if (!data || !rarityValues[data.rarity]) return null;
      return rarityValues[data.rarity];
    };

    if (animal === 'all') {
      let totalBerries = 0;
      let soldAnimals = [];

      for (const [key, info] of Object.entries(animalsData)) {
        const count = db.get(`animal_${userId}_${key}`) || 0;
        const value = getAnimalValue(key);
        if (count > 0 && value) {
          const total = count * value;
          totalBerries += total;
          soldAnimals.push({
            name: key,
            emoji: info.emoji || '🐾',
            count,
            value
          });
          db.set(`animal_${userId}_${key}`, 0);
        }
      }

      if (totalBerries === 0) {
        return message.reply('❌ You have no animals to sell, captain!');
      }

      db.add(`berries_${userId}`, totalBerries);

      const embed = new EmbedBuilder()
        .setTitle('🏴‍☠️ Grand Line Trade Market')
        .setDescription(
          `💰 **${user.username}** sold all their hunted creatures!\n` +
          `They earned a total of **${totalBerries.toLocaleString()} Berries!** 💴`
        )
        .addFields(
          {
            name: '🦜 Sold Items',
            value: soldAnimals
              .map(a => `${a.emoji} **${a.name}** x${a.count} → ${(a.count * a.value).toLocaleString()} Berries`)
              .join('\n')
              .slice(0, 1024)
          }
        )
        .setColor('#FFD700')
        .setFooter({ text: '⚓ The market thrives on your treasures!' })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (!animal) {
      return message.reply('⚠️ Please specify an animal name or use `sell all`.');
    }

    const data = animalsData[animal];
    if (!data) {
      return message.reply('❌ Invalid animal specified, captain.');
    }

    const count = db.get(`animal_${userId}_${animal}`) || 0;
    if (count < 1) {
      return message.reply(`❌ You don’t have any ${data.emoji || ''} ${animal} to sell.`);
    }

    const value = getAnimalValue(animal);
    if (!value) {
      return message.reply(`⚠️ The value for ${animal} isn’t set properly.`);
    }

    db.add(`animal_${userId}_${animal}`, -1);
    db.add(`berries_${userId}`, value);

    const replyEmbed = new EmbedBuilder()
      .setTitle('💴 Transaction Complete!')
      .setDescription(
        `You sold one **${data.emoji || '🐾'} ${animal}** *(Rank ${data.rarity})* ` +
        `for **${value.toLocaleString()} Berries**!`
      )
      .setColor('#00FFAA')
      .setFooter({ text: '⚓ The market bells ring with profit!' })
      .setTimestamp();

    message.reply({ embeds: [replyEmbed] });
  }
};
