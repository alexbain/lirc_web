function exec(macro, lircNode, iter) {
  var i = iter || 0;

  // select the macro step from the sequence
  var macroStep = macro[i];

  // Get device as 1st parameter
  var device = macroStep[0];
  // Get command as 2nd parameter
  var command = macroStep[1];

  // IFF command is an array, treat as hold command, get command and hold time
  var holdCommand = command[0];
  var holdTime = command[1];

  i = i + 1;

  if (!macroStep) { return false; }

  // if the macro step is delay, wait N msec and then execute next macro step
  if (device === 'delay') {
    setTimeout(function () {
      exec(macro, lircNode, i);
    }, command);
  } else if (Array.isArray(command)) {
    // send_start hold command and set timeout for hold time to call send_stop
    lircNode.irsend.send_start(device, holdCommand, function () {
      setTimeout(function () {
        lircNode.irsend.send_stop(device, holdCommand, function () {
          setTimeout(function () {
            exec(macro, lircNode, i);
          }, 100);
        });
      }, holdTime);
    });
  } else {
    // By default, wait 100msec before calling next macro step
    lircNode.irsend.send_once(device, command, function () {
      setTimeout(function () {
        exec(macro, lircNode, i);
      }, 100);
    });
  }

  return true;
}

exports.exec = exec;
