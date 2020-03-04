const mongoose = require('mongoose');

const MarkovChainSchema = new mongoose.Schema({
	name: String,
	slackTeamId: String,
	slackChannelId: String,
	slackUserId: String,
	slackAppId: String,
	predictionLength: Number,
	frequencyTable: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	modifiedAt: Date,
}, {
	autoIndex: false,
});

module.exports = conn => conn.model('MarkovChain', MarkovChainSchema);
