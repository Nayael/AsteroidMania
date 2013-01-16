define(['socket_io', 'game_client'], function(io, game) {
	function connectSocket() {
		var socket = io.connect('http://localhost:8080', {
			'reconnect': true,
			'reconnection delay': 500,
			'max reconnection attempts': 10
		});
		
		function authenticate() {
			socket.emit('authenticate', {
				playerId: $('#game_content').data('playerid'),
				token: $('#game_content').data('token')
			});
		};
		authenticate();

	////////////////////
	// GENERAL EVENTS
	//
		// When a message from the server arrives
		socket.on('message', function(data) {
			game.log('Message du serveur :', data);
		});

		// When a broadcast message from another player arrives
		socket.on('brodcast_message', function(data) {
			game.log('Message de ' + data.id + ' : ', data.message);
		});


	////////////////////
	// INITIALISATION EVENTS
	//
		// Once the connection is established
		socket.on('init_game', function(data) {
			game.showLobby(data.lobby, data.player);
		});

		socket.on('could_not_create_room', function() {
			alert('Impossible de créer la room');
		});

		socket.on('could_not_join_room', function() {
			alert('Impossible de rejoindre la room');
		})

		socket.on('joined_lobby', function(username) {
			if (game.inLobby)
				game.addPlayerToLobby(username);
		});

		// When someone creates a room on the server
		socket.on('refresh_lobby', function(data) {
			if (game.inLobby) {
				game.refreshLobby(data.lobby);
				if (data.message != undefined)
					game.log(data.message);
			}
		});

		// Once the game is started
		socket.on('enter_room', function(data) {
			var player = data.player;
			if (data.others != undefined)	// If there are other players, we add them to the map
				game.addPlayers(data.others);

			game.addPlayer(player, true);
			game.enterRoom(player);
			// game.launch(player);
			// socket.emit('init_user', player);	// We send the player data to the socket
			// game.user = player.id;	// We only keep the id, since the user is now with the other players
		});

		socket.on('launch_game', function() {
			game.launch();
		});

		socket.on('connection_lost', function() {
			window.location.reload();
		})

		// When the sockets sends the other players data (on connection)
		socket.on('get_players', function(players) {
			game.addPlayers(players);
		});

		// When a new player comes in the game
		socket.on('new_player', function(newPlayer) {
			if (game.user == undefined || typeof(game.user) != 'object' && !game.players[game.user])
			    return;
			if (!game.players.hasOwnProperty(newPlayer.id) && game.user != (typeof(game.user) == 'object' ? newPlayer : newPlayer.id) && newPlayer.roomId == (typeof(game.user) == 'object' ? game.user.roomId : game.players[game.user].roomId)) {
				game.addPlayer(newPlayer);
			}
		});

		// When a player leaves the game
		socket.on('player_left_room', function(player) {
			if (game.inLobby) {
				game.removePlayerFromLobbyRoom(player);	// We remove the player in the list of rooms
			}else if (game.players.hasOwnProperty(player.id)) {
				game.removePlayer(player);
			}
		});

		// When a player leaves the lobby
		socket.on('player_left_lobby', function(player) {
			if (game.inLobby) {
				game.removePlayerFromList(player);	// We remove the player in the list
			}
		});


	////////////////////
	// GAME EVENTS
	//
		// When the server sends datas from the game (on each frame)
		socket.on('get_game_state', function(data) {
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
		socket.on('start_level', function(asteroids) {
			game.asteroids = [];
			for (var asteroid in asteroids) {
				game.addAsteroid(asteroids[asteroid]);
			};
		});

		return socket;
	}
	return connectSocket;
});