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
  logLevel: LogLevel.DEBUG,
});

const token = process.env.SLACK_BOT_TOKEN;

const web = new WebClient(token);

// Listen for users opening your App Home
app.event("app_home_opened", async ({ event, client, logger }) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const schedule = await q.getTomorrowsAOs(); // FIXME: not hardcoded date
    var qList = schedule
      .map((ao) => {
        return `*${ao.location}:* ${ao.q}`;
      })
      .join("\n");
    // Call views.publish with the built-in client
    const result = await client.views.publish({
      // Use the user ID associated with the event
      user_id: event.user,
      view: {
        // Home tabs must be enabled in your app configuration page under "App Home"
        type: "home",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Welcome home, <@${event.user}> :house:*`,
            },
          },
          {
            type: "divider",
          },
          {
            type: "input",
            element: {
              type: "datepicker",
              initial_date: `${tomorrow.getFullYear()}-${
                tomorrow.getMonth() + 1
              }-${tomorrow.getDate()}`,
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "datepicker-action",
            },
            label: {
              type: "plain_text",
              text: "Plan your Post:",
              emoji: true,
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Q's on deck:*\n ${qList}`,
              },
            ],
          },
        ],
      },
    });

    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

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
