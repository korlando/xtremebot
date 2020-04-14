const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	slackUserId: String,
	slackTeamId: String,
	points: {
		type: Number,
		default: 0,
	},
	stars: [{
		createdAt: {
			type: Date,
			default: Date.now,
		},
		giverUserId: String,
		reason: String,
	}],
}, {
	autoIndex: false,
});

module.exports = conn => conn.model('UserSchema', UserSchema);
