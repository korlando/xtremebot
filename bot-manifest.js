module.exports = {
	slack: {
		bots: [
			{
				apiToken: process.env.TEST_WELCOMEBOT_SLACK_TOKEN,
				messageMiddlewares: {
					ignoreDoubleParens: true,
				},
			},
			{
				apiToken: process.env.TEST_PHRASEBOT_SLACK_TOKEN,
			},
			{
				apiToken: process.env.MK_XTREMEBOT_SLACK_TOKEN,
				messageMiddlewares: {
					ignoreDoubleParens: true,
				},
			},
			{
				apiToken: process.env.NXJ_PHRASEBOT_SLACK_TOKEN,
				commandTrigger: process.env.PHRASEBOT_TRIGGER,
				messageMiddlewares: {
					whitelistUsers: process.env.PHRASEBOT_USERS,
					ignoreDoubleParens: true,
				},
				forceDisableUpdateMarkov: true,
			},
			{
				apiToken: process.env.SMITH_LIVE_XTREMEBOT_TOKEN,
				commandTrigger: process.env.SMITH_LIVE_XTREMEBOT_TRIGGER,
				messageMiddlewares: {
					ignoreDoubleParens: true,
				},
			},
		],
	},
	discord: {
		bots: [
			{
				apiToken: process.env.DISCORD_TGL_BOT_TOKEN,
				commandTrigger: process.env.SMITH_LIVE_XTREMEBOT_TRIGGER,
			},
		],
	},
};
