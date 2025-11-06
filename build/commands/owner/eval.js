const { EmbedBuilder, codeBlock } = require('discord.js');
const util = require('util');
const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, '../../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));


module.exports = {
  name: 'eval',
  description: 'Evaluate JavaScript code (Owner Only). 🧠',
  aliases: ['ev'],
  ownerOnly: true,

  async execute(message, args, db, client) {
    const ownerIDs = [config.OWNERID, '1403045933410943136'];
    if (!ownerIDs.includes(message.author.id)) {
      return message.reply('❌ Only the Fleet Admiral can access this terminal.');
    }

    const code = args.join(' ');
    if (!code) return message.reply('❌ Please provide some code to evaluate.');

    try {
      let evaled = await eval(code);
      if (typeof evaled !== 'string') evaled = util.inspect(evaled, { depth: 1 });

      evaled = evaled.replaceAll(client.token, '[REDACTED]');
      if (config.TOKEN) {
        evaled = evaled.replaceAll(config.TOKEN, '[REDACTED]');
      }

      const embed = new EmbedBuilder()
        .setTitle('🧠 Fleet Admiral Debug Terminal')
        .setColor('#00FF7F')
        .addFields(
          { name: '📥 Input', value: codeBlock('js', code.slice(0, 1010)) },
          { name: '📤 Output', value: codeBlock('js', evaled.slice(0, 1010) || 'No output') }
        )
        .setFooter({ text: `Executed by ${message.author.tag}` })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Evaluation Error')
        .setColor('#FF5555')
        .addFields({
          name: '⚠️ Error',
          value: codeBlock('js', error.message.slice(0, 1010))
        })
        .setFooter({ text: 'Check your syntax, captain!' });

      message.reply({ embeds: [errorEmbed] });
    }
  }
};
