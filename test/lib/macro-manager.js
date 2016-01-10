var sinon = require('sinon');
var assert = require('assert');
var macros = require('../../lib/macro-manager');

var deviceMock;

var CONFIG_HELLO_WORLD = [{
  name: 'hello world',
  sequence: [
    ['say', 'hello'],
    ['say', 'world'],
  ],
}];

var CONFIG_DELAYED_HELLO_WORLD = [{
  name: 'hello world',
  defaultDelay: 42,
  sequence: [
    ['say', 'hello'],
    ['say', 'world'],
  ],
}];

var CONFIG_HELLO_STATES = [{
  name: 'hello!',
  provides: 'hello',
  sequence: [
    ['say', 'hello'],
  ],
}, {
  name: 'world!',
  requires: 'hello',
  sequence: [
    ['say', 'world'],
  ],
}, {
  name: 'goodbye!',
  resets: 'hello',
  sequence: [
    ['say', 'goodbye'],
  ],
}, {
  name: 'something',
  resets: 'world',
  sequence: [
    ['say', 'goodbye'],
  ],
}];

var CONFIG_HELLO = [
  {
    name: 'hello',
    sequence: [
      ['say', 'hello'],
    ],
  }, {
    name: 'world',
    hidden: false,
    sequence: [
      ['say', 'world'],
    ],
  }, {
    name: '!',
    hidden: true,
    sequence: [
      ['say', '!'],
    ],
  },
];

var CONFIG_DELEGATE = [
  {
    name: 'exclamationmark',
    hidden: true,
    provides: 'worldIsGreeted',
    sequence: [
      ['say', '!'],
    ],
  }, {
    name: 'world',
    hidden: true,
    sequence: [
      ['say', 'world'],
      ['call', 'exclamationmark'],
    ],
  }, {
    name: 'hello',
    hidden: false,
    sequence: [
      ['say', 'hello'],
      ['call', 'world'],
    ],
  },
];

var CONFIG_MULTI_DELEGATE = [
  {
    name: 'hello',
    hidden: true,
    sequence: [
      ['say', 'hello'],
    ],
  }, {
    name: 'world',
    hidden: true,
    sequence: [
      ['say', 'world'],
    ],
  }, {
    name: 'exclamationmark',
    hidden: true,
    sequence: [
      ['say', '!'],
    ],
  }, {
    name: 'multi delegate',
    sequence: [
      ['call', 'hello'],
      ['call', 'world'],
      ['call', 'exclamationmark'],
    ],
  },
];

var CONFIG_360 = [{
  name: 'Play XBOX 360',
  sequence: [
    ['SonyTV', 'Power'],
    ['SonyTV', 'Xbox360'],
    ['Yamaha', 'Power'],
    ['Yamaha', 'Xbox360'],
    ['Xbox360', 'Power'],
  ],
}];

var CONFIG_DELAY_500 = [{
  name: 'macro with delay',
  sequence: [
    ['delay', 500],
    ['say', 'yay'],
  ],
}];

var CONFIG_UNKNOWN_DEVICE = [{
  name: 'dont care',
  sequence: [
    ['reject', 'a'],
  ],
}];

function createDeviceMock(deviceName) {
  return {
    operations: [],
    expectedArgs: null,
    name: deviceName,
    call: function (done, args) {
      this.operations.push(args);
      done();
    },
    validateArguments: function (args) {
      if (this.expectedArgs !== null) {
        if (args.length !== this.expectedArgs.length) {
          return 'wrong argument count' + args.length;
        }
        if (args !== this.expectedArgs) {
          return 'illegal arguments';
        }
      }
      if (args[0] !== this.name) {
        return 'not for me!';
      }
      return null;
    },
  };
}

describe('macros', function () {
  var clock;
  var spy;

  function resetMockAndFixture() {
    deviceMock.expectedArgs = null;
    deviceMock.operations = [];
    macros.resetConfiguration();
    macros.registerDevice(deviceMock);
  }

  before(function () {
    deviceMock = createDeviceMock('say');
    spy = sinon.spy(deviceMock, 'call');
  });

  describe('configuration', function () {
    beforeEach(function () {
      resetMockAndFixture();
    });

    it('should reject a macro with a command for a unknown device', function () {
      assert.throws(function () {macros.init(CONFIG_UNKNOWN_DEVICE);}, Error);
    });

    it('should accept a macro with a command for a unknown device if catch all exists and accepts',
    function () {
      var myNewDevice = createDeviceMock('remotes');
      myNewDevice.validateArguments = function (args) {
        var deviceName = args[0];
        var knownDevices = { SonyTV: true, Xbox360: true, Yamaha: true };
        if (!knownDevices[deviceName]) {
          return 'remote not known.';
        }
        return null;
      };
      macros.registerDevice(myNewDevice);
      macros.init(CONFIG_360);
    });

    it('should reject a macro with a invalid argument count for', function () {
      deviceMock.expectedArgs = ['shu', 'bidu'];
      assert.throws(function () {macros.init(CONFIG_HELLO_WORLD);}, Error);
    });

    it('should reject a macro with a invalid argument content', function () {
      deviceMock.expectedArgs = ['hoo'];
      assert.throws(function () {macros.init(CONFIG_HELLO_WORLD);}, Error);
    });

    it('should accept a macro with valid or unchecked arguments', function () {
      macros.init(CONFIG_HELLO_WORLD);
    });
  });

  describe('builtin delay', function () {
    beforeEach(function () {
      resetMockAndFixture();
      clock = sinon.useFakeTimers();
      spy.reset();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should use delay when encountering a delay', function (done) {
      macros.init(CONFIG_DELAY_500);
      macros.execute(CONFIG_DELAY_500[0].name);

      assert.equal(spy.called, false);

      //  not enough time has passed, stub should not have been called
      clock.tick(250);
      assert.equal(spy.called, false);

      //  enough time has now passed, macro should have tried to execute next command
      clock.tick(250);
      assert.equal(spy.called, true);
      done();
    });

    it('should use standard delay of 50 when no delay is configured', function (done) {
      macros.init(CONFIG_HELLO_WORLD);
      macros.execute(CONFIG_HELLO_WORLD[0].name);

      // first macro step has no delay
      assert(spy.calledOnce);

      //  not enough time has passed, to reach the second step
      clock.tick(49);
      assert(spy.calledOnce);

      //  enough time has now passed, macro should have tried to execute second command
      clock.tick(1);
      assert(spy.calledTwice);
      done();
    });

    it('should use modified delay of 42 when configured to do so', function (done) {
      macros.init(CONFIG_DELAYED_HELLO_WORLD);
      macros.execute(CONFIG_DELAYED_HELLO_WORLD[0].name);

      // first macro step has no delay
      assert(spy.calledOnce);

      //  not enough time has passed, to reach the second step
      clock.tick(41);
      assert(spy.calledOnce);

      //  enough time has now passed, macro should have tried to execute second command
      clock.tick(1);
      assert(spy.calledTwice);
      done();
    });
  });

  describe('devices', function () {
    it('should accept registrations', function () {
      macros.registerDevice(deviceMock);
    });
  });

  describe('execution', function () {
    beforeEach(function () {
      resetMockAndFixture();
      clock = sinon.useFakeTimers();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should accept a macro name for execution', function () {
      macros.init(CONFIG_HELLO_WORLD);
      macros.execute('hello world');
      clock.tick(250);
      assert.deepEqual(deviceMock.operations,
        [['say', 'hello'], ['say', 'world']]);
    });

    it('should call other macros daisychained', function () {
      macros.init(CONFIG_DELEGATE);
      macros.execute('hello');
      clock.tick(250);
      assert.deepEqual(deviceMock.operations,
        [['say', 'hello'], ['say', 'world'], ['say', '!']]);
    });

    it('should call other macros composed', function () {
      macros.init(CONFIG_MULTI_DELEGATE);
      macros.execute('multi delegate');
      clock.tick(250);
      assert.deepEqual(deviceMock.operations,
        [['say', 'hello'], ['say', 'world'], ['say', '!']]);
    });
  });

  describe('application support', function () {
    before(function () {
      resetMockAndFixture();
    });

    it('should provide a list of macro names, that can be shown in a UI', function () {
      macros.init(CONFIG_HELLO);
      assert.deepEqual(macros.getGuiMacroLabels(), ['hello', 'world']);
    });

    it('should provide information if a macro is defined for a given name', function () {
      macros.init(CONFIG_HELLO_WORLD);
      assert.equal(macros.isMacroDefined('hello world'), true);
      assert.equal(macros.isMacroDefined('Slartibartfass'), false);
    });
  });

  describe('state', function () {
    describe('set, reset and query', function () {
      beforeEach(function () {
        resetMockAndFixture();
        clock = sinon.useFakeTimers();
      });

      afterEach(function () {
        clock.restore();
      });

      it('should deliver current states as key value map', function () {
        macros.init(CONFIG_HELLO_STATES);
        assert.deepEqual(macros.getCurrentStates(), { hello: 'clear', world: 'clear' });
      });

      it('should set state after execution', function () {
        macros.init(CONFIG_HELLO_STATES);
        assert.deepEqual(macros.getCurrentStates(),
          { hello: 'clear', world: 'clear' }, 'not called');
        macros.execute(CONFIG_HELLO_STATES[0].name);
        clock.tick(51);
        assert.deepEqual(macros.getCurrentStates(),
          { hello: 'set', world: 'clear' }, 'macro called');
      });

      it('should reset state after execution', function () {
        macros.init(CONFIG_HELLO_STATES);
        macros.execute(CONFIG_HELLO_STATES[0].name);
        clock.tick(51);
        assert.deepEqual(macros.getCurrentStates(), { hello: 'set', world: 'clear' },
          'state set called');
        macros.execute(CONFIG_HELLO_STATES[2].name);
        clock.tick(51);
        assert.deepEqual(macros.getCurrentStates(), { hello: 'clear', world: 'clear' },
          'state reset called');
      });

      it('should set state in a called macro', function () {
        macros.init(CONFIG_DELEGATE);
        macros.execute(CONFIG_DELEGATE[2].name);
        clock.tick(151);
        assert.deepEqual(macros.getCurrentStates(), { worldIsGreeted: 'set' },
          'state set called');
      });
    });

    describe('dependency call', function () {
      beforeEach(function () {
        resetMockAndFixture();
        clock = sinon.useFakeTimers();
      });

      afterEach(function () {
        clock.restore();
      });

      it.skip('should call macro if state is requested', function () {
        macros.init(CONFIG_HELLO_STATES);
        macros.execute(CONFIG_HELLO_STATES[1].name);
        clock.tick(51);
        assert.deepEqual(deviceMock.operations,
          [['say', 'hello'], ['say', 'world']], 'calls are not done as expected');
        assert.deepEqual(macros.getCurrentStates(), { hello: true, world: false },
          'states are not set as required');
      });
    });
  });
});

// vim: expandtab tabstop=8 softtabstop=2 shiftwidth=2
