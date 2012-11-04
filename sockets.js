exports.init = function (io) {
	io.sockets.on('connection', function(socket) {
		var playerData = setPlayerData(socket);
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
			var connectedPlayers = players;
			socket.emit('get_players', connectedPlayers);	// We send him info about the other players
			players[data.id] = data;						// We add him to the connected players
			socket.broadcast.emit('new_player', data);		// We tell everyone else he is connected
		});

		// When the client sends the player's data to the socket (on each frame)
		socket.on('send_user_data', function (data) {
			players[data.id] = data;					// We update his datas
			socket.emit('get_players_data', players);	// We send him everyone else's datas
		});
	});
	
	function setPlayerData(socket) {
		var data = {
			id: socket.id,
			x: Math.random()*700,
			y: Math.random()*520,
			speed: 0,
			angle: 0
		};
		return data;
	}
}