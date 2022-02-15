const TDAmeritradeAPI = require('./td-ameritrade-api');
const fs = require('fs');

// symbols - [string]
// fields - [string]
// path - path of the folder to output the data logs
const quoteDataLogger = async (symbols, fields, path) => {
	const TDA = new TDAmeritradeAPI(
		process.env.TD_AMERITRADE_CLIENT_ID,
		process.env.TD_AMERITRADE_REDIRECT_URI,
		process.env.TD_AMERITRADE_REFRESH_TOKEN,
	);
	await TDA.initialize();

	console.log(`Initializing TD Ameritrade data logger for symbols: ${symbols.join(', ')}.`);

	// establish a WebSocket connection
	try {
		const ws = await TDA.getWebSocketConnection();
		// use a reformatted ISO date string as the file name prefix (replace : with -)
		const fileName = `${new Date().toISOString().replace(/[:]/g, '-')}_${symbols.join('-')}.json`;
		const filePath = `${path}/${fileName}`;
		// open a log file in append mode
		let stream = fs.createWriteStream(filePath, { flags: 'a' });
		// add the opening array symbol
		stream.write('[');
		stream.end();

		ws.on('error', (error) => {
			console.log(`TD Ameritrade WebSocket connection error: ${error.toString()}`);
		});

		ws.on('close', () => {
			console.log('TD Ameritrade WebSocket client closed.');
			// add the ending array symbol
			stream = fs.createWriteStream(filePath, { flags: 'a' });
			stream.write(']');
			stream.end();
		});

		let count = 0;
		ws.on('message', (message) => {
			if (message.type === 'utf8') {
				try {
					const data = JSON.parse(message.utf8Data);
					if (data.data) {
						// append data to the log
						stream = fs.createWriteStream(filePath, { flags: 'a' });
						stream.write((count > 0 ? ',' : '') + JSON.stringify(data.data[0]));
						stream.end();
						count += 1;
					}
				} catch (e) {
					console.error(e);
				}
			}
		});

		// subscribe to the data
		ws.subscribeToQuote(symbols, fields);
	} catch (e) {
		console.error(e);
	}
};

module.exports = quoteDataLogger;
