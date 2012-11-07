exports.start = function (initRoutes) {
	var express = 	require('express'),
		app = 		express(),
		server = 	require('http').createServer(app),
		io = require('socket.io').listen(server);

	app.use(express.logger());
	app.use(express.static(__dirname + '/../public'));
	app.set('views', __dirname + '/../views');
	
	initRoutes(app);

	server.listen(8080);
	return io;
};