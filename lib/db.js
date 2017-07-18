
var DBFirebase = require('./db-firebase');

module.exports = function (options) {
  switch (options.type) {
    case "firebase":
      return new DBFirebase(options);
    default:
      console.error("Invalid backend specified", options.type, options);
  }
}

