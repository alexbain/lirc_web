var gpio = require('../../lib/gpio');
var assert = require('assert');
var gpioProbe = require('./../../lib/gpio-la-mock.js');

var config = [
  { name: 'a', pin: 47, state: 0 },
  { name: 'b', pin: 11, state: 0 }];

describe('gpio', function () {
  before(function () {
    gpioProbe.initPinsWith(0);
    gpio.setGpioLibrary(gpioProbe);
    gpio.init(config);
  });

  describe('updatePinStates', function () {
    it('should update all pin states', function (done) {
      gpioProbe.initPinsWith(1);
      gpio.updatePinStates(config, function (result) {
        assert.deepEqual(
          result,
          [{ name: 'a', pin: 47, state: 1 },
            { name: 'b', pin: 11, state: 1 }],
          'states are not updated properly');
        done();
      });
    });
  });

  describe('togglePin', function () {
    it('should change active pin to inactive', function (done) {
      gpioProbe.initPinsWith(1);
      gpio.togglePin(47, function (res) {
        assert.deepEqual(
          res,
          { pin: 47, state: 0 },
          'pin has not changed its state');
        done();
      });
    });

    it('should change inactive pin to active', function (done) {
      gpioProbe.initPinsWith(0);
      gpio.togglePin(47, function (res) {
        assert.deepEqual(
          res,
          { pin: 47, state: 1 },
          'pin has not changed its state');
        done();
      });
    });
  });

  describe('setPin', function () {
    it('should set a pin by name to the given value', function (done) {
      gpioProbe.initPinsWith(0);
      gpio.setPin('a', 1, function () {
        assert.equal(gpioProbe.emulatedPins[47], 1);
        gpio.setPin('a', 1, function () {
          assert.equal(gpioProbe.emulatedPins[47], 1);
          gpio.setPin('a', 0, function () {
            assert.equal(gpioProbe.emulatedPins[47], 0);
            done();
          });
        });
      });
    });
  });
});

// vim: expandtab:tabstop=8:softtabstop=2:shiftwidth=2
