const fs = require('fs');
const qs = require('qs');
const WebSocket = require('websocket').client;

const services = {
	quote: 'QUOTE',
	option: 'OPTION',
};

class TDAmeritradeWebSocket {
	constructor(TDA) {
		this.TDA = TDA;
	}

	initialize = () => new Promise(async (resolve, reject) => {
		console.log('Establishing TD Ameritrade WebSocket connection...');
		// https://developer.tdameritrade.com/content/streaming-data
		const r = await this.TDA.getUserPrincipals('streamerSubscriptionKeys,streamerConnectionInfo');
		// converts ISO-8601 response in snapshot to ms since epoch accepted by streamer
		const tokenTimeStampAsDateObj = new Date(r.streamerInfo.tokenTimestamp);
		const tokenTimeStampAsMs = tokenTimeStampAsDateObj.getTime();

		const credentials = {
			userid: r.accounts[0].accountId,
			token: r.streamerInfo.token,
			company: r.accounts[0].company,
			segment: r.accounts[0].segment,
			cddomain: r.accounts[0].accountCdDomainId,
			usergroup: r.streamerInfo.userGroup,
			accesslevel: r.streamerInfo.accessLevel,
			authorized: 'Y',
			timestamp: tokenTimeStampAsMs,
			appid: r.streamerInfo.appId,
			acl: r.streamerInfo.acl,
		};

		const accountId = r.accounts[0].accountId;
		const appId = r.streamerInfo.appId;

		const request = {
			requests: [
				{
					service: 'ADMIN',
					command: 'LOGIN',
					requestid: 0,
					account: accountId,
					source: appId,
					parameters: {
						credential: qs.stringify(credentials),
						token: r.streamerInfo.token,
						version: '1.0',
					},
				},
			],
		};

		// save for future requests
		this.accountId = accountId;
		this.appId = appId;

		const conn = await this._connectWebSocket(`wss://${r.streamerInfo.streamerSocketUrl}/ws`);

		const handleMessage = (message) => {
			if (message.type !== 'utf8') {
				return;
			}
			const data = JSON.parse(message.utf8Data);
			if (
				data.response &&
				data.response[0].service === 'ADMIN' &&
				data.response[0].command === 'LOGIN'
			) {
				if (data.response[0].content.code === 0) {
					// login successful
					clearTimeout(this.timer);
					console.log('Successful login to TD Ameritrade WebSocket.');
					conn.removeListener('message', handleMessage);
					// save an internal reference to the WebSocket connection
					this.connection = conn;
					// resolve to let the caller know the WebSocket is ready
					resolve();
					return;
				}
				reject(new Error('Unable to login to TD Ameritrade WebSocket.'));
			}
		};

		conn.on('message', handleMessage);

		// authenticate
		conn.send(JSON.stringify(request));

		// set a 5-second rejection timer
		const sec = 5;
		this.timer = setTimeout(() => {
			reject(new Error(`Unable to receive a login response from TD Ameritrade WebSocket after ${sec} seconds.`));
		}, sec * 1000);
	});

	_connectWebSocket = (uri) => new Promise((resolve, reject) => {
		const ws = new WebSocket();

		ws.on('connectFailed', (error) => {
			console.error('TD Amertride WebSocket client failed to connect.');
			reject(error);
		});

		ws.on('connect', (conn) => {
			console.log('TD Ameritrade WebSocket client connected.');
			resolve(conn);
		});

		ws.connect(uri);
	});

	on = (event, callback) => {
		this.connection.on(event, callback);
	};

	send = (request) => {
		this.connection.send(JSON.stringify(request));
	};

