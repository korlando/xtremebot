// always returns false since not sending a message
module.exports = async ({ text, instance }) => {
	if (instance.canUseMarkovChain()) {
		instance.getActiveMarkovChain().frequencyTable.handleInput(text);
	}
	return false;
};
