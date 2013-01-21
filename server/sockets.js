var Bullet = require('./classes/Bullet').Bullet;

exports.init = function(io, init, game, lobbyManager) {
	io.sockets.on('connection', function(socket) {
		var player, mainLoop;

		// When a player authenticates with the login form
		socket.on('authenticate', function(data) {
			if (!GLOBAL.players[data.playerId]) {
				return;
			}
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
				if (room.mainLoop) {	// If the level is running, we tell the new user to start directly, but if not, he will have to wait until the next level starts
					socket.emit('start_level', {
						asteroids: room.asteroids,
						level: room.level
					});
				}
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
				game.launch(io, room);
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

						// We completely delete the player after 10 seconds (to allow him to reconnect with the same account if he wants to for a little while)
						setTimeout(function() {
							player = GLOBAL.players[player.id];

							// If the player is in the lobby or in a room, we don't delete him
							if (player == undefined || GLOBAL.lobby.users[player.id] != undefined) {
								return;
							}
							for (var room in GLOBAL.lobby.rooms) {
								if (GLOBAL.lobby.rooms.hasOwnProperty(room)) {
									room = GLOBAL.lobby.rooms[room];
									for (var roomPlayer in room.players) {
										if (room.players[roomPlayer] != undefined)
											return;
									}
								}
							}
							delete GLOBAL.players[player.id];	// We remove the player from the server's player, because he disconnected
						}, 10000);

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
			}
		});

		// When the user collides an asteroid and dies
		socket.on('user_dead', function(player) {
			var room = GLOBAL.lobby.rooms[player.roomId];
			if (!room)
				return;
			
			room.players[player.id].dead = true;
			room.players[player.id].score -= 5;
			room.players[player.id].speed = 2;
			room.broadcast(io, 'player_died', player.id);	// We tell everyone that he died
			// We plan the respawn
			setTimeout(function() {
				if (!room.players[player.id]) {
					return;
				}
				room.players[player.id].dead = false;
				room.players[player.id].x = 100 + Math.random() * 700;
				room.players[player.id].y = 100 + Math.random() * 500;
				room.players[player.id].angle = -180 + Math.random() * 360;
				room.broadcast(io, 'player_respawn', {
					id: player.id,
					x: room.players[player.id].x,
					y: room.players[player.id].y,
					score: room.players[player.id].score,
					angle: room.players[player.id].angle,
					speed: 2
				});
			}, 1000);
		});

		// When the user shoots a bullet
		socket.on('shoot_bullet', function(data) {
			var room = GLOBAL.lobby.rooms[data.roomId];
			if (!room)
				return;
			var player = room.players[data.playerId];
			if (!player)
				return;
			if (player.bullets == undefined)
				player.bullets = [];
			var bullet = new Bullet(data.bullet.x, data.bullet.y, data.bullet.angle, player.color);
			player.bullets.push(bullet);
			room.broadcast(io, 'bullet_shot', {
				bullet: bullet,
				playerId: player.id
			}, [player.id]);
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