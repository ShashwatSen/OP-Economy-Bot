const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');

module.exports = {
  async verifyUser(message) {
    const userId = message.author.id;
    const verified = db.get(`verified_${userId}`);

    if (verified === true) return true;

    try {
      db.set('health_check', true);
    } catch (err) {
      console.error('❌ CroxyDB is not initialized correctly:', err);
      return message.reply('⚠️ Database error! Please contact the developer.');
    }

    const embed = new EmbedBuilder()
      .setTitle('⚓ Welcome to the Grand Line!')
      .setColor('#00AEEF')
      .setDescription(
        `Ahoy, **${message.author.username}**!\n\nBefore you can sail with the crew, you must verify yourself as human.\n\n` +
        `**Rules:**\n` +
        `1. No spam or automation.\n` +
        `2. Respect your fellow pirates.\n` +
        `3. Have fun and be adventurous!\n\n` +
        `Click the ✅ **Verify** button below within 60 seconds.`
      )
      .setFooter({ text: 'You have 60 seconds to verify.' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify_btn')
        .setLabel('✅ Verify')
        .setStyle(ButtonStyle.Success)
    );

    const verifyMsg = await message.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });

    const filter = (i) => i.customId === 'verify_btn' && i.user.id === userId;
    const collector = verifyMsg.createMessageComponentCollector({ filter, time: 60000 });

    let completed = false;

    collector.on('collect', async (i) => {
      completed = true;
      await i.deferUpdate();

      db.set(`verified_${userId}`, true);

      await verifyMsg.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle('✅ Verification Successful!')
            .setDescription(`Welcome aboard, **${message.author.username}**! You are now verified.`)
            .setColor('#00FF7F')
        ],
        components: []
      });

      collector.stop('verified');
    });

    collector.on('end', async (_, reason) => {
      if (!completed && reason !== 'verified') {
        await verifyMsg.edit({
          embeds: [
            EmbedBuilder.from(embed)
              .setColor('#FF5555')
              .setDescription('❌ Verification expired! Try any command again to reverify.')
          ],
          components: []
        });
      }
    });

    return false;
  },
};
