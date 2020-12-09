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
