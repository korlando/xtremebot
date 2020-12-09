const mongoose = require('mongoose');

const DiscordBotSchema = new mongoose.Schema({
	name: String,
	botId: String,
	guildId: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	phrases: [String],
	activeMarkovChainId: String,
}, {
	autoIndex: false,
});

module.exports = conn => conn.model('DiscordBot', DiscordBotSchema);
