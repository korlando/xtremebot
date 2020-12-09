const utils = require('../../utils');

module.exports = async ({ text, message, instance }) => {
	const guildId = instance.getGuildId(message);
	if (!guildId) {
		return false;
	}
	// custom response
	const customMatch = text.match(instance.customTriggerRegex[guildId]);
	if (!customMatch) {
		return false;
	}
	const trigger = customMatch[2].toLowerCase();
	const responses = instance.customTriggerMap[guildId][trigger];
	if (!Array.isArray(responses) || !responses.length) {
		return false;
	}
	await instance.send({
		text: utils.randomValue(responses).response,
		message,
	});
	return true;
};
