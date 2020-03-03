// order matters for priority; flows are checked in order
module.exports = [
	require('../flows/updateMarkov'),
	require('../flows/customTriggers'),
	require('../flows/markov'),
	require('../flows/phrases'),
];
