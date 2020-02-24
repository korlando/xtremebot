const express = require('express');
const { transformSlackEventBody } = require('../transforms');
const { slackEventHandler } = require('../slack');

const router = express.Router();

router.post('/slack/events', (req, res) => {
	// slack will send a challenge param for verification of this URL
	const { challenge } = req.body;
	if (challenge) {
		res.set('Content-Type', 'text/plain');
		res.status(200).send(challenge);
		return;
	}
	// make the payload javascript-friendly
	const slackEvent = transformSlackEventBody(req.body);
	slackEventHandler(slackEvent);
	res.status(200).end();
});

module.exports = router;
