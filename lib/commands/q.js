const wp = require("../integration/worshipplanning");

var q = {};

q.getTomorrowsAOs = async () => {
  let answer = await wp.getEvents();
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return answer.data
    .map((item) => {
      return {
        name: item.location,
        date: eval(item.worshipDate), // EVIL
      };
    })
    .filter((item) => {
      return item.date <= tomorrow;
    })
    .map((ao) => {
      return {
        type: "button",
        value: ao.name,
      };
    });
};

module.exports = q;
