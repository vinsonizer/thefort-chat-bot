require("dotenv").config();

var config = {
  wp: {
    username: process.env.WP_USERNAME,
    password: process.env.WP_PASSWORD,
    apikey: process.env.WP_APIKEY,
    baseurl: process.env.WP_BASEURL,
  },
};

module.exports = config;
