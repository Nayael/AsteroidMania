var server = require("./server"),
	router = require('./router');

server.start(router.routes);	// We start the server, and give it the method to create the routes