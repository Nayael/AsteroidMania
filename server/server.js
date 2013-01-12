exports.start = function (game) {
	var express = 	require('express'),
		auth = 		require('./auth'),
		router = 	require('./router'),
		app = 		express(),
		server = 	require('http').createServer(app),
		io = 		require('socket.io').listen(server);

	io.set('log level', 1);

	app.use(express.logger());
	app.use(express.static(__dirname + '/../public'));
	app.set('views', __dirname + '/../views');
	app.game = game;
	
	auth.initAuth(app, express);		// Initializing authentication
	router.route(app, auth.checkAuth);	// Initializing routes

	server.listen(8080);
	return io;
};