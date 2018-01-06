var DEVICE_NAME = 'gpio';
var gpios = null;
var gpioLibrary = null;

function fetchPinByIndex(pinsToRead, pinIdx, callback) {
  var pin = pinsToRead[pinIdx];
  gpioLibrary.getPinStateById(pin.pin, function (result) {
    pin.state = result;
    callback();
  });
}

function updatePinStates(pinsToRead, callback) {
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
      fetchPinByIndex(pinsToRead, i, collector);
    }
  }
}

function togglePin(pinId, callback) {
  var numericPinId = parseInt(pinId, 10);
  gpioLibrary.getPinStateById(numericPinId, function (currentState) {
    var newState = currentState > 0 ? 0 : 1;
    gpioLibrary.setPinByIdToState(numericPinId, newState, function (result) {
      if (callback) {
        callback({
          pin: numericPinId,
          state: result,
        });
      }
    });
  });
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

function setPin(pinName, newState, callback) {
  var numericPinId = getPinIdByName(pinName);
  gpioLibrary.setPinByIdToState(numericPinId, newState, callback);
}

function init(configuration, callback) {
  if (configuration) {
    gpios = configuration;
    gpioLibrary.init(configuration, function () {
      updatePinStates(gpios, function (result) {
        gpios = result;
        if (callback) {
          callback();
        }
      });
    });
  }
}

function setGpioLibrary(newGpioLibrary) {
  gpioLibrary = newGpioLibrary;
}

function call(done, command) {
  setPin(command[1], command[2], function () {});
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
