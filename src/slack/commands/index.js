// every command needs to be an object with the following spec:
// {
//   cmd: function,
//   regex: RegExp,
// }
module.exports = [
	require('./coinFlip'),
	require('./addPhrase'),
];
