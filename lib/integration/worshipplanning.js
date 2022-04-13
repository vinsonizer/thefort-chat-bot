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
  // login to the service for the auth token
  let result = await login()
    .then((token) => {
      const httpOpts = {
        url: "",
        headers: addToken(BASEHEADERS, token),
        json: {},
      };
      return callService({
        ...httpOpts,
        ...{ url: `${config.wp.baseurl}/events?perPage=${count}` },
      });
    })
    .catch((err) => {
      throw new Error(err);
    });

  return result;
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
