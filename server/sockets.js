exports.init = function(io, init, game, lobbyManager) {
	io.sockets.on('connection', function(socket) {
		var player, mainLoop;

		socket.on('authenticate', function (data) {
			player = GLOBAL.players[data.playerId];	// We add him to the connected players
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
			socket.emit('launch_game', player);
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
		});

		// When the client disconnects
		socket.on('disconnect', function() {
			if (GLOBAL.players[socket.id] != undefined){
				var player = GLOBAL.players[socket.id];
				delete GLOBAL.players[socket.id];
				socket.broadcast.emit('player_quit', {id: player.id, username: player.username});
				
				// If there are no players left we stop the main loop
				// if (Object.size(GLOBAL.players) === 0) {
				// 	clearInterval(room.mainLoop);
				// }
			}
		});

		// When the client sends the player's data to the socket after he connected
		socket.on('init_user', function(player) {
			// var connectedPlayers = GLOBAL.players;
			var room = GLOBAL.lobby.rooms[player.roomId];
			socket.emit('get_players', room.players);	// We send him info about the other players
			socket.broadcast.emit('new_player', player);	// We tell everyone else he is connected
			
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