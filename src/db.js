const mongoose = require('mongoose');

const NAME = 'XTREMEBOT_MLAB_URL';

if (!process.env[NAME]) {
  throw new Error(`Missing environment variable: ${NAME}`);
}

const conn = mongoose.createConnection(process.env[NAME]);

const SlackBot = require('./schemas/SlackBot')(conn);

module.exports = {
	SlackBot,
};