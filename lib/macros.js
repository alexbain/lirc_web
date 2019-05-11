function exec(macro, lircNode, simulators, iter) {
  var i = iter || 0;

	var callback = function()
	{
		setTimeout(function () {
			exec(macro, lircNode, simulators, i);
		}, 100);
	}
	
  // select the command from the sequence
  var command = macro[i];

  if (!command) { return false; }

  i = i + 1;

  // if the command is delay, wait N msec and then execute next command
  if (command[0] === 'delay') {
    setTimeout(callback, command[1]);
  } else {
    // By default, wait 100msec before calling next command
		if(simulators.includes(command[0]))
		{
			console.log("This is a remote that should be simulated");
			lircNode.irsend.simulate("0000000000000000 00 " + command[1] + " " + command[0], callback);
		}
		else
			lircNode.irsend.send_once(command[0], command[1], callback)
  }

  return true;
}

exports.exec = exec;
