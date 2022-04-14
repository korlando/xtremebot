module.exports = [
	require('../commands/acronym'),
	require('../commands/coinFlip'),
	require('../commands/define'),
	require('../commands/listCommands'),
	require('../commands/status'),

	// phrases
	require('../commands/listPhrases'),
	require('../commands/addPhrase'),
	require('../commands/deletePhrase'),

	// markov
	require('../commands/listMarkov'),
	require('../commands/toggleMarkov'),
	require('../commands/addMarkov'),
	require('../commands/switchMarkov'),
];
