var gpioLib = require('gpio');
var pinStubs = {};

function configurePin(pinConfig, callback) {
  var stub = gpioLib.export(pinConfig.pin, {
    direction: 'out',
    interval: 500,
    ready: callback,
  });
  pinStubs['' + pinConfig.pin] = stub;
}

exports.init = function (config, callback) {
  var configsLeft = config.length;
  var i;
  function collector() {
    configsLeft -= 1;
    if (configsLeft === 0) {
      if (callback) callback();
    }
  }
  for (i = 0; i < config.length; i++) {
    configurePin(config[i], collector);
  }
};

exports.getPinStateById = function (pinId, callback) {
  var result = pinStubs['' + pinId].value;
  if (callback) {
    callback(result);
  }
};

exports.setPinByIdToState = function (pinId, newState, callback) {
  var stub = pinStubs['' + pinId];
  stub.set(newState, function () {
    if (callback) {
      callback(stub.value);
    }
  });
};

exports.name = 'gpio';
