// Run this server to listen for Slack events and/or
// connect to Discord clients to power bots.

process.on('uncaughtException', (err) => {
	console.log(`uncaughtException: ${err}\n${err.stack}`);
	process.exit(1);
});

const bodyParser = require('body-parser');
const helmet = require('helmet');
const http = require('http');
const express = require('express');
const path = require('path');

// mongoose is a dependency to persist data managed by bots
const bluebird = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = bluebird;

const app = express();

app.disable('x-powered-by');
app.use(helmet.xssFilter());
app.use(helmet.frameguard('deny'));

// process arguments
const argv = require('minimist')(process.argv.slice(2));
const port = Number(argv.p) || Number(argv.port) || 8008;
const production = Boolean(argv.production);
const runDiscord = Boolean(argv.discord);
const runSlack = Boolean(argv.slack);
const runTrading = Boolean(argv.trading);

if (runDiscord) {
	// requiring discord will run new Discord clients
	require('./src/discord');
}

if (runTrading) {
	require('./src/trading');
}

app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	next();
});

const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', () => {
	console.log(`Server listening on port ${port}`);
});

if (runSlack) {
	// instead of 'running' a slack client, we listen for slack events
	const slackRoutes = require('./src/routes/slack');
	app.use('/slack', slackRoutes);
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	if (err.status === 404) {
		res.end();
		return;
	}
	res.json({ message: err.message });
});

// Event listener for HTTP server "error" event.
function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}
	const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
	// handle specific listen errors with friendly messages
	switch (error.code) {
	case 'EACCES':
		console.error(bind + ' requires elevated privileges');
		process.exit(1);
		break;
	case 'EADDRINUSE':
		console.error(bind + ' is already in use');
		process.exit(1);
		break;
	default:
		throw error;
	}
}
