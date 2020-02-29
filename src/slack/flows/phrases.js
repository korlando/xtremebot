const utils = require('../../utils');

// returns true if the bot responds; false otherwise
module.exports = async ({ text, messageEvent, instance }) => {
	const { phrases } = instance.slackBot;
	if (!phrases.length) {
		return false;
	}
	const triggerMatch = text.trim().match(new RegExp(`(${instance.commandTrigger}|${instance.botUserStr})`, 'i'));
	if (triggerMatch && instance.phrasesActive) {
		// send a random phrase
		await instance.send({
			text: utils.randomValue(phrases),
			channel: messageEvent.channel,
		});
		return true;
	}
	return false;
};
