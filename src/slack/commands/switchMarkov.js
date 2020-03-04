const { SlackBot } = require('../../db');

const cmd = async ({ instance, messageEvent, match }) => {
	const id = ((Array.isArray(match) && match[2]) || '').trim();
	const { channel } = messageEvent;
	const mc = instance.markovChains[id];
	if (!mc) {
		instance.send({
			text: 'No matching markov chain.',
			channel,
		});
		return;
	}
	if (id === instance.slackBot.activeMarkovChainId) {
		instance.send({
			text: 'Markov chain already active.',
			channel,
		});
		return;
	}

	try {
		const res = await SlackBot.find({ _id: instance.slackBot._id }).limit(1);
		if (!res.length) {
			instance.send({
				text: 'Unable to find bot.',
				channel,
			});
			return;
		}
		const slackBot = res[0];
		slackBot.activeMarkovChainId = id;
		await slackBot.save();
		instance.slackBot.activeMarkovChainId = id;
		instance.send({
			text: `Switched markov chains to *${mc.name}* (\`${mc._id}\`)`,
			channel,
		});
	} catch (e) {
		instance.send({
			text: `Error switching markov chain: ${e.message}`,
			channel,
		});
	}
};

module.exports = {
  cmd,
  regex: /^(activate|switch)[ ]+markov[ ]+([^ ]+)$/i,
  name: 'Switch Markov Chain',
  usage: 'bot switch markov [markov ID]',
};
