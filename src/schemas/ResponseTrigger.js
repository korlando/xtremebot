const mongoose = require('mongoose');

const ResponseTriggerSchema = new mongoose.Schema({
	slackBotId: String,
	discordBotId: String,
	guildId: String,
	trigger: String,
	response: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	createdBySlackUserId: String,
	createdByDiscordUserId: String,
}, {
	autoIndex: false,
});
module.exports = conn => conn.model('ResponseTrigger', ResponseTriggerSchema);
