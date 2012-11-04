var socket = io.connect('http://192.168.1.105:8080');

////////////////////
// GENERAL EVENTS
//
// When a message from the server arrives
socket.on('message', function (data) {
	console.log('Message from server :', data);
});

// When a broadcast message from another player arrives
socket.on('brodcast_message', function (data) {
	console.log('Message from ' + data.id + ' : ', data.message);
});


////////////////////
// INITIALISATION EVENTS
//
// Once the connection is established
socket.on('connection_ok', function (data) {
	game.init(data);			// We initialize the game
	socket.emit('send_user_init_data', game.players[data.id]);	// We send the user data to the socket
	game.user = data.id;	// We only keep the id, since the user is now with the other players
});

// When the sockets sends the other players data (on connection)
socket.on('get_players', function (players) {
	for (var player in players) {
		if (!game.players.hasOwnProperty(player) && player != game.user) {
			game.addPlayer(players[player]);
		}
	};
});

// When a new player comes in the game
socket.on('new_player', function (newPlayer) {
	if (!game.players.hasOwnProperty(newPlayer.id) && newPlayer.id != game.user) {
		game.addPlayer(newPlayer);
	}
	console.log(game.players[newPlayer.id].username + ' a rejoint le jeu.');
});

// When a player leaves the game
socket.on('player_quit', function (data) {
	if (game.players.hasOwnProperty(data.id)) {
		var leavingPlayer = game.players[data.id];
		console.log(leavingPlayer.username + ' a quitté le jeu.');
		leavingPlayer.remove(game.canvas);
		delete game.players[data.id];
	}
});


////////////////////
// GAME EVENTS
//
// When the server sends datas from all the players (on each frame)
socket.on('get_players_data', function (data) {
	for (var player in data) {
		if (game.players.hasOwnProperty(player)) {
			game.players[player].x = data[player].x;
			game.players[player].y = data[player].y;
			game.players[player].speed = data[player].speed;
			game.players[player].angle = data[player].angle;
		}
	};
});