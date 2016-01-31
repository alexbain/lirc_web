// var wpi = require('wiring-pi');
var wpi = {
  setup: function () {},
  digitalRead: function () {},
  digitalWrite: function () {},
};

exports.init = function (callback) {
  wpi.setup('gpio');
  if (callback) callback();
};

exports.getPinStateById = function (callback, pinId) {
  var result = wpi.digitalRead(pinId);
  if (callback) {
    callback(result);
  }
};

exports.setPinByIdToState = function (callback, pinId, newState) {
  wpi.digitalWrite(pinId, newState);
  if (callback) {
    callback(newState);
  }
};
