const mongoose = require('mongoose');

const VAR_NAME = 'XTREMEBOT_MONGO_URL';

if (!process.env[VAR_NAME]) {
	throw new Error(`Missing environment variable: ${VAR_NAME}`);
}

const conn = mongoose.createConnection(process.env[VAR_NAME]);

const SlackBot = require('./schemas/SlackBot')(conn);
const DiscordBot = require('./schemas/DiscordBot')(conn);
const ResponseTrigger = require('./schemas/ResponseTrigger')(conn);
const MarkovChain = require('./schemas/MarkovChain')(conn);
const User = require('./schemas/User')(conn);

module.exports = {
	SlackBot,
	DiscordBot,
	ResponseTrigger,
	MarkovChain,
	User,
};
