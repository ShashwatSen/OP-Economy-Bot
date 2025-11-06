const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('croxydb');
const chalk = require('chalk');
const config = require('./config/config.json');
const { verifyUser } = require('./utils/verifyUser');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.defaultPrefix = config.prefix || 'op';
client.prefix = db.get('prefix') || client.defaultPrefix;


function loadCommands(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      loadCommands(filePath);
    } else if (file.endsWith('.js')) {
      try {
        const command = require(filePath);

        if (!command.name) {
          console.warn(chalk.yellow(`⚠️ Skipping '${file}' (missing command.name)`));
          continue;
        }

        client.commands.set(command.name, command);
        if (command.aliases && Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            client.commands.set(alias, command);
          }
        }

        console.log(chalk.green(`✅ Loaded command: ${command.name}`));
      } catch (err) {
        console.log(chalk.red(`❌ Failed to load command ${file}:`), err);
      }
    }
  }
}

const commandsDir = path.join(__dirname, 'commands');
loadCommands(commandsDir);

const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(chalk.blue(`🎯 Loaded event: ${event.name}`));
  }
}

client.once('clientReady', () => {
  console.log(chalk.cyan(`\n✅ Logged in as ${client.user.tag}`));
  client.user.setActivity(`ophelp | Serving ${client.guilds.cache.size} servers ✨`, { type: 0 });
});


client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const guildPrefix = db.get(`prefix_${message.guild.id}`) || client.prefix;
  const prefixes = [guildPrefix, client.defaultPrefix];
  const prefix = prefixes.find((p) => message.content.startsWith(p));
  if (!prefix) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  const verified = await verifyUser(message);
  if (!verified) return;

  // Cooldown system
  const now = Date.now();
  const cooldowns = client.cooldowns.get(command.name) || new Map();
  const cooldownTime = (command.cooldown || 2) * 1000;

  if (cooldowns.has(message.author.id)) {
    const expiration = cooldowns.get(message.author.id) + cooldownTime;
    if (now < expiration) {
      const timeLeft = ((expiration - now) / 1000).toFixed(1);
      return message.reply(`⏳ Please wait **${timeLeft}s** before using \`${command.name}\` again.`);
    }
  }

  cooldowns.set(message.author.id, now);
  client.cooldowns.set(command.name, cooldowns);
  setTimeout(() => cooldowns.delete(message.author.id), cooldownTime);

  try {
    await command.execute(message, args, db, client);
  } catch (error) {
    console.error(chalk.red(`❌ Error executing command ${command.name}:`), error);
    message.reply('⚠️ Oops! Something went wrong while running that command.');
  }
});



client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, [], db, client);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '⚠️ Command execution failed!', ephemeral: true });
  }
});

client.login(config.token);
