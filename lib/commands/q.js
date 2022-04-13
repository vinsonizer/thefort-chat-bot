const wp = require("../integration/worshipplanning");

var q = {};

const getNextSchedule = async function (days) {
  let events = await wp.getEvents(days * 10);
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + days);
  return events.filter((item) => {
    return item.date <= tomorrow;
  });
};

q.getTomorrowsAOs = async () => {
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  let aos = await getNextSchedule(1);
  return aos;
};

module.exports = q;
