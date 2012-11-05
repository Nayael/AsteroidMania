exports.init = function (io, initModule, gameModule) {
	io.sockets.on('connection', function(socket) {
		var playerData = gameModule.setPlayerData(socket.id);
		socket.emit('connection_ok', playerData);

		// A message from the client to the socket
		socket.on('message', function (data) {
			console.log(data);
		});

		// A message to broadcast to the other clients
		socket.on('brodcast_message', function (data) {
			socket.broadcast.emit('broadcast_message', {id: socket.id, message: data});
		});

		// When the client disconnects
		socket.on('disconnect', function (data) {
			if (players.hasOwnProperty(socket.id)){
				delete players[socket.id];
				socket.broadcast.emit('player_quit', {id: socket.id});
			}
		});

		// When the client sends the player's data to the socket after he connected
		socket.on('send_user_init_data', function (data) {
			// If it's the first player, we initialize the level
			var connectedPlayers = players;
			socket.emit('get_players', connectedPlayers);	// We send him info about the other players
			players[data.id] = data;						// We add him to the connected players
			socket.broadcast.emit('new_player', data);		// We tell everyone else he is connected
			
			if (Object.size(players) == 1) {
				initModule.initLevel(level);
				socket.emit('start_level', asteroids);
				socket.broadcast.emit('start_level', asteroids);
			// TODO Remplacer setInterval par un moyen plus propre de faire une boucle asynchrone
				setInterval(function () {
					gameModule.moveAsteroids();	// We handle the asteroids
				}, 30);
			}
			
			// When the client sends the player's data to the socket (on each frame)
			socket.on('send_user_data', function (data) {
				players[data.id] = data;	// We update his datas
				var gameData = {
					players: players,
					asteroids: []
				};
				for (var i in asteroids) {	// We also pass him the asteroids datas, to make them move on his screen
					gameData.asteroids.push(asteroids[i]);
				};
				socket.emit('get_game_state', gameData);	// We send him the players' and asteroids' datas
			});
		});
	});
}