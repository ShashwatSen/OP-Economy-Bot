const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType
} = require('discord.js');

module.exports = {
  name: 'help',
  description: '✨ Show the interactive help menu with categorized commands.',
  aliases: ['commands', 'cmds'],
  async execute(message, args, db, client) {
    const totalCommands = client.commands.size;
    const user = message.author;

    const baseEmbed = new EmbedBuilder()
      .setColor('#2b9edb')
      .setAuthor({
        name: `${client.user.username} Command Palette 📜`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription(
        `👋 Hey **${user.username}**, welcome to the **Help Center**!\n` +
          `> 💡 **Total Commands:** \`${totalCommands}\`\n` +
          `> 🏠 **Server:** ${message.guild.name}\n` +
          `Use the menu below to view specific command categories.`
      )
      .addFields( { name: '🏆 Ranking', value: '`top` · `profile`', inline: false }, { name: '💰 Economy', value: '`cash` · `give` · `shop` · `buy` · `blackjack` · `slot` · `coinflip`', inline: false }, { name: '🐾 Pets', value: '`hunt` · `train` · `sell` · `team` · `fight` · `gearup` · `use` · `petinfo`', inline: false }, { name: '🎁 Rewards', value: '`daily` · `weekly` · `monthly` · `yearly` · `treasure-mine` · `collect`', inline: false }, )
      .setFooter({
        text: `Requested by ${user.username} • Stay awesome! 💫`,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setLabel('Invite Me')
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`
        ),
      new ButtonBuilder()
        .setLabel('Support Server')
        .setStyle(ButtonStyle.Link)
        .setURL('https://dsc.gg/celestialdrift')
    );

    const selectMenu = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('help-menu')
        .setPlaceholder('🧭 Select a category...')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('🏆 Ranking')
            .setDescription('View ranking-related commands.')
            .setValue('ranking'),
          new StringSelectMenuOptionBuilder()
            .setLabel('💰 Economy')
            .setDescription('View economy-related commands.')
            .setValue('economy'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🐾 Pets')
            .setDescription('View pet-related commands.')
            .setValue('pets'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🎁 Rewards')
            .setDescription('View reward-related commands.')
            .setValue('rewards'),
          new StringSelectMenuOptionBuilder()
            .setLabel('🏠 Home')
            .setDescription('Go back to the main help page.')
            .setValue('home')
        )
    );

    const msg = await message.reply({
      embeds: [baseEmbed],
      components: [selectMenu, buttons],
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 150000,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== user.id)
        return interaction.reply({
          content: "⛔ This menu isn't for you!",
          ephemeral: true,
        });

      let updatedEmbed = EmbedBuilder.from(baseEmbed);

      switch (interaction.values[0]) {
        case 'ranking':
          updatedEmbed.setDescription(
            '**🏆 Ranking Commands**\n\n' +
              '`top` — View leaderboard\n' +
              '`profile` — View your stats and achievements\n\n' +
              'Keep climbing the ranks! 💪'
          );
          break;
        case 'economy':
          updatedEmbed.setDescription(
            '**💰 Economy Commands**\n\n' +
              '`cash` — Check your balance\n' +
              '`give` — Send coins to another user\n' +
              '`shop` / `buy` — Spend your wealth!\n' +
              '`blackjack`, `slot`, `coinflip` — Try your luck 🎲'
          );
          break;
        case 'pets':
          updatedEmbed.setDescription(
            '**🐾 Pet Commands**\n\n' +
              '`hunt` — Find a new pet\n' +
              '`train` — Level up your pet\n' +
              '`fight` — Battle other pets\n' +
              '`team`, `gearup`, `petinfo` — Manage your companions 🐕'
          );
          break;
        case 'rewards':
          updatedEmbed.setDescription(
            '**🎁 Reward Commands**\n\n' +
              '`daily`, `weekly`, `monthly`, `yearly` — Claim your bonuses!\n' +
              '`treasure-mine` — Hidden riches await ⛏️\n' +
              '`collect` — Collect event rewards'
          );
          break;
        case 'home':
          updatedEmbed = baseEmbed;
          break;
      }

      await interaction.update({ embeds: [updatedEmbed] });
    });

    collector.on('end', async () => {
      try {
        await msg.edit({
          components: [selectMenu.setComponents(
            selectMenu.components[0].setDisabled(true)
          ), buttons],
        });
      } catch (err) {

      }
    });
  },
};
