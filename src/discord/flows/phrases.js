const utils = require('../../utils');

// returns true if the bot responds; false otherwise
module.exports = async ({ text, message, instance }) => {
	const guildId = instance.getGuildId(message);
	if (!guildId) {
		return false;
	}
	const discordBot = instance.discordBots[guildId];
	const { phrases } = discordBot;
	if (!phrases.length) {
		return false;
	}
	const triggerMatch = text.trim().match(new RegExp(`(${instance.commandTrigger}|${instance.botUserStr})`, 'i'));
	if (triggerMatch && instance.phrasesActive[guildId]) {
		// send a random phrase
		await instance.send({
			text: utils.randomValue(phrases),
			message,
		});
		return true;
	}
	return false;
};
