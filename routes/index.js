const express = require('express');

const router = express.Router();

router.post('/slack/events', (req, res) => {
  const { challenge } = req.body;
  res.set('Content-Type', 'text/plain');
  res.status(200).send(challenge);
});

module.exports = router;
