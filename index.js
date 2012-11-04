var server = require("./server"),
	router = require('./router'),
	sockets = require('./sockets');

require('./init').init();

var io = server.start(router.routes);	// We start the server, and give it the method to create the routes
sockets.init(io);