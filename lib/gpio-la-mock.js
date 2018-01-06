module.exports = {
  emulatedPins: new Array(50),
  getPinStateById: function (pin, callback) {
    callback(this.emulatedPins[pin]);
  },
  setPinByIdToState: function (pin, state, callback) {
    this.emulatedPins[pin] = state;
    callback(this.emulatedPins[pin]);
  },
  init: function (config, callback) {
    this.initPinsWith(0);
    if (callback) {
      callback();
    }
  },
  initPinsWith: function (value) {
    var i;
    for (i = 0; i < this.emulatedPins.length; i++) {
      this.emulatedPins[i] = value;
    }
  },
  name: 'mock',
};
