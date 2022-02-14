const qs = require('qs');
const WebSocket = require('websocket').client;

class TDAmeritradeWebSocket {
	constructor(TDA) {
		this.TDA = TDA;
	}

	initialize = async () => {
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
		// authenticate
		conn.send(JSON.stringify(request));

		// save an internal reference to the WebSocket connection
		this.connection = conn;
	};

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
}

module.exports = TDAmeritradeWebSocket;
