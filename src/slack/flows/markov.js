// returns true if the bot responds; false otherwise
module.exports = async ({ text, messageEvent, instance }) => {
	if (!instance.canUseMarkovChain()) {
		return false;
	}
	// only allow markov chain response if triggered for now
	const triggerMatch = text.trim().match(new RegExp(`(${instance.commandTrigger}|${instance.botUserStr})`, 'i'));
	if (triggerMatch) {
		await instance.send({
			text: instance.generateMarkovChainMessage(),
			channel: messageEvent.channel,
		});
		return true;
	}
	return false;
};
