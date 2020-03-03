const mongoose = require('mongoose');

const SlackBotSchema = new mongoose.Schema({
	name: String,
	botId: String,
	userId: String,
	teamId: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	phrases: [String],
	activeMarkovChainId: String,
}, {
	autoIndex: false,
});

module.exports = conn => conn.model('SlackBot', SlackBotSchema);
