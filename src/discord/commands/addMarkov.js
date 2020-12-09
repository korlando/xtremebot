const { MarkovChain } = require('../../db');
const { FrequencyTable } = require('../../markov');

const cmd = async ({ instance, message, match }) => {
	const guildId = instance.getGuildId(message);
	if (!guildId || !Array.isArray(match)) {
		return;
	}
	const name = match[1].trim();
	const windowSize = parseInt(match[2]);
	if (!name) {
		instance.send({
			text: 'Invalid name',
			message,
		});
	}
	if (!windowSize || windowSize <= 0) {
		instance.send({
			text: `Invalid window size: ${windowSize}`,
			message,
		});
		return;
	}
	const chain = new MarkovChain();
	chain.name = name;
	chain.predictionLength = windowSize;
	chain.discordBotId = instance.botId;
	chain.discordGuildId = guildId;
	chain.frequencyTable = JSON.stringify({
		predictionLength: windowSize,
		frequencyTable: {},
		wordFrequencies: {},
	});
	chain.save();
	const _id = String(chain._id);
	instance.markovChains[_id] = {
		_id,
		name,
		frequencyTable: new FrequencyTable(windowSize, chain.frequencyTable),
		predictionLength: windowSize,
		discordGuildId: guildId,
	};
	instance.send({
		text: `Successfully created markov chain with ID: ${_id}`,
		message,
	});
};

module.exports = {
	cmd,
	regex: /^add[ ]+markov[ ]+"(.+)"[ ]+([0-9]+)?$/i,
	name: 'Add new markov chain',
	usage: 'bot add markov "[NAME]" [window size]',
	hidden: true,
};
