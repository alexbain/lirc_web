var DEVICE_NAME = 'gpio';
var gpioLibrary = require('./gpio-la-mock');
var gpios = null;

function fetchPinByIndex(callback, pinsToRead, pinIdx) {
  var pin = pinsToRead[pinIdx];
  gpioLibrary.getPinStateById(function (result) {
    pin.state = result;
    callback();
  }, pin.pin, callback);
}

function updatePinStates(callback, pinsToRead) {
  var toCollect = pinsToRead.length;
  var collector = function () {
    if (--toCollect === 0) {
      if (callback) {
        callback(pinsToRead);
      }
    }
  };

  var i;
  if (pinsToRead) {
    for (i = 0; i < pinsToRead.length; i++) {
      fetchPinByIndex(collector, pinsToRead, i);
    }
  }
}

function togglePin(callback, pinId) {
  var numericPinId = parseInt(pinId, 10);
  gpioLibrary.getPinStateById(function (currentState) {
    var newState = currentState > 0 ? 0 : 1;
    gpioLibrary.setPinByIdToState(function (result) {
      if (callback) {
        callback({
          pin: numericPinId,
          state: result,
        });
      }
    }, numericPinId, newState);
  }, numericPinId);
}

function findElement(array, propertyName, propertyValue) {
  var i;
  for (i = 0; i < array.length; i++) {
    if (array[i][propertyName] === propertyValue) {
      return array[i];
    }
  }
}

function getPinIdByName(pinName) {
  var gpioPin = findElement(gpios, 'name', pinName);
  return gpioPin.pin;
}

function setPin(callback, pinName, newState) {
  var numericPinId = getPinIdByName(pinName);
  gpioLibrary.setPinByIdToState(callback, numericPinId, newState);
}

function init(configuration, callback) {
  if (configuration) {
    gpios = configuration;
    gpioLibrary.init(function () {
      updatePinStates(function (result) {
        gpios = result;
        if (callback) {
          callback();
        }
      }, gpios);
    }, configuration);
  }
}

function setGpioLibrary(newGpioLibrary) {
  gpioLibrary = newGpioLibrary;
}

function call(done, command) {
  setPin(function () {}, command[1], command[2]);
  done();
}

function validateArguments(args) {
  var deviceName = args[0];
  var pinName = args[1];
  var state = args[2];
  var returnString = null;

  if (deviceName !== DEVICE_NAME) {
    returnString = '\'gpio\' is required as first argument';
  } else if (! findElement(gpios, 'name', pinName)) {
    returnString = 'No GPIO Pin configured with name ' + pinName;
  } else if (state !== 0 && state !== 1) {
    returnString = 'Illegal state ' + state;
  } else if (args.length > 3) {
    returnString = 'Extra argument';
  }
  return returnString === null ? null : returnString + ' in macro step ' + JSON.stringify(args);
}


module.exports = {
  name: DEVICE_NAME,
  setGpioLibrary: setGpioLibrary,
  init: init,
  updatePinStates: updatePinStates,
  setPin: setPin,
  togglePin: togglePin,
  validateArguments: validateArguments,
  call: call,
};
// vim: expandtab:tabstop=8:softtabstop=2:shiftwidth=2
