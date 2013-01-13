exports.init = function(io, initModule, game) {
	io.sockets.on('connection', function(socket) {
		var player, mainLoop;

		socket.on('authenticate', function (data) {
			player = players[data.playerId];
			if (player.token === data.token) {
				socket.emit('launchGame', player);
			}
		});

		// A message from the client to the socket
		socket.on('message', function(data) {
			console.log(data);
		});

		// When the client disconnects
		socket.on('disconnect', function() {
			if (players[socket.id] != undefined){
				var player = players[socket.id];
				delete players[socket.id];
				socket.broadcast.emit('player_quit', {id: player.id, username: player.username});
				
				// If there are no players left we stop the main loop
				if (Object.size(players) === 0) {
					clearInterval(mainLoop);
				}
			}
		});

		// When the client sends the player's data to the socket after he connected
		socket.on('send_user_init_data', function(data) {
			var connectedPlayers = players;
			socket.emit('get_players', connectedPlayers);	// We send him info about the other players
			players[data.id] = data;						// We add him to the connected players
			socket.broadcast.emit('new_player', data);		// We tell everyone else he is connected
			
			// If it's the first player, we initialize the level
			if (Object.size(players) == 1) {
				initModule.initLevel(level);
				socket.emit('start_level', asteroids);
				socket.broadcast.emit('start_level', asteroids);

				// We start the main loop
				mainLoop = setInterval(function() {
					game.moveAsteroids();	// We handle the asteroids
				}, 1000 / 60);
			}
		});

		// When the client sends the player's data to the socket (on each frame)
		socket.on('send_user_data', function(data) {
			if (players[data.id] == undefined) {	// If the player doesn't exist
				socket.emit('connection_lost');
			}else {
				// We update his datas
				players[data.id].x = data.x;
				players[data.id].y = data.y;
				players[data.id].angle = data.angle;
				players[data.id].speed = data.speed;

				var gameData = {
					players: players,
					asteroids: []
				};
				for (var i in asteroids) {	// We also pass him the asteroids datas, to make them move on his screen
					gameData.asteroids.push(asteroids[i]);
				};
				socket.emit('get_game_state', gameData);	// We send him the players' and asteroids' datas
			}
		});
	});
};