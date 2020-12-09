// Discord variant of XtremeBot. Assumes there's just 1 instance here that
// handles messages for all guilds (servers) that've connected the bot
const { DiscordBotInstance } = require('./discord-kit');
const commands = require('./commands');

if (!process.env.DISCORD_TGL_BOT_TOKEN) {
	console.error('Missing environment variable: DISCORD_TGL_BOT_TOKEN');
	return;
}

const bot = new DiscordBotInstance(process.env.DISCORD_TGL_BOT_TOKEN, {
	commandTrigger: process.env.SMITH_LIVE_XTREMEBOT_TRIGGER,
	commands,
});

return;

client.on('ready', async () => {
	console.log(client.user);
	try {
		for (const [guildId, _] of client.guilds.cache) {
			const guild = await client.guilds.fetch(guildId);
		}
	} catch (e) {
		console.log(e);
	}
});
client.on('message', (message) => {
	console.log(message);
	if (message.author.bot) {
		return;
	}
	if (message.author.id === '336611654647414794') {
		// message.channel.send('hello');
	}
});

client.login(process.env.DISCORD_TGL_BOT_TOKEN);
