//
// lirc_web
// v0.0.2
// Alex Bain <alex@alexba.in>
//

// Set this to true if you'd like to emulate a list of remotes for development
var DEVELOPER_MODE = false;

//
// Requirements
//
var express = require('express'),
    lirc_node = require('lirc_node'),
    consolidate = require('consolidate'),
    swig = require('swig');

var app = module.exports = express();


//
// Precompile templates
//
var JST = {
    index: swig.compileFile(__dirname + '/templates/index.swig')
};


//
// lic_node initialization
//
lirc_node.init();


//
// Overwrite the remotes to be a default set if DEVELOPER_MODE is true
//
if (DEVELOPER_MODE) {
    lirc_node.remotes = {
        'Yamaha': [
            'power',
            'vaux',
            'hdmi1',
            'volup',
            'voldown'
        ],
        'SonyTV': [
            'power',
            'volumeup',
            'volumedown',
            'channelup',
            'channeldown'
        ],
        Microsoft_Xbox360: [
            'OpenClose',
            'XboxFancyButton',
            'OnOff',
            'Stop',
            'Pause',
            'Rewind',
            'FastForward',
            'Prev',
            'Next',
            'Play',
            'Display',
            'Title',
            'DVD_Menu',
            'Back',
            'Info',
            'UpArrow',
            'LeftArrow',
            'RightArrow',
            'DownArrow',
            'OK',
            'Y',
            'X',
            'A',
            'B',
        ]
    };
}


//
// App configuration
//
app.engine('.html', consolidate.swig);
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    app.use(express.compress());
    app.use('/css', express.static(__dirname + '/css'));
    app.use('/images', express.static(__dirname + '/images'));
    app.use('/js', express.static(__dirname + '/js'));
});


//
// Routes
//


// Web UI endpoint
app.get('/', function(req, res) {
    console.log("Viewed index");
    res.send(JST['index'].render({
        remotes: lirc_node.remotes
    }));
});


// API endpoint
app.post('/remotes/:remote/:command', function(req, res) {
    console.log("Sending " + req.params.command + " to " + req.params.remote);
    lirc_node.irsend.send_once(req.params.remote, req.params.command, function() {});
    res.send(200);
});


// Listen on port 3000
app.listen(3000);
console.log("Open Source Universal Remote UI + API has started on port 3000.");
