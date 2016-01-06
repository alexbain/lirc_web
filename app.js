#! /usr/bin/env node

// Requirements
var express = require('express');
var logger = require('morgan');
var compress = require('compression');
var lircNode = require('lirc_node');
var consolidate = require('consolidate');
var swig = require('swig');
var labels = require('./lib/labels');
var https = require('https');
var request = require('request');
var fs = require('fs');
var macros = require('./lib/macros');
var request = require('request');
var OpenZWave = require('openzwave-shared');

// Precompile templates
var JST = {
  index: swig.compileFile(__dirname + '/templates/index.swig'),
  appcache: swig.compileFile(__dirname + '/templates/appcache.swig'),
};

// Set bootup time as the cache busting hash for the app cache manifest
var bootupTime = Date.now();

// Create app
var app = module.exports = express();

// lirc_web configuration
var config = {};

// Server & SSL options
var port = 3000;
var sslOptions = {
  key: null,
  cert: null,
};

var labelFor = {};

// App configuration
app.engine('.html', consolidate.swig);
app.use(logger('combined'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(compress());
app.use(express.static(__dirname + '/static'));

function _init() {
  var home = process.env.HOME;

  lircNode.init().then(function() {
    console.log("LIRC connection initialized");
    console.log(lircNode.remotes);
  });

  // Config file is optional
  try {
    try {
      config = require(__dirname + '/config.json');
    } catch (e) {
      config = require(home + '/.lirc_web_config.json');
    }
  } catch (e) {
    console.log('DEBUG:', e);
    console.log('WARNING: Cannot find config.json!');
  }

  if (config.socket) {
    lircNode.setSocket(config.socket);
  }

  // Refresh the app cache manifest hash
  bootupTime = Date.now();
}

function refineRemotes(myRemotes) {
  var newRemotes = {};
  var newRemoteCommands = null;
  var remote = null;

  function isBlacklistExisting(remoteName) {
    return config.blacklists && config.blacklists[remoteName];
  }

  function getCommandsForRemote(remoteName) {
    var remoteCommands = myRemotes[remoteName];
    var blacklist = null;

    if (isBlacklistExisting(remoteName)) {
      blacklist = config.blacklists[remoteName];

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

// Based on node environment, initialize connection to lircNode or use test data
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  lircNode.remotes = require(__dirname + '/test/fixtures/remotes.json');
  config = require(__dirname + '/test/fixtures/config.json');
} else {
  _init();
}

// initialize Labels for remotes / commands
labelFor = labels(config.remoteLabels, config.commandLabels);

// Routes

// Index
app.get('/', function (req, res) {
  var refinedRemotes = refineRemotes(lircNode.remotes);

  res.send(JST.index({
    remotes: refinedRemotes,
    devices: config.devices,
    macros: config.macros,
    repeaters: config.repeaters,
    labelForRemote: labelFor.remote,
    labelForCommand: labelFor.command,
  }));
});

// application cache manifest
app.get('/app.appcache', function (req, res) {
  res.send(JST.appcache({
    hash: bootupTime,
  }));
});

// Refresh
app.get('/refresh', function (req, res) {
  _init();
  res.redirect('/');
});

// Get all capabilities of remote
app.get('/capabilities.json', function(req, res) {
    res.json({
        "devices": config.devices,
        "remotes": lirc_node.remotes
    });
});

// List all remotes in JSON format
app.get('/remotes.json', function (req, res) {
  res.json(refineRemotes(lircNode.remotes));
});

// List all commands for :remote in JSON format
app.get('/remotes/:remote.json', function (req, res) {
  if (lircNode.remotes[req.params.remote]) {
    res.json(refineRemotes(lircNode.remotes)[req.params.remote]);
  } else {
    res.sendStatus(404);
  }
});

// List all macros in JSON format
app.get('/macros.json', function (req, res) {
  res.json(config.macros);
});

// List all commands for :macro in JSON format
app.get('/macros/:macro.json', function (req, res) {
  if (config.macros && config.macros[req.params.macro]) {
    res.json(config.macros[req.params.macro]);
  } else {
    res.sendStatus(404);
  }
});

// List all devices in JSON format
app.get('/devices.json', function(req, res) {
    // TODO: Should return a nicely formatted response, not just the config object
    res.json(config.devices);
});

// List all commands for :device in JSON format
app.get('/devices/:device.json', function(req, res) {
    if (config.devices && config.devices[req.params.device]) {
        // TODO: Should return a nicely formatted response, not just the config object
        res.json(config.devices[req.params.device]);
    } else {
        res.send(404);
    }
});

// Get device state
app.get('/devices/:device', function(req, res) {
    if (config.devices &&
        config.devices[req.params.device] &&
        config.devices[req.params.device]['state']) {

        var state = config.devices[req.params.device]['state'];

        // Build request to make to get device state
        var stateReq = {
          method: state.method || "GET",
          url: state.url,
          form: state.body
        };

        // Make request for state, include body of response in response
        request(stateReq, function (error, response, body) {
          // TODO: How to parse the response and only return relevant portion?
          var bodyJson = JSON.parse(body);
          res.json(bodyJson);
        });

    } else {
        // Device doesn't have a state, return 404
        res.send(404);
    }
});

// Execute device action
app.post('/devices/:device/:command', function(req, res) {
    var device = config.devices[req.params.device];
    var command = device.commands[req.params.command];

    var commandReq = {
        method: command.method,
        url: command.url,
        form: command.body
    };

    request(commandReq);

    res.setHeader('Cache-Control', 'no-cache');
    res.sendStatus(200);
});

// Send :remote/:command one time
app.post('/remotes/:remote/:command', function (req, res) {
  lircNode.irsend.send_once(req.params.remote, req.params.command, function () {});
  res.setHeader('Cache-Control', 'no-cache');
  res.sendStatus(200);
});

// Start sending :remote/:command repeatedly
app.post('/remotes/:remote/:command/send_start', function (req, res) {
  lircNode.irsend.send_start(req.params.remote, req.params.command, function () {});
  res.setHeader('Cache-Control', 'no-cache');
  res.sendStatus(200);
});

// Stop sending :remote/:command repeatedly
app.post('/remotes/:remote/:command/send_stop', function (req, res) {
  lircNode.irsend.send_stop(req.params.remote, req.params.command, function () {});
  res.setHeader('Cache-Control', 'no-cache');
  res.sendStatus(200);
});

// Execute a macro (a collection of commands to one or more remotes)
app.post('/macros/:macro', function (req, res) {
  // If the macro exists, execute it
  if (config.macros && config.macros[req.params.macro]) {
    macros.exec(config.macros[req.params.macro], lircNode);
    res.setHeader('Cache-Control', 'no-cache');
    res.sendStatus(200);
  } else {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendStatus(404);
  }
});

// ZWAVE
var zwaveNodes = [];
var zwave = new OpenZWave({ saveconfig: true });
zwave.connect('/dev/ttyACM0');

app.post('/zwave/:id/on', function(req, res) {
	var id = req.params.id;
  zwave.setValue(id, 37, 1, 0, true);
	res.json({ "success": true });
});

app.post('/zwave/:id/off', function(req, res) {
	var id = req.params.id;
  zwave.setValue(id, 37, 1, 0, false);
	res.json({ "success": true });
});

zwave.on('scan complete', function() {
  console.log("Zwave scan complete...");
});

// Listen (http)
if (config.server && config.server.port) {
  port = config.server.port;
}

if (!module.parent) {
  app.listen(port);
  console.log('Open Source Universal Remote UI + API has started on port ' + port + ' (http).');

  // Listen (https)
  if (config.server && config.server.ssl && config.server.ssl_cert && config.server.ssl_key && config.server.ssl_port) {
    sslOptions = {
      key: fs.readFileSync(config.server.ssl_key),
      cert: fs.readFileSync(config.server.ssl_cert),
    };

    https.createServer(sslOptions, app).listen(config.server.ssl_port);

    console.log('Open Source Universal Remote UI + API has started on port ' + config.server.ssl_port + ' (https).');
  }
}

process.on('SIGINT', function() {
    zwave.disconnect('/dev/ttyACM0');
    process.exit();
});
