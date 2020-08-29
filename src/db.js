const mongoose = require('mongoose');

const NAME = 'XTREMEBOT_MONGO_URL';

if (!process.env[NAME]) {
  throw new Error(`Missing environment variable: ${NAME}`);
}

const conn = mongoose.createConnection(process.env[NAME]);

const SlackBot = require('./schemas/SlackBot')(conn);
const ResponseTrigger = require('./schemas/ResponseTrigger')(conn);
const MarkovChain = require('./schemas/MarkovChain')(conn);
const User = require('./schemas/User')(conn);

module.exports = {
	SlackBot,
	ResponseTrigger,
	MarkovChain,
	User,
};
