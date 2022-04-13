/* jslint node: true */
/* jshint esversion: 9 */
"use strict";

const config = require("../config");
const request = require("request");
var wp = {};

const BASEHEADERS = {
  "content-type": "application/json",
  key: `${config.wp.apikey}`,
};

function addToken(headers, token) {
  headers.authorization = token;
  return headers;
}

wp.getEvents = async function (count = 10) {
  const token = await login();

  const httpOpts = {
    url: "",
    headers: addToken(BASEHEADERS, token),
    json: {},
  };

  let events = await callService({
    ...httpOpts,
    ...{
      url: `${config.wp.baseurl}/events?perPage=${count}`,
    },
  });

  // enrich with assignment data
  let assignments = await Promise.all(
    events.data.map(async (theEvent) => {
      let assignment = await callService({
        ...httpOpts,
        ...{
          url: `${config.wp.baseurl}/eventAssignments/forEvent/${theEvent.id}`,
        },
      });
      return mapEvent(theEvent, assignment);
    })
  );

  return assignments.filter((item) => {
    return item.q.length > 0;
  });
};

const mapEvent = (theEvent, assignment) => {
  return {
    location: theEvent.location,
    date: eval(theEvent.worshipDate), // EVIL!!!
    q: assignment
      .filter((q) => {
        /*
      10 = pending
       20 = accepted
       40 = tentatively accepted
      */
        return q.status === 10 || q.status === 20 || q.status === 40;
      })
      .map((q) => {
        return q.assigneeName.substring(0, q.assigneeName.indexOf("(")).trim();
      }),
  };
};

const login = () => {
  var options = {
    url: `${config.wp.baseurl}/authentication/login`,
    headers: BASEHEADERS,
    json: {
      username: `${config.wp.username}`,
      password: `${config.wp.password}`,
    },
  };
  return callService(options, (body) => body.token);
};

const callService = (opts, handler) => {
  return new Promise((resolve, reject) => {
    request(opts, function (err, response, body) {
      if (response.statusCode != 200 || err) {
        let result = err || response.statusMessage;
        reject(result);
      }
      if (handler) resolve(handler(body));
      else resolve(body);
    });
  });
};

module.exports = wp;
