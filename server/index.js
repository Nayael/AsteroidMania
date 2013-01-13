var server = require("./server"),
	sockets = require('./sockets'),
	lobby = require('./lobby'),
	init = require('./init'),
	game = require('./game');

init.init();
lobby.createLobby();

var io = server.start(game);	// We start the server
sockets.init(io, init, game, lobby);