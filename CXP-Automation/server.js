// server.js

// set up ======================================================================
// get all the tools we need Bog Test2
var express  = require('express');
var bodyParser  =  require("body-parser");
var app      = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var port     = process.env.PORT || 80;
var Nightmare = require('nightmare');

var io = require('socket.io').listen(server);

var cookieParser = require('cookie-parser')
var session      = require('express-session');
SocketsManager = require('./app/socketsManager');
Delay = require('./app/delayVar')
var scheduleManager = require('./app/scheduler')



var debug = require('debug')('Muri');

// set up our express application
app.use('/public', express.static('public'));
app.use('/js', express.static('js'));
app.use('/style', express.static('style'));
app.use('/img', express.static('img'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'eatcake' })); // session secret

 
var GUI;
var scafoldNightmare = function() {
	console.log('Scafolding nightmare');
	GUI = Nightmare({
		show: true,
		typeInterval: 20,
		alwaysOnTop: false,
		title: 'CXP Toolkit',
		x: 100,
		y: 10,
		icon: './Utility/icon.png',
		autoHideMenuBar: true
	})
	GUI
		.viewport(800, 1000)
		.goto('http://localhost/')
		.then(function() {
			console.log('Please use new CXP Toolkit GUI')
		})
		.catch(function (error) {
			console.error('firstLogin failed due to: ', error);
		})
}
scafoldNightmare();

//Handles the routes
require('./app/routes.js')(app);

//Sockets
SocketsManager.init(io);
SocketsManager.start();

Delay.init();

scheduleManager.init();
scheduleManager.checkFiles();



server.listen(port);

// launch ======================================================================
//app.listen(port);
console.log('The magic happens on port ' + port);






