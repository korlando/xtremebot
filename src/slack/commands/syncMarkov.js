const cmd = async ({ instance, messageEvent }) => {
	const { channel } = messageEvent;
	try {
		await instance.syncMarkovChains();
		instance.send({
			text: 'Markov chains synced.',
			channel,
		});
	} catch (e) {
		instance.send({
			text: `Error syncing markov chains: ${e.message}`,
			channel,
		});
	}
};

module.exports = {
	cmd,
	regex: /^sync markov$/i,
	name: 'Sync Markov Chains',
	usage: 'bot sync markov',
	hidden: true,
};
