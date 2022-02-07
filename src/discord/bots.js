// The Discord variant of XtremeBot has a 1-to-n relationship with
// guilds (servers), unlike Slack where one bot is defined per workspace.
const XtremeBotDiscord = require('./xtremebot');
const manifest = require('../../bot-manifest');

const bots = [];
manifest.discord.bots.forEach((b, i) => {
	let { apiToken, commandTrigger } = b;
	if (!apiToken) {
		console.warn(`Discord bot manifest missing API token at index ${i}. Aborting initialization.`);
		return;
	}
	if (commandTrigger !== undefined && typeof commandTrigger !== 'string') {
		console.warn(`Invalid Discord bot commandTrigger at manifest index ${i}.`);
		commandTrigger = undefined;
	}
	bots.push(new XtremeBotDiscord(apiToken, { commandTrigger }));
});

module.exports = bots;
