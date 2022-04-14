const { DiscordBot } = require('../../db');

const cmd = async ({ instance, message, match }) => {
	const guildId = instance.getGuildId(message);
	if (!guildId || !Array.isArray(match)) {
		return;
	}

	// extract markov chain ID from input
	const id = (match[2] || '').trim();

	// check if ID is valid for use
	const mcs = instance.getGuildMarkovChains(guildId);
	const mc = mcs[id];

	if (!mc) {
		instance.send({
			text: 'No matching markov chain.',
			message,
		});
		return;
	}

	// check if markov chain is already being used
	if (id === instance.discordBots[guildId].activeMarkovChainId) {
		instance.send({
			text: 'Markov chain already active.',
			message,
		});
		return;
	}

	// update active chain ID in DB
	try {
		const res = await DiscordBot.find({ _id: instance.discordBots[guildId]._id }).limit(1);
		if (!res.length) {
			instance.send({
				text: 'Unable to find bot.',
				message,
			});
			return;
		}
		const discordBot = res[0];
		discordBot.activeMarkovChainId = id;
		await discordBot.save();

		// update active chain ID in memory
		instance.discordBots[guildId].activeMarkovChainId = id;
		instance.send({
			text: `Switched markov chains to *${mc.name}* (\`${mc._id}\`)`,
			message,
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
	usage: 'bot switch markov [markov chain ID]',
};
