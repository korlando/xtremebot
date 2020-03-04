const cmd = async ({ instance, messageEvent }) => {
	const { channel } = messageEvent;
	try {
		await instance.saveActiveMarkovChain();
		instance.send({
			text: 'Markov chain saved.',
			channel,
		});
	} catch (e) {
		instance.send({
			text: `Error saving markov chain: ${e.message}`,
			channel,
		});
	}
};

module.exports = {
  cmd,
  regex: /^save markov$/i,
  name: 'Save Markov Chain',
  usage: 'bot save markov',
};
