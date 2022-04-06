const { App } = require("@slack/bolt");

require("dotenv").config();
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

app.command("/q", async ({ command, ack, say }) => {
  try {
    await ack();
    say("I did the things");
  } catch (error) {
    console.error(error);
  }
});

app.message("/hey/", async ({ command, say }) => {
  try {
    say("it works");
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  const port = 3000;
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
