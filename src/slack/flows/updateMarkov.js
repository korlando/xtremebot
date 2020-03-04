// always returns false since not sending a message
module.exports = async ({ text, instance, messageEvent }) => {
	const mc = instance.getActiveMarkovChain();
	if (
		instance.canUseMarkovChain() &&
		!this.forceDisableUpdateMarkov &&
		// for markov chains designated to a particular slack user,
		// only allow updates if a message is coming from that user
		(!mc.slackUserId || (messageEvent.user === mc.slackUserId))
	) {
		mc.frequencyTable.handleInput(text);
	}
	return false;
};
