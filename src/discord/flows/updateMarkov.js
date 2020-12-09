// always returns false since not sending a message
module.exports = async ({ text, instance, message }) => {
	const guildId = instance.getGuildId(message);
	if (!guildId) {
		return false;
	}
	const mc = instance.getActiveMarkovChain(guildId);
	if (
		instance.canUseMarkovChain(guildId) &&
		!this.forceDisableUpdateMarkov &&
		// for markov chains designated to a particular discord user,
		// only allow updates if a message is coming from that user
		(!mc.discordUserId || (message.author.id === mc.discordUserId))
	) {
		mc.frequencyTable.handleInput(text);
	}
	return false;
};
