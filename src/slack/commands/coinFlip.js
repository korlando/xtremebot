const utils = require('../../utils');

const options = ['heads', 'tails'];

const cmd = ({ send, messageEvent }) => {
	const { channel } = messageEvent;
	send({
		text: utils.randomValue(options),
		channel,
	});
};

module.exports = {
	cmd,
	regex: /^flip[ ]+(a[ ]+)?coin([ ]+.*)?$/i,
};
