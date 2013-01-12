define(['socket_io', 'game_client'], function (io, game) {
	function connectSocket() {
		var socket = io.connect('http://localhost:8080');
	////////////////////
	// GENERAL EVENTS
	//
		// When a message from the server arrives
		socket.on('message', function (data) {
			game.log('Message du serveur :', data);
		});

		// When a broadcast message from another player arrives
		socket.on('brodcast_message', function (data) {
			game.log('Message de ' + data.id + ' : ', data.message);
		});


	////////////////////
	// INITIALISATION EVENTS
	//
		// Once the connection is established
		socket.on('launchGame', function (data) {
			game.launch(data);
			// We send the user data to the socket
			socket.emit('send_user_init_data', {
				id: game.players[data.id].id,
				x: game.players[data.id].x,
				y: game.players[data.id].y,
				speed: game.players[data.id].speed,
				angle: game.players[data.id].angle,
				color: game.players[data.id].color,
				username: game.players[data.id].username
			});
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
			game.log(game.players[newPlayer.id].username + ' a rejoint le jeu.');
		});

		// When a player leaves the game
		socket.on('player_quit', function (player) {
			if (game.players.hasOwnProperty(player.id)) {
				var leavingPlayer = game.players[player.id];

				game.log(player.username + ' a quitté le jeu.');
				leavingPlayer.remove(game.canvas);
				delete game.players[player.id];
			}
		});


	////////////////////
	// GAME EVENTS
	//
		// When the server sends datas from the game (on each frame)
		socket.on('get_game_state', function (data) {
			var players = data.players,
				asteroids = data.asteroids;

			game.asteroids = [];
			for (var asteroid in asteroids) {
				game.addAsteroid(asteroids[asteroid]);
			};

			for (var player in players) {
				if (game.players.hasOwnProperty(player)) {
					game.players[player].syncFromServer(data);
				}
			};
		});

		// When the server starts the level
		socket.on('start_level', function (asteroids) {
			game.asteroids = [];
			for (var asteroid in asteroids) {
				game.addAsteroid(asteroids[asteroid]);
			};
		});

		return socket;
	}
	return connectSocket;
});