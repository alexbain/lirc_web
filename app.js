// lirc_web - v0.0.8
// Alex Bain <alex@alexba.in>

// Requirements
var express = require('express'),
    lirc_node = require('lirc_node'),
    consolidate = require('consolidate'),
    path = require('path'),
    swig = require('swig'),
    labels = require('./lib/labels');
var moment = require('moment-timezone');
// Precompile templates
var JST = {
	index: swig.compileFile(__dirname + '/templates/index.swig'),
};

// Create app
var app = module.exports = express();

// App configuration
app.engine('.html', consolidate.swig);
app.configure(function() {
    app.use(express.logger());
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.compress());
    app.use(express.static(__dirname + '/static'));
});

// lirc_web configuration
var config = {};

// Based on node environment, initialize connection to lirc_node or use test data
if (process.env.NODE_ENV == 'test' || process.env.NODE_ENV == 'development') {
    lirc_node.remotes = require(__dirname + '/test/fixtures/remotes.json');
    config = require(__dirname + '/test/fixtures/config.json');
} else {
    lirc_node.init();

    // Config file is optional
    try {
        config = require(__dirname + '/config.json');
    } catch(e) {
        console.log("DEBUG:", e);
        console.log("WARNING: Cannot find config.json!");
    }
}

createTimers();

function createTimers()
{	
	var daysOfWeek = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];
	

	for(var i = 0; i < config.schedule["items"].length; i++)
	{
		var currDate = moment().tz("" + config.schedule["timezone"][0]);
		var daysIndex;
		for(var j = 0; j < daysOfWeek.length; j++)
		{
			if(config.schedule["items"][i][3] == daysOfWeek[j])
				daysIndex = j;
		}

		var daysFromNow;

		if(currDate.day() == daysIndex)
		{
			//if the current hour is greater than the desired hour
			if(currDate.hour() > config.schedule["items"][i][4])
			{
				daysFromNow = 7;
			}
			else if(currDate.hour() == config.schedule["items"][i][4])
			{
				if(currDate.minute() >= config.schedule["items"][i][5])
					daysFromNow = 7;
				else
					daysFromNow = 0;
			}
			else
			{
				daysFromNow = 0;
			}			
		}
		else if(currDate.day() < daysIndex)
		{
			daysFromNow = daysIndex - currDate.day();
		}
		else
		{
			daysFromNow = (6 - currDate.day()) + daysIndex+1;
		}	

		var dater = currDate.year() + "-0" + (currDate.month()+1) + "-0" + currDate.date() + " 00:00";
		
		var tempDay = moment.tz(dater, ""+config.schedule["timezone"][0]);
		tempDay.add(daysFromNow, 'days');
		tempDay.hour(config.schedule["items"][i][4]);
		tempDay.minute(config.schedule["items"][i][5]);

		if(config.schedule["items"][i][0] == "SEND_ONCE")
		{
			setTimeout(sendOnce, tempDay.diff(currDate), config.schedule["items"][i][1], config.schedule["items"][i][2]);
		}
		else if(config.schedule["items"][i][0] == "SIMULATE")
		{
			lirc_node.irsend.simulate(req.params.code + ' 00 ' + req.params.command + ' ' + req.params.remote, function() {});

		}
	}

}

function sendOnce(command1, command2)
{
	lirc_node.irsend.send_once(command1, command2, function() { });
	console.log("Schedule Triggered. Remote " + command1+ " and Command: " + command2);
}

// Routes

var labelFor = labels(config.remoteLabels, config.commandLabels)

// Web UI
app.get('/', function(req, res) {
    res.send(JST['index'].render({
        remotes: lirc_node.remotes,
        macros: config.macros,
        repeaters: config.repeaters,
	 simulators: config.simulators,
	 codes: config.codes,
        labelForRemote: labelFor.remote,
        labelForCommand: labelFor.command,
	items: config.schedule["items"]
    }));
});

// List all remotes in JSON format
app.get('/remotes.json', function(req, res) {
    res.json(lirc_node.remotes);
});

// List all commands for :remote in JSON format
app.get('/remotes/:remote.json', function(req, res) {
    if (lirc_node.remotes[req.params.remote]) {
        res.json(lirc_node.remotes[req.params.remote]);
    } else {
        res.send(404);
    }
});

// List all macros in JSON format
app.get('/macros.json', function(req, res) {
    res.json(config.macros);
});

// List all commands for :macro in JSON format
app.get('/macros/:macro.json', function(req, res) {
    if (config.macros && config.macros[req.params.macro]) {
        res.json(config.macros[req.params.macro]);
    } else {
        res.send(404);
    }
});

// Send :remote/:command one time
app.post('/remotes/:remote/:command', function(req, res) {
    lirc_node.irsend.send_once(req.params.remote, req.params.command, function() {});
    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);
});

// Send the remote command as a SIMULATE action in Lirc
app.post('/remotes/:remote/:command/:code/simulate', function(req, res) {
    lirc_node.irsend.simulate(req.params.code + ' 00 ' + req.params.command + ' ' + req.params.remote, function() {});
    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);
});

// Start sending :remote/:command repeatedly
app.post('/remotes/:remote/:command/send_start', function(req, res) {
    lirc_node.irsend.send_start(req.params.remote, req.params.command, function() {});
    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);
});

// Stop sending :remote/:command repeatedly
app.post('/remotes/:remote/:command/send_stop', function(req, res) {
    lirc_node.irsend.send_stop(req.params.remote, req.params.command, function() {});
    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);
});

// Execute a macro (a collection of commands to one or more remotes)
app.post('/macros/:area/:macro', function(req, res) {

    // If the macro exists, execute each command in the macro with 100msec
    // delay between each command.
    if (config.macros && config.macros[req.params.area]) {
        var i = 0;

        var nextCommand = function() {
            var command = config.macros[req.params.area][req.params.macro][i];

    	    if (!command) { return true; }

            // increment
            i = i + 1;

            if (command[0] == "delay") {
                setTimeout(nextCommand, command[1]);
            } else if(command[0] == "SIMULATE"){

		var code = config.codes[command[1]][command[2]];
	
		var codeString = code + " 00 " + command[2] + " " + command[1];
		
		lirc_node.irsend.simulate(codeString, function() { setTimeout(nextCommand, 100); });
	     } else {
		  // By default, wait 100msec before calling next command
                lirc_node.irsend.send_once(command[1], command[2], function() { setTimeout(nextCommand, 100); });
            }
        };

        // kick off macro w/ first command
        nextCommand();
    }

    res.setHeader('Cache-Control', 'no-cache');
    res.send(200);
});


// Default port is 3000
app.listen(3000);
console.log("Open Source Universal Remote UI + API has started on port 3000.");
