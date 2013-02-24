//
// lirc_web
// v0.0.1
// Alex Bain <alex@alexba.in>
//


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
// App configuration
//
app.engine('.html', consolidate.swig);
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

// Web UI endpoint
app.get('/', function(req, res) {
    res.send(JST['index'].render({
        remotes: lirc_node.remotes
    }));
});

// API endpoint
app.post('/remotes/:remote/:command', function(req, res) {
    lirc_node.irsend.send_once(req.params.remote, req.params.command, function() {});
    res.send(200);
});


// Listen on port 3000
app.listen(3000);

