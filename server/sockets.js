exports.init = function(io, init, game, lobbyManager) {
	io.sockets.on('connection', function(socket) {
		var player, mainLoop;

		// When a player authenticates with the login form
		socket.on('authenticate', function(data) {
			GLOBAL.players[data.playerId].socket = socket.id;
			player = GLOBAL.players[data.playerId];
			if (player.token === data.token) {
				GLOBAL.lobby.users[player.id] = player;
				socket.emit('init_game', {
					player: player,
					lobby: GLOBAL.lobby
				});
				lobby.broadcast(io, 'joined_lobby', player.username, [player.id]);
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
			socket.emit('enter_room', {
				player: player
			});
			GLOBAL.lobby.broadcast(io, 'refresh_lobby', {
				lobby: getLobbyUsefulData(),
				message: player.username + ' a rejoint la room #' + room.id + '.'
			});
			init.initWaves(room);	// We initialize the room level
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
			socket.emit('enter_room', {
				playerId: player.id,
				players: room.players
			});
			room.broadcast(io, 'new_player', player);	// We tell everyone else he is connected
			if (room.getPlayersReady() >= 1) {	// If there are at least 3 players ready in the room, the game has already started
				player.ready = true;
				GLOBAL.players[player.id].ready = true;
				socket.emit('launch_game');
				socket.emit('start_level', room.asteroids);
			}
			GLOBAL.lobby.broadcast(io, 'refresh_lobby', {
				lobby: getLobbyUsefulData(),
				message: player.username + ' a rejoint la room #' + room.id + '.'
			});
		});

		// When a players says he is ready to start
		socket.on('ready_player', function(data) {
			if(!GLOBAL.lobby.rooms[data.roomId])
				return;
			var room = GLOBAL.lobby.rooms[data.roomId],
				player = room.players[data.playerId];
			GLOBAL.players[player.id].ready = true;
			player.ready = true;
			// If at least 3 players are ready, we start the game
			if (room.getPlayersReady() == 1) {
				room.startGame();
				game.launch(init, io, room);
			}
		});

		// When a players says he is not ready to start
		socket.on('unready_player', function(data) {
			if (GLOBAL.lobby.rooms[data.roomId])
				GLOBAL.lobby.rooms[data.roomId].players[data.playerId].ready = false;
		});

		// When a player leaves a room
		socket.on('player_leave_room', function(player) {
			playerLeaveRoom(GLOBAL.players[player.id], io, true);
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
						if (player.roomId != undefined && GLOBAL.lobby.rooms[player.roomId]) {	// If the player left while in a game room
							playerLeaveRoom(player, io);
						}else {	// Otherwise, he left while in the lobby
							GLOBAL.lobby.broadcast(io, 'player_left_lobby', {
								id: player.id,
								username: player.username,
							});
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

/**
 * To call when a player leaves his room
 * @param {Player} player	The player who left
 * @param {object} io		Socket.IO module, to communicate with clients
 * @param {bool} toLobby	Is the player back to the lobby or not (definitely gone) ?
 */
function playerLeaveRoom(player, io, toLobby) {
	var room = GLOBAL.lobby.rooms[player.roomId];
	GLOBAL.lobby.broadcast(io, 'player_left_room', {
		id: player.id,
		username: player.username,
		roomId: player.roomId
	});
	if (room)
		delete room.players[player.id];		// We remove him from his room
	delete player.roomId;
	player.ready = false;
	player.inGame = false;
	// TODO mettre le player en lobby que s'il retourne bien en lobby et pas s'il change de page
	if (toLobby) {
		player.inLobby = true;
		GLOBAL.lobby.users[player.id] = GLOBAL.players[player.id];
		if (room && Object.size(room.players) > 0) { // We send the player back to the lobby
			io.sockets.socket(GLOBAL.players[player.id].socket).emit('refresh_lobby', {
				lobby: getLobbyUsefulData()
			});
		}
	}

	// If there are no players left in the room
	if (room && Object.size(room.players) == 0) {
		clearInterval(room.mainLoop);
		delete GLOBAL.lobby.rooms[room.id];	// We delete the room
		GLOBAL.lobby.broadcast(io, 'refresh_lobby', {
			lobby: getLobbyUsefulData()
		});
	}else if (room) {	// Otherwise, we just tell the other players that he left
		room.broadcast(io, 'player_left_room', {id: player.id, username: player.username});
	}
}

function getLobbyUsefulData() {
	// We build the response data
	var response = {
		users: GLOBAL.lobby.users,
		rooms: {}
	};
	for (room in GLOBAL.lobby.rooms) {
		response.rooms[room] = {
			id: room,
			players: GLOBAL.lobby.rooms[room].players
		};
	}
	return response;
}