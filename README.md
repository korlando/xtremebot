# XtremeBot

## About
XtremeBot is a Node.js-powered bot for Slack and Discord.

## Installation
[Node.js](https://nodejs.org) v16.13.0 or newer is required. A MongoDB database connection is also required to persist application data such as bot settings, user information, commands, and markov chain frequency tables.

Install dependencies:

```sh-session
npm install
yarn install
```

The latest release uses [@slack/events-api](https://www.npmjs.com/package/@slack/events-api) v3.0.1, [@slack/web-api](https://www.npmjs.com/package/@slack/web-api) v6.6.0, and [discord.js](https://www.npmjs.com/package/discord.js) v13.6.0.

Set your MongoDB connection URI string with the environment variable `XTREMEBOT_MONGO_URI`.

```sh-session
export XTREMEBOT_MONGO_URI="mongodb+srv://your-uri-here"
```

The server will throw an error if this variable is not set. MongoDB connections and queries are currently handled with [Mongoose](https://www.npmjs.com/package/mongoose) v6.2.1.

## Configuration

Slack and Discord bots are defined in the file `bot-manifest.js`. The most basic form would be:

```js
module.exports = {
	slack: {
		bots: [
			{
				apiToken: process.env.YOUR_SLACK_API_TOKEN_HERE,
			},
		],
	},
	discord: {
		bots: [
			{
				apiToken: process.env.YOUR_DISCORD_API_TOKEN_HERE,
			},
		],
	},
};
```

The `apiToken` field is required for all bots since the server uses it to connect to the Slack and Discord clients.

## Running Xtremebot

```sh-session
node server.js --slack --discord
```

You can specify one or both of `--slack` and `--discord` flags to connect Slack and Discord clients respectively. If no flags are provided, the server won't connect to either.

XtremeBot runs on port 8008 by default, but this can be changed with the `-p` flag:

```sh-session
node server.js -p 7777 --slack --discord
```