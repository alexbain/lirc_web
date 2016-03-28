function exec(macro, lircNode, iter) {
  var i = iter || 0;

  // select the command from the sequence
  var command = macro[i];

  if (!command) { return false; }

  i = i + 1;

  // if the command is delay, wait N msec and then execute next command
  if (command[0] === 'delay') {
    setTimeout(function () {
      exec(macro, lircNode, i);
    }, command[1]);
  } else if (Array.isArray(command[1])) {
    var stopSending = function() {
      lircNode.irsend.send_stop(command[0], command[1][0], function() {
        setTimeout(function () {
          exec(macro, lircNode, i);
        }, 100);
      });
    }
    lircNode.irsend.send_start(command[0], command[1][0], function() {
      setTimeout(stopSending, command[1][1]);
    });
  } else {
    // By default, wait 100msec before calling next command
    lircNode.irsend.send_once(command[0], command[1], function () {
      setTimeout(function () {
        exec(macro, lircNode, i);
      }, 100);
    });
  }

  return true;
}

exports.exec = exec;
