const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'battle',
  description: 'Engage in a pirate battle with another player or a random One Piece opponent! ⚔️🏴‍☠️',
  aliases: ['fight', 'duel'],
  async execute(message, args, db) {
    const user = message.author;
    const userId = user.id;
    const opponentUser = message.mentions.users.first();

    const berries = db.get(`berries_${userId}`) || 0;
    const bet = parseInt(args[1]) || parseInt(args[0]) || 0;

    const userPets = db.get(`pets_${userId}`) || [];

    if (isNaN(bet) || bet <= 0) {
      return message.reply('💰 **Oi!** You must specify a valid bet amount in Berries!');
    }

    if (berries < bet) {
      return message.reply(`❌ You don’t have enough **Berries**, ${user.username}-san!`);
    }

    if (opponentUser) {
      const opponentId = opponentUser.id;
      const opponentBerries = db.get(`berries_${opponentId}`) || 0;

      if (opponentId === userId) {
        return message.reply('🌀 You can’t battle yourself, matey!');
      }

      if (opponentBerries < bet) {
        return message.reply(`❌ ${opponentUser.username} doesn’t have enough **Berries** to accept this wager!`);
      }

      const opponentPets = db.get(`pets_${opponentId}`) || [];

      const result = Math.random() < 0.5 ? 'win' : 'lose';
      let winner, loser;

      if (result === 'win') {
        winner = user;
        loser = opponentUser;
        db.add(`berries_${userId}`, bet);
        db.add(`berries_${opponentId}`, -bet);
      } else {
        winner = opponentUser;
        loser = user;
        db.add(`berries_${userId}`, -bet);
        db.add(`berries_${opponentId}`, bet);
      }

      const embed = new EmbedBuilder()
        .setTitle('⚔️ Pirate Crew Battle!')
        .setDescription(
          `🏴‍☠️ **${user.username}** and their pets ${userPets.length ? `(${userPets.join(', ')})` : '*no pets*'}\n` +
          `⚔️ fought bravely against **${opponentUser.username}** and their pets ${opponentPets.length ? `(${opponentPets.join(', ')})` : '*no pets*'}!\n\n` +
          `🔥 After a fierce clash on the Grand Line... **${winner.username}** emerges victorious and claims **${bet.toLocaleString()} Berries!** 💰`
        )
        .addFields(
          { name: '🏆 Winner', value: winner.username, inline: true },
          { name: '💀 Loser', value: loser.username, inline: true },
          { name: '💰 Wager', value: `${bet.toLocaleString()} Berries`, inline: true }
        )
        .setColor(result === 'win' ? '#FFD700' : '#FF0000')
        .setFooter({ text: '⚓ The seas are ever-changing. Another duel awaits!' })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    const npcOpponents = [
      'Monkey D. Luffy',
      'Roronoa Zoro',
      'Vinsmoke Sanji',
      'Nico Robin',
      'Nami',
      'Usopp',
      'Franky',
      'Brook',
      'Jinbe',
      'Buggy the Clown',
      'Dracule Mihawk',
      'Kaido',
      'Big Mom',
      'Crocodile',
      'Blackbeard'
    ];

    const npc = npcOpponents[Math.floor(Math.random() * npcOpponents.length)];
    const npcPetOptions = ['Chopper 🐶', 'Carue 🦆', 'Laboon 🐋', 'Zou 🐘', 'Smiley 🐙'];
    const npcPet = npcPetOptions[Math.floor(Math.random() * npcPetOptions.length)];

    const result = Math.random() < 0.5 ? 'win' : 'lose';
    let resultMessage;

    if (result === 'win') {
      db.add(`berries_${userId}`, bet);
      resultMessage = `🏴‍☠️ You and your pets ${userPets.length ? `(${userPets.join(', ')})` : '*no pets*'} defeated **${npc}** and their companion **${npcPet}**!\nYou plundered **${bet.toLocaleString()} Berries!** 💰`;
    } else {
      db.add(`berries_${userId}`, -bet);
      resultMessage = `💥 **${npc}** and **${npcPet}** overwhelmed your crew, stealing **${bet.toLocaleString()} Berries...** 😢`;
    }

    const embed = new EmbedBuilder()
      .setTitle('🏴‍☠️ Grand Line Battle Results')
      .setDescription(resultMessage)
      .addFields(
        { name: '🪙 Your Berries', value: `${db.get(`berries_${userId}`).toLocaleString()} 💰`, inline: true },
        { name: '⚓ Opponent', value: `${npc} & ${npcPet}`, inline: true }
      )
      .setColor(result === 'win' ? '#00FF00' : '#FF0000')
      .setFooter({ text: '🌊 Victory or defeat... the sea remembers all.' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
