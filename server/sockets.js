exports.init = function(io, init, game, lobbyManager) {
	io.sockets.on('connection', function(socket) {
		var player, mainLoop;

		// When a player authenticates with the login form
		socket.on('authenticate', function (data) {
			GLOBAL.players[data.playerId].socket = socket.id;
			player = GLOBAL.players[data.playerId];
			if (player.token === data.token) {
				socket.emit('init_game', {
					player: player,
					lobby: GLOBAL.lobby
				});
			}
		});

		// A message from the client to the socket
		socket.on('message', function(data) {
			console.log(data);
		});

		// When a player decides to create a room
		socket.on('create_room', function(player) {
			var room = lobbyManager.createRoom(player);
			if (room === false) {
				socket.emit('could_not_create_room');
				return;
			}
			player = room.players[player.id];
			player.roomId = room.id;
			GLOBAL.players[player.id].roomId = room.id;
			socket.emit('launch_game', player);
			socket.broadcast.emit('refresh_lobby', GLOBAL.lobby);
		});

		// When a player decides to join a room
		socket.on('join_room', function(data) {
			var room = lobbyManager.joinRoom(data.roomId, data.player);
			if (!room) {
				socket.emit('could_not_join_room');
				return;
			}
			player = room.players[data.player.id];
			player.roomId = room.id;
			GLOBAL.players[player.id].roomId = room.id;
			socket.emit('launch_game', player);
		});

		// When the client disconnects
		socket.on('disconnect', function() {
			for (playerId in GLOBAL.players) {
				if (GLOBAL.players.hasOwnProperty(playerId)) {
					player = GLOBAL.players[playerId];

					// We get the player that left
					if (player.socket === socket.id) {
						var room = GLOBAL.lobby.rooms[player.roomId];
						delete room.players[player.id];				// We remove him from his room
						player.ready = false;
						if (Object.size(room.players) === 0) {			// If there are no players left in the room
							clearInterval(room.mainLoop);
							delete GLOBAL.lobby.rooms[player.roomId];	// We delete the room
							socket.broadcast.emit('refresh_lobby', GLOBAL.lobby);
						}else {	// Otherwise, we just tell the other players that he left
							room.broadcast(io, 'player_quit', {id: player.id, username: player.username});
						}
					}
				}
			}
		});

		// When the client sends the player's data to the socket after he connected
		socket.on('init_user', function(player) {
			var room = GLOBAL.lobby.rooms[player.roomId];
			socket.emit('get_players', room.players);	// We send him info about the other players
			room.broadcast(io, 'new_player', player);	// We tell everyone else he is connected
			
			// If it's the first player, we initialize the level
			if (Object.size(room.players) == 1) {
				init.initLevel(room);
				socket.emit('start_level', room.asteroids);

				// We start the main loop
				room.mainLoop = setInterval(function() {
					game.moveAsteroids(room.id);	// We handle the asteroids
				}, 1000 / 60);
			}
		});

		// When the client sends the player's data to the socket (on each frame)
		socket.on('send_user_data', function(player) {
			if (GLOBAL.players[player.id] == undefined) {	// If the player doesn't exist
				socket.emit('connection_lost');
			}else {
				// We update his data
				var room = GLOBAL.lobby.rooms[player.roomId];
				room.players[player.id].x = player.x;
				room.players[player.id].y = player.y;
				room.players[player.id].angle = player.angle;
				room.players[player.id].speed = player.speed;

				var gameData = {
					players: room.players,
					asteroids: []
				};
				for (var i in room.asteroids) {	// We also pass him the asteroids datas, to make them move on his screen
					gameData.asteroids.push(room.asteroids[i]);
				};
				socket.emit('get_game_state', gameData);	// We send him the players' and asteroids' datas
			}
		});
	});
};