var lircNode = require('lirc_node');

var DEVICE_NAME_FOR_MACROS = 'lirc';
var blackLists = {};
var remotes = {};

function setConfigToZero() {
  blackLists = {};
  remotes = {};
}

function setToDefinedValue(value) {
  if (value && value !== null) return value;
  return {};
}


function overrideHardware(hardware) {
  var originalValue = lircNode;
  lircNode = hardware;
  setConfigToZero();
  return originalValue;
}

function refineRemotes(myRemotes) {
  var newRemotes = {};
  var newRemoteCommands = null;
  var remote = null;

  function getCommandsForRemote(remoteName) {
    var remoteCommands = myRemotes[remoteName];
    var blacklist = blackLists[remoteName];

    if (blacklist) {
      remoteCommands = remoteCommands.filter(function (command) {
        return blacklist.indexOf(command) < 0;
      });
    }

    return remoteCommands;
  }

  for (remote in myRemotes) {
    newRemoteCommands = getCommandsForRemote(remote);
    newRemotes[remote] = newRemoteCommands;
  }

  return newRemotes;
}

function getRemotes() {
  return remotes;
}

function getCommands(remote) {
  return refineRemotes(lircNode.remotes)[remote];
}

function sendOnce(remote, command, done) {
  lircNode.irsend.send_once(remote, command, done);
}

function sendStart(remote, command, done) {
  lircNode.irsend.send_start(remote, command, done);
}

function sendStop(remote, command, done) {
  lircNode.irsend.send_stop(remote, command, done);
}

function call(done, originalArguments) {
  var args = originalArguments.slice();
  if (args[0] === DEVICE_NAME_FOR_MACROS) {
    args.shift();
  }
  lircNode.irsend.send_once(args[0], args[1], done);
}

function validateArguments(originalArguments) {
  var args = originalArguments.slice();
  var token = args.shift();
  var commands;
  var remoteControlName;
  var requestedCommand;

  if (token === DEVICE_NAME_FOR_MACROS) {
    token = args.shift();
  }

  remoteControlName = token;
  commands = remotes[remoteControlName];
  if (commands === undefined || commands === null) {
    return 'No remote known with name ' + remoteControlName;
  }

  requestedCommand = args.shift();
  if (requestedCommand === undefined || requestedCommand === null) {
    return 'No command known with name ' + requestedCommand;
  }

  if (args.length > 0) {
    return 'Extra argument.';
  }
}

function init(config, callback) {
  if (! config) {
    setConfigToZero();
    if (callback) callback();
    return;
  }

  blackLists = setToDefinedValue(config.blacklists);

  lircNode.init(function () {
    remotes = refineRemotes(lircNode.remotes);
    if (callback) callback();
  });
}

module.exports = {
  name: DEVICE_NAME_FOR_MACROS,
  overrideHardware: overrideHardware,
  getRemotes: getRemotes,
  getCommandsForRemote: getCommands,
  sendOnce: sendOnce,
  sendStart: sendStart,
  sendStop: sendStop,
  validateArguments: validateArguments,
  call: call,
  init: init,
};
// vim: expandtab tabstop=8 softtabstop=2 shiftwidth=2
