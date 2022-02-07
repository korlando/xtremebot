const { MarkovChain } = require('../../db');
const { FrequencyTable } = require('../../markov');
const switchMarkov = require('./switchMarkov');

const cmd = async ({ instance, messageEvent, match }) => {
	const { channel } = messageEvent;
	if (!Array.isArray(match)) {
		return;
	}
	const name = match[1].trim();
	const windowSize = parseInt(match[2]);
	if (!name) {
		instance.send({
			text: 'Invalid name',
			channel,
		});
	}
	if (!windowSize || windowSize <= 0) {
		instance.send({
			text: `Invalid window size: ${windowSize}`,
			channel,
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
		slackTeamId: instance.botTeamId,
		slackAppId: instance.appId,
	};
	instance.send({
		text: `Successfully created markov chain with ID: ${_id}`,
		channel,
	});

	if (!instance.slackBot.activeMarkovChainId) {
		// default to the markov chain just created
		switchMarkov.cmd({
			instance,
			messageEvent,
			match: `switch markov ${_id}`.match(switchMarkov.regex),
		});
	}
};

module.exports = {
	cmd,
	regex: /^add[ ]+markov[ ]+"(.+)"[ ]+([0-9]+)?$/i,
	name: 'Add new markov chain',
	usage: 'bot add markov "[NAME]" [window size]',
	hidden: true,
};