	// symbols - array of strings
	// fields  - array of field nums; see below
	// 0  - Symbol        - String - Ticker symbol in upper case.
	// 1  - Bid Price     - float  - Current Best Bid Price
	// 2  - Ask Price     - float  - Current Best Ask Price
	// 3  - Last Price    - float  - Price at which the last trade was matched
	// 4  - Bid Size      - float  - Number of shares for bid
	// 5  - Ask Size      - float  - Number of shares for ask
	// 6  - Ask ID        - char   - Exchange with the best ask
	// 7  - Bid ID        - char   - Exchange with the best bid
	// 8  - Total Volume  - long  - Aggregated shares traded throughout the day, including pre/post market hours.
	// 9  - Last Size     - float - Number of shares traded with last trade
	// 10 - Trade Time    - int   - Trade time of the last trade
	// 11 - Quote Time    - int   - Trade time of the last quote
	// 12 - High Price    - float - Day’s high trade price
	// 13 - Low Price     - float - Day’s low trade price
	// 14 - Bid Tick      - char  - Indicates Up or Downtick (NASDAQ NMS & Small Cap)
	// 15 - Close Price   - float - Previous day’s closing price
	// 16 - Exchange ID   - char  - Primary "listing" Exchange
	// 17 - Marginable    - boolean - Stock approved by the Federal Reserve and an investor's broker as being
	//                                suitable for providing collateral for margin debt.
	// 18 - Shortable     - boolean - Stock can be sold short.
	// 22 - Quote Day     - int    - Day of the quote
	// 23 - Trade Day     - int    - Day of the trade
	// 24 - Volatility    - float  - Option Risk/Volatility Measurement
	// 25 - Description   - String - A company, index or fund name
	// 26 - Last ID       - char   - Exchange where last trade was executed
	// 27 - Digits        - int    - Valid decimal points
	// 28 - Open Price    - float  - Day's Open Price
	// 29 - Net Change    - float  - Current Last-Prev Close
	// 30 - 52  Week High - float  - Higest price traded in the past 12 months, or 52 weeks
	// 31 - 52 Week Low   - float  - Lowest price traded in the past 12 months, or 52 weeks
	// 32 - PE Ratio      - float
	// 33 - Dividend Amount      - float - Earnings Per Share
	// 34 - Dividend Yield       - float - Dividend Yield
	// 37 - NAV                  - float - Mutual Fund Net Asset Value
	// 38 - Fund Price           - float
	// 39 - Exchange Name        - String - Display name of exchange
	// 40 - Dividend Date        - String
	// 41 - Regular Market Quote - boolean - Is last quote a regular quote
	// 42 - Regular Market Trade - boolean - Is last trade a regular trade
	// 43 - Regular Market Last Price - float  - only records regular trade
	// 44 - Regular Market Last Size  - float  - Currently realize/100, only records regular trade
	// 45 - Regular Market Trade Time - int    - only records regular trade
	// 46 - Regular Market Trade Day  - int
	// 47 - Regular Market Net Change - float  - RegularMarketLastPrice - close
	// 48 - Security Status           - String - Indicates a symbols current trading status, Normal, Halted, Closed
	// 49 - Mark                      - double - Mark Price
	// 50 - Quote Time in Long        - Long   - Last quote time in milliseconds since Epoch
	// 51 - Trade Time in Long        - Long   - Last trade time in milliseconds since Epoch
	// 52 - Regular Market Trade Time - Long   - Regular market trade time in milliseconds since Epoch
	subscribeToQuote = (symbols, fields) => {
		// https://developer.tdameritrade.com/content/streaming-data#_Toc504640598
		const request = {
			requests: [
				{
					service: services.quote,
					requestid: '2',
					command: 'SUBS',
					account: this.accountId,
					source: this.appId,
					parameters: {
						keys: symbols.join(','),
						fields: fields.map((f) => String(f)).join(','),
					},
				},
			],
		};

		this.send(request);
	};

	subscribeToOption = (symbols, fields) => {
		// https://developer.tdameritrade.com/content/streaming-data#_Toc504640601
		const request = {
			requests: [
				{
					service: services.option,
					requestid: '3',
					command: 'SUBS',
					account: this.accountId,
					source: this.appId,
					parameters: {
						keys: symbols.join(','),
						fields: fields.map((f) => String(f)).join(','),
					},
				},
			],
		};

		this.send(request);
	};

	getAppendStream = (path) => fs.createWriteStream(path, { flags: 'a' });

	// service - 'QUOTE', 'OPTION'
	// symbols - [string]
	// fields  - [string]
	// path    - path of the folder to output the data logs
	logData = async (service, symbols, fields, path) => {
		// note... this function should only be instantiated once per service per session,
		// otherwise a second invocation will result in data written twice to multiple files
		console.log(`Initializing TD Ameritrade ${service.toLowerCase()} logger for symbols: ${symbols.join(', ')}.`);
		// use a reformatted ISO date string as the file name prefix (replace : with -)
		const fileName = `${new Date().toISOString().replace(/[:]/g, '-')}_${service.toLowerCase()}.json`;
		const filePath = `${path}/${fileName}`;

		// open a log file in append mode
		let stream = this.getAppendStream(filePath);
		// add the opening array symbol
		stream.write('[');
		stream.end();

		this.on('error', (error) => {
			console.log(`TD Ameritrade WebSocket connection error: ${error.toString()}`);
		});

		this.on('close', () => {
			console.log('TD Ameritrade WebSocket client closed.');
			// add the ending array symbol
			stream = this.getAppendStream(filePath);
			stream.write(']');
			stream.end();
			// TODO - this doesn't quite work if the client terminates the process w/o a clean-up procedure
		});

		let count = 0;
		this.on('message', (message) => {
			if (message.type !== 'utf8') {
				return;
			}
			try {
				const d = JSON.parse(message.utf8Data);
				// ensure we're handling a message with a service we're responsible for (QUOTE or OPTION)
				if (!d.data || d.data[0].service !== service) {
					return;
				}
				// append data to the log
				const stream = this.getAppendStream(filePath);
				// remove 'command' and 'service' keys to save space
				delete d.data[0].command;
				delete d.data[0].service;
				const prependComma = count > 0;
				stream.write((prependComma ? ',' : '') + JSON.stringify(d.data[0]));
				stream.end();
				count += 1;
			} catch (e) {
				console.error(e);
			}
		});

		// subscribe to the data
		switch (service) {
			case services.quote:
				this.subscribeToQuote(symbols, fields);
				break;
			case services.option:
				this.subscribeToOption(symbols, fields);
				break;
		}
	};

	logQuoteData = async (symbols, fields, path) => {
		await this.logData(services.quote, symbols, fields, path);
	};

	logOptionData = async (symbols, fields, path) => {
		await this.logData(services.option, symbols, fields, path);
	};
}

module.exports = TDAmeritradeWebSocket;
