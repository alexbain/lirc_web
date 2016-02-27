#! /usr/bin/env node

// Requirements
var express = require('express');
var logger = require('morgan');
var compress = require('compression');
var lirc = require('./lib/lirc');
var consolidate = require('consolidate');
var swig = require('swig');
var labels = require('./lib/labels');
var https = require('https');
var fs = require('fs');
var macros = require('./lib/macro-manager.js');
var gpio = require('./lib/gpio');

// Precompile templates
var JST = {
  index: swig.compileFile(__dirname + '/templates/index.swig'),
};

// Create app
var app = module.exports = express();

// osur configuration
var config = {};
var hasServerPortConfig = false;
var hasSSLConfig = false;

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

function readConfiguration() {
  var searchPaths = [];

  function configure(configFileName) {
    searchPaths.push(configFileName);
    config = require(configFileName);
    console.log('Open Source Universal Remote is configured by ' + configFileName);
  }

  // Config file is optional
  try {
    try {
      configure(__dirname + '/config.json');
    } catch (e) {
      console.log('DEBUG:', e);
      configure(process.env.HOME + '/.osur-config.json');
    }
  } catch (e) {
    console.log('DEBUG:', e);
    console.log('WARNING: Cannot find config.json!');
    console.log('DEBUG: tried: ' + JSON.stringify(searchPaths));
  }

  hasServerPortConfig = config.server && config.server.port;
  hasSSLConfig =
    config.server && config.server.ssl && config.server.ssl_cert
    && config.server.ssl_key && config.server.ssl_port;
}

function overrideConfigurationForDebugOrDevelopment() {
  var lircTest;
  if (process.env.npm_package_config_test_env) {
    console.log('we are in test mode!');
    lircTest = require('./test/lib/lirc');
    lircTest.replaceLircByMock();
    gpio.setGpioLibrary(require('./lib/gpio-la-mock'));
    config = require('./test/fixtures/config.json');
    hasServerPortConfig = false;
    hasSSLConfig = false;
  } else {
    gpio.setGpioLibrary(require('./lib/gpio-la-gpio'));
  }
}

function initializeModules(done) {
  lirc.init(config, function () {
    var currentStates = null;

    if (config.gpios) {
      gpio.init(config.gpios);
    }

    if (config.macros) {
      currentStates = macros.getCurrentStates();

      if (config.gpios) {
        macros.registerDevice(gpio);
      }
      macros.registerDevice(lirc);
      macros.init(config.macros, currentStates);
    }

    // initialize Labels for remotes / commands
    labelFor = labels(config.remoteLabels, config.commandLabels);
    done();
  });
}

function init(done) {
  readConfiguration();
  overrideConfigurationForDebugOrDevelopment();
  initializeModules(done);
}

// Routes

// Index
app.get('/', function (req, res) {
  var indexPage = JST.index({
    remotes: lirc.getRemotes(),
    macros: macros.getGuiMacroLabels(),
    repeaters: config.repeaters,
    gpios: config.gpios,
    labelForRemote: labelFor.remote,
    labelForCommand: labelFor.command,
  });
  res.send(indexPage);
});

// Refresh
app.get('/refresh', function (req, res) {
  init(function () {
    res.redirect('/');
  });
});

// List all remotes in JSON format
app.get('/remotes.json', function (req, res) {
  res.json(lirc.getRemotes());
});

// List all commands for :remote in JSON format
app.get('/remotes/:remote.json', function (req, res) {
  var commands = lirc.getCommandsForRemote(req.params.remote);
  if (commands) {
    res.json(commands);
  } else {
    res.sendStatus(404);
  }
});

function respondWithGpioState(res) {
  if (config.gpios) {
    gpio.updatePinStates(function (result) {
      res.json(result);
    }, config.gpios);
  } else {
    res.send(404);
  }
}

// List all gpio switches in JSON format
app.get('/gpios.json', function (req, res) {
  respondWithGpioState(res);
});

// List all macros in JSON format
app.get('/macros.json', function (req, res) {
  res.json(config.macros);
});

// Send :remote/:command one time
app.post('/remotes/:remote/:command', function (req, res) {
  lirc.sendOnce(req.params.remote, req.params.command, function () {});
  res.setHeader('Cache-Control', 'no-cache');
  res.sendStatus(200);
});

// Start sending :remote/:command repeatedly
app.post('/remotes/:remote/:command/send_start', function (req, res) {
  lirc.sendStart(req.params.remote, req.params.command, function () {});
  res.setHeader('Cache-Control', 'no-cache');
  res.sendStatus(200);
});

// Stop sending :remote/:command repeatedly
app.post('/remotes/:remote/:command/send_stop', function (req, res) {
  lirc.sendStop(req.params.remote, req.params.command, function () {});
  res.setHeader('Cache-Control', 'no-cache');
  res.sendStatus(200);
});

// toggle /gpios/:gpio_pin
app.post('/gpios/:gpio_pin', function (req, res) {
  gpio.togglePin(function (result) {
    res.setHeader('Cache-Control', 'no-cache');
    res.json(result);
    res.end();
  }, req.params.gpio_pin);
});


// Execute a macro (a collection of commands to one or more remotes)
app.post('/macros/:macro', function (req, res) {
  var macroName = req.params.macro;
  if (macros.isMacroDefined(macroName)) {
    macros.execute(macroName);
    res.setHeader('Cache-Control', 'no-cache');
    if (config.gpios) {
      respondWithGpioState(res);
    } else {
      res.sendStatus(200);
    }
  } else {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendStatus(404);
  }
});

init(function () {
  // only start server, when called as application
  if (!module.parent) {
    // Listen (http)
    if (hasServerPortConfig) {
      port = config.server.port;
    }

    app.listen(port);
    console.log('Open Source Universal Remote UI + API has started on port ' + port + ' (http).');

    // Listen (https)
    if (hasSSLConfig) {
      sslOptions = {
        key: fs.readFileSync(config.server.ssl_key),
        cert: fs.readFileSync(config.server.ssl_cert),
      };
      https.createServer(sslOptions, app).listen(config.server.ssl_port);

      console.log('Open Source Universal Remote UI + API has started on port '
        + config.server.ssl_port + ' (https).');
    }
  }
});
