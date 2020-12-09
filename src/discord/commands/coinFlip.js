const utils = require('../../utils');

const options = ['heads', 'tails'];

const cmd = ({ instance, message }) => {
	instance.send({
		text: utils.randomValue(options),
		message,
	});
};

module.exports = {
	cmd,
	regex: /^flip[ ]+(a[ ]+)?coin([ ]+.*)?$/i,
	name: 'Flip a Coin',
	usage: 'bot flip a coin',
};
