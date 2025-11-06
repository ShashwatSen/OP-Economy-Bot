const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'tame',
  description: '🐾 Attempt to tame your hunted animals into loyal pets!',
  aliases: ['t'],
  cooldown: 10,
  async execute(message, args, db, client) {
    const user = message.author;
    const userId = user.id;

    const zoo = db.get(`zoo_${userId}`) || [];
    if (!zoo.length) {
      return message.reply('❌ You have no wild animals to tame. Go hunting first with `!hunt`!');
    }

    const animalType = args[0]?.toLowerCase();
    if (!animalType) {
      return message.reply('🦁 Specify which animal you want to tame! Example: `!tame wolf`');
    }

    const owned = zoo.filter(z => z.name?.toLowerCase() === animalType || z === animalType);
    if (!owned.length) {
      return message.reply(`❌ You don’t have any **${animalType}s** in your zoo to tame!`);
    }

    const materialRequirements = {
      S: { item: '🥩 Carcass', needed: 5 },
      A: { item: '🍖 Meat', needed: 3 },
      B: { item: '🥕 Herb Mix', needed: 2 },
      C: { item: '🌿 Grass Bundle', needed: 1 },
      D: { item: '🦴 Bone', needed: 1 }
    };

    const rarityMap = {
      rabbit: 'D',
      deer: 'C',
      fox: 'B',
      bear: 'A',
      wolf: 'S'
    };

    const rarity = rarityMap[animalType] || 'D';
    const req = materialRequirements[rarity];
    const triesNeeded = rarity === 'S' ? 3 : rarity === 'A' ? 2 : 1;
    const itemKey = `item_${userId}_${req.item}`;
    const hasItem = db.get(itemKey) || 0;

    if (hasItem < req.needed) {
      return message.reply(
        `❌ You need **${req.needed}x ${req.item}** to attempt taming a **${rarity}-Rank** ${animalType}.`
      );
    }
    db.add(itemKey, -req.needed);

    let successChance;
    switch (rarity) {
      case 'S': successChance = 0.25; break;
      case 'A': successChance = 0.4; break;
      case 'B': successChance = 0.6; break;
      case 'C': successChance = 0.8; break;
      default: successChance = 0.9;
    }

    const success = Math.random() < successChance;

    if (!success) {
      const embedFail = new EmbedBuilder()
        .setColor('#ff3333')
        .setAuthor({ name: `${user.username} tried to tame a ${animalType}!`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setDescription(
          `😣 The **${animalType}** resisted your taming attempt!\n` +
          `Try again after calming it down. You may need multiple attempts (**${triesNeeded}x** total for ${rarity}-Rank).`
        )
        .setFooter({ text: `Materials used: ${req.needed} ${req.item}` })
        .setTimestamp();

      return message.reply({ embeds: [embedFail] });
    }

    const pets = require('../../config/animals.json');
    const tamedPet = pets[Math.floor(Math.random() * pets.length)];
    db.push(`inventory_${userId}.pets`, tamedPet);

    const updatedZoo = zoo.filter(z => (z.name || z) !== animalType);
    db.set(`zoo_${userId}`, updatedZoo);

    const embed = new EmbedBuilder()
      .setColor('#00ff88')
      .setAuthor({ name: `${user.username} successfully tamed a ${animalType}!`, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setDescription(
        `🎉 The wild **${animalType}** has joined your crew!\n\n` +
        `✨ It transformed into a loyal pet: ${tamedPet.Emoji} **${tamedPet.Name}** (*${tamedPet.Rarity}-Rank*)\n` +
        `🏅 Taming chance: ${(successChance * 100).toFixed(0)}%\n` +
        `🦴 Material used: ${req.needed} ${req.item}`
      )
      .setThumbnail('https://media.tenor.com/npfUZqOXMIoAAAAd/one-piece-pet.gif')
      .setFooter({ text: `Taming successful after ${triesNeeded} attempt(s)!` })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
