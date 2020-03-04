const utils = require('../../utils');

const options = ['heads', 'tails'];

const cmd = ({ instance, messageEvent }) => {
	const { channel } = messageEvent;
	instance.send({
		text: utils.randomValue(options),
		channel,
	});
};

module.exports = {
	cmd,
	regex: /^flip[ ]+(a[ ]+)?coin([ ]+.*)?$/i,
	name: 'Flip a Coin',
	usage: 'bot flip a coin',
};
