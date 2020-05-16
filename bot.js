'use strict';

// const AWS = require('aws-sdk')
const Slack = require('slack')

module.exports.run = async (data) => {
  var dataObject = JSON.parse(data.body)

  let result = {
    statusCode: 200,
    body: {},
    headers: {'X-Slack-No-Retry': 1}
  }

  try {
    // prevent retries due to cold starts
    if(!('X-Slack-Retry-Num' in data.headers)) {
      switch(dataObject.type) {
        case 'url_verification': 
          result.body = handleChallenge(dataObject)
          break
        case 'event_callback':
          await handleEventCallback(dataObject.event)
          result.body = {ok: true}
          break
        default:
          console.log(`got request for type ${dataObject.type}`)
          break
      }
    }
  } catch (err) {
    result.statusCode = 500
    result.body = JSON.stringify(err)
  }
  return result
}

function handleChallenge(data) {
  if(data.token === process.env.VERIFICATION_TOKEN) {
    return data.challenge
  } else {
    throw new Error('Verification Failed')
  }
}

async function handleEventCallback(message) {
  if (!message.bot_id) {
    // trim bot name
    var text = message.text.substr(message.text.indexOf(' ')+1)
    sendSlackMessage(message.channel, text)
  }
}

async function sendSlackMessage(channel, message) {
  const params = {
    token: process.env.BOT_TOKEN,
    channel: channel,
    text: message
  }
  return Slack.chat.postMessage(params)
}

