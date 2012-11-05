var server = require("./server"),
	router = require('./router'),
	sockets = require('./sockets'),
	game = require('./init');

game.init();

var io = server.start(router.routes);	// We start the server, and give it the method to create the routes
sockets.init(io, game);