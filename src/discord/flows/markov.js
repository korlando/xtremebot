// returns true if the bot responds; false otherwise
module.exports = async ({ text, message, instance }) => {
	const guildId = instance.getGuildId(message);
	if (!guildId || !instance.canUseMarkovChain(guildId)) {
		return false;
	}
	// only allow markov chain response if triggered for now
	const triggerMatch = text.trim().match(new RegExp(`(${instance.commandTrigger}|${instance.botUserStr})`, 'i'));
	if (triggerMatch) {
		await instance.send({
			text: instance.generateMarkovChainMessage(guildId),
			message,
		});
		return true;
	}
	return false;
};
