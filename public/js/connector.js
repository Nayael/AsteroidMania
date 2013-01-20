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
			if (data.players != undefined) {
				// We add the players to the map
				data.players[data.playerId].isUser = true;
				game.addPlayers(data.players);
			}else if(data.player != undefined) {
				data.player.isUser = true;
				game.addPlayer(data.player);
			}
			game.enterRoom();
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
		// socket.on('get_players', function(players) {
		// 	game.addPlayers(players);
		// });

		// When a new player comes in the game
		socket.on('new_player', function(newPlayer) {
			if (game.user == undefined)
			    return;
			if (!game.players.hasOwnProperty(newPlayer.id) && game.user.id != newPlayer.id && game.user.username != newPlayer.username && newPlayer.roomId == game.user.roomId) {
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

		// When a player dies
		socket.on('player_died', function(playerId) {
			if (!game.inLobby) {
				if (game.user.id == playerId) {
					game.user.die(game.canvas);
				}else if (game.players[playerId]) {
					game.players[playerId].die(game.canvas);
				}
			}
		});

		// When a player respawns
		socket.on('player_respawn', function(player) {
			if (!game.inLobby) {
				if (game.user.id == player.id) {
					game.user.respawn(player);
				}else if (game.players[player.id]) {
					game.players[player.id].respawn(player);
				}
			}
		});

		// When the level is over
		socket.on('level_over', function(data) {
			game.endLevel(data);
		});


	////////////////////
	// GAME EVENTS
	//
		// When the server sends datas from the game (on each frame)
		socket.on('get_game_state', function(data) {
			if (game.players == undefined)
				return;
			
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
			game.time = data.time;
		});

		// When the server starts the level
		socket.on('start_level', function(asteroids) {
			game.startLevel(asteroids);
		});

		return socket;
	}
	return connectSocket;
});