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
				socket.broadcast.emit('joined_lobby', player.username);
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
			socket.emit('launch_game', player);
			socket.broadcast.emit('refresh_lobby', {
				lobby: GLOBAL.lobby,
				message: player.username + ' a rejoint la room #' + room.id + '.'
			});
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
			socket.emit('launch_game', player);
			socket.broadcast.emit('refresh_lobby', {
				lobby: GLOBAL.lobby,
				message: player.username + ' a rejoint la room #' + room.id + '.'
			});
		});

		// When the client disconnects
		socket.on('disconnect', function() {
			for (playerId in GLOBAL.players) {
				if (GLOBAL.players.hasOwnProperty(playerId)) {
					player = GLOBAL.players[playerId];

			/*******************************************
			/*******************************************
					// TODO putain de timeout pour supprimer le joueur au bout d'un moment
			/*******************************************
			/*******************************************/

					// socket.broadcast.emit(player.username + ' a quitté le jeu.');
					// We get the player that left
					if (player.socket === socket.id) {
						if (player.roomId != undefined) {
							var room = GLOBAL.lobby.rooms[player.roomId];
							GLOBAL.lobby.broadcast(io, 'player_left_room', {
								id: player.id,
								username: player.username,
								roomId: player.roomId
							});
							delete room.players[player.id];		// We remove him from his room
							delete player.roomId;
							player.ready = false;
							// GLOBAL.lobby.users[player.id] = player;

							// If there are no players left in the room
							if (Object.size(room.players) == 0) {
								clearInterval(room.mainLoop);
								delete GLOBAL.lobby.rooms[room.id];	// We delete the room
								socket.broadcast.emit('refresh_lobby', {
									lobby: GLOBAL.lobby
								});
							}else {	// Otherwise, we just tell the other players that he left
								room.broadcast(io, 'player_left_room', {id: player.id, username: player.username});
							}
						}

						// player.disconnecting = true;
						// GLOBAL.players[player.id].osef = setTimeout(function() {
						// 	player = GLOBAL.players[player.id];
						// 	console.log('\n\ndisconnecting '+player.id);
						// 	console.log('\n\ndisconnecting ?'+player.disconnecting);
						// 	if (player == undefined || !player.disconnecting)	// if the player is not disconnecting anymore
						// 		return;
						// 	if (room != undefined) {
						// 		delete room.players[playerId];		// We remove him from his room
						// 		delete player.roomId;
						// 	}
							
						// 	player.ready = false;
						// 	GLOBAL.lobby.users[playerId] = player;
						// 	socket.broadcast.emit('message', player.username + ' a quitté le jeu.');
						// 	delete GLOBAL.players[playerId];
						// 	delete GLOBAL.lobby.users[playerId];

						// 	// If there are no players left in the room
						// 	if (room != undefined && Object.size(room.players) == 0) {
						// 		clearInterval(room.mainLoop);
						// 		delete GLOBAL.lobby.rooms[room.id];	// We delete the room
						// 		socket.broadcast.emit('refresh_lobby', {
						// 			lobby: GLOBAL.lobby
						// 		});
						// 	}else if (room != undefined) {	// Otherwise, we just tell the other players that he left
						// 		room.broadcast(io, 'player_quit', {id: player.id, username: player.username});
						// 	}
						// }, 5000);

					}
				}
			};
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
				if (room == undefined)
					return;
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