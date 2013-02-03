//
// WiFi Remote
// v0.0.1
// Alex Bain <alex@alexba.in>
//


//
// Requirements
//
var express = require('express'),
    lirc_node = require('lirc_node'),
    app = express(),
    consolidate = require('consolidate'),
    swig = require('swig');


//
// Precompile templates
//
var JST = {
    index: swig.compileFile(__dirname + '/templates/index.swig')
};


//
// lic_node initialization
//
// lirc_node.init();
lirc_node.remotes = {
    "yamaha": ["Power", "VolumeUp", "VolumeDown", "HDMI1", "HDMI2"],
    "tv": ["Power", "ChannelUp", "ChannelDown", "Input1", "Input3"]
};


//
// Set templating engine
//
app.engine('.html', consolidate.swig);


//
// App configuration
//
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    app.use(express.compress());
    app.use('/css', express.static(__dirname + '/css'));
    app.use('/js', express.static(__dirname + '/js'));
});


//
// Routes
//

// Index
app.get('/', function(req, res) {
    res.send(JST['index'].render({
        remotes: lirc_node.remotes
    }));
});

// Send a :command to :remote
app.post('/remotes/:remote/:command', function(req, res) {
    lirc_node.irsend.send_once(req.params.remote, req.params.command, cb);
    res.status(200);
});

app.listen(3000);
