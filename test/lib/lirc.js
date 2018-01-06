var lirc = require('../../lib/lirc');
var assert = require('assert');
var sinon = require('sinon');

var XBOX_COMMANDS = ['Y', 'X', 'A', 'B'];
var SONY_COMMANDS = ['Power', 'VolumeUp', 'VolumeDown', 'TeleTubbies'];
var FILTERED_SONY_COMMANDS = ['Power', 'VolumeUp', 'VolumeDown'];
var YAMAHA_COMMANDS = ['Power', 'VolumeUp', 'VolumeDown'];

var REMOTES_LIST = {
  Yamaha: YAMAHA_COMMANDS,
  SonyTV: SONY_COMMANDS,
  Xbox360: XBOX_COMMANDS,
};

var FILTERED_REMOTES_LIST = {
  Yamaha: YAMAHA_COMMANDS,
  SonyTV: FILTERED_SONY_COMMANDS,
  Xbox360: XBOX_COMMANDS,
};

var CONFIG = {
  blacklists: {
    SonyTV: [
      'TeleTubbies',
    ],
  },
};

var deviceMock;

function getDeviceMock(remotes) {
  var newMock = {
    remotes: {},
    irsend: {},
  };
  newMock.init = function (callback) { callback(); };
  newMock.irsend.send_once = sinon.spy();
  newMock.irsend.send_start = sinon.spy();
  newMock.irsend.send_stop = sinon.spy();
  newMock.remotes = remotes;
  return newMock;
}

function replaceLircByMock() {
  deviceMock = getDeviceMock();
  deviceMock.remotes = REMOTES_LIST;
  lirc.overrideHardware(deviceMock);
}

describe('lirc binding', function () {
  before(function () {
    replaceLircByMock();
    lirc.init(CONFIG);
  });

  describe('remotes', function () {
    it('should give a list of all known remotes and their filtered commands', function () {
      assert.deepEqual(lirc.getRemotes(), FILTERED_REMOTES_LIST);
    });

    it('should give a list of commands of a known remote', function () {
      assert.deepEqual(lirc.getCommandsForRemote('Xbox360'), XBOX_COMMANDS);
    });

    it('should give a shortened list of commands if a blacklist is set', function () {
      lirc.init(CONFIG);
      assert.deepEqual(lirc.getCommandsForRemote('SonyTV'), ['Power', 'VolumeUp', 'VolumeDown']);
    });
  });

  describe('macro support', function () {
    it('should reject a command, if the number of arguments does not fit', function () {
      assert.notEqual(lirc.validateArguments(['SonyTV', 'VolumeUp', 'extra']), null,
        'known remote, command, extra arg');
      assert.notEqual(lirc.validateArguments(['lirc', 'SonyTV', 'VolumeUp', 'extra']), null,
        'device key, known remote, command, extra arg');
      assert.notEqual(lirc.validateArguments(['lirc', 'SonyTV']), null,
        'device key, known remote, missing command');
    });

    it('should accpet a command, if the number of arguments fits', function () {
      assert.equal(lirc.validateArguments(['lirc', 'SonyTV', 'VolumeUp']), null,
        'device key, known remote, command');
      assert.equal(lirc.validateArguments(['SonyTV', 'VolumeUp']), null,
        'known remote, command');
    });

    it('should call lircNode.irsend.send_once when call is performed', function () {
      var callback = sinon.spy();
      deviceMock.irsend.send_once = sinon.spy();
      lirc.call(callback, ['lirc', 'SonyTV', 'VolumeUp']);
      assert.deepEqual(deviceMock.irsend.send_once.lastCall.args, ['SonyTV', 'VolumeUp', callback]);
      lirc.call(callback, ['SonyTV', 'VolumeUp']);
      assert.deepEqual(deviceMock.irsend.send_once.lastCall.args, ['SonyTV', 'VolumeUp', callback]);
    });
  });
});

module.exports = {
  getDeviceMock: getDeviceMock,
  replaceLircByMock: replaceLircByMock,
};
// vim: expandtab tabstop=8 softtabstop=2 shiftwidth=2
