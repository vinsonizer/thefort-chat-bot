const { App, LogLevel } = require("@slack/bolt");
const { WebClient } = require("@slack/web-api");
const schedule = require("node-schedule");
const q = require("./lib/commands/q");

require("dotenv").config();

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
  logLevel: LogLevel.INFO,
});

const token = process.env.SLACK_BOT_TOKEN;

const web = new WebClient(token);

app.command("/q", async ({ command, ack, say }) => {
  try {
    await ack();
    switch (command.text) {
      case "list":
        let AoList = await q.getTomorrowsAOs();
        say(JSON.stringify(AoList));
        break;
      default:
        say("Unrecognized command!");
    }
  } catch (error) {
    console.error(error);
  }
});

// Scheduled tasks for updates
async function scheduleTasks() {
  const everyFive = schedule.scheduleJob(
    "30 16 * * *",
    async function (fireDate) {
      console.log(`send at 16:30`);
      await web.chat.postMessage({
        text: "it is 16:30",
        channel: "#slack-tech",
      });
    }
  );
}

(async () => {
  const port = process.env.PORT || 3000;
  // Start your app
  await app.start(port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);

  //await scheduleTasks();
})();
