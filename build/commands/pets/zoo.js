const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'zoo',
  description: '🦁 View your entire hunted pet collection!',
  aliases: ['z'],
  async execute(message, args, db) {
    const user = message.author;
    const userId = user.id;
    const inventory = db.get(`inventory_${userId}.pets`) || [];

    if (!inventory.length) {
      return message.reply('❌ You have no pets in your zoo yet. Go hunting with `!hunt`!');
    }
    const petsData = JSON.parse(fs.readFileSync('../../config/animals.json', 'utf8'));
    const petCounts = {};
    for (const pet of inventory) {
      if (!petCounts[pet.Name]) petCounts[pet.Name] = { ...pet, Amount: 0 };
      petCounts[pet.Name].Amount += pet.Amount || 1;
    }
    const rarityOrder = ['S', 'A', 'B', 'C', 'D'];
    const sortedPets = Object.values(petCounts).sort(
      (a, b) => rarityOrder.indexOf(a.Rarity) - rarityOrder.indexOf(b.Rarity)
    );
    let description = '';
    for (const pet of sortedPets) {
      const emoji = pet.Emoji || '🐾';
      description += `**${emoji} ${pet.Name}** — *${pet.Rarity}-Rank* × **${pet.Amount}**\n`;
    }

    const totalPets = sortedPets.reduce((a, b) => a + b.Amount, 0);

    const embed = new EmbedBuilder()
      .setColor('#00ccff')
      .setAuthor({ name: `${user.username}'s Zoo 🦁`, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setDescription(description)
      .addFields(
        { name: '📊 Total Pets', value: `${totalPets}`, inline: true },
        { name: '🧬 Unique Species', value: `${sortedPets.length}`, inline: true }
      )
      .setThumbnail('https://media.tenor.com/DoE0Z8Uyb0MAAAAi/one-piece-zoo.gif')
      .setFooter({ text: 'Keep hunting to expand your legendary collection!' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
