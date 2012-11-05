var server = require("./modules/server"),
	router = require('./modules/router'),
	sockets = require('./modules/sockets'),
	initModule = require('./modules/init'),
	gameModule = require('./modules/game');

initModule.init();

var io = server.start(router.routes);	// We start the server, and give it the method to create the routes
sockets.init(io, initModule, gameModule);