run:
	pm2 start server.js --name="xtremebot" -- -p 8008 --slack --discord
runslack:
	pm2 start server.js --name="xtremebot-slack" -- -p 8008 --slack
rundiscord:
	pm2 start server.js --name="xtremebot-discord" -- -p 8009 --discord
runtrading:
	pm2 start server.js --name="xtremebot-trading" -- -p 8010 --trading
