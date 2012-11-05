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
// When the server sends datas from the game (on each frame)
socket.on('get_game_state', function (data) {
	var players = data.players,
		asteroids = data.asteroids;
	
	for (var player in players) {
		if (game.players.hasOwnProperty(player)) {
			game.players[player].x = players[player].x;
			game.players[player].y = players[player].y;
			game.players[player].speed = players[player].speed;
			game.players[player].angle = players[player].angle;
		}
	};

	game.asteroids = [];
	for (var asteroid in asteroids) {
		game.addAsteroid(new game.Asteroid(asteroids[asteroid].x, asteroids[asteroid].y, asteroids[asteroid].size, asteroids[asteroid].color));
	};
});

// When the server starts the level
socket.on('start_level', function (asteroids) {
	game.asteroids = [];
	for (var key in asteroids) {
		game.addAsteroid(new game.Asteroid(asteroids[key].x, asteroids[key].y, asteroids[key].size, asteroids[key].color));
	};
});