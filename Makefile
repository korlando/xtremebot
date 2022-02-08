run:
	pm2 start server.js --name="XtremeBot" -- -p 8008 --slack --discord
runslack:
	pm2 start server.js --name="XtremeBot Slack" -- -p 8008 --slack
rundiscord:
	pm2 start server.js --name="XtremeBot Discord" -- -p 8009 --discord
