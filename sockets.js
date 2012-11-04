exports.init = function (io) {
	io.sockets.on('connection', function(socket) {
		// When the client disconnects
		socket.on('disconnect', function (data) {
			if (players.hasOwnProperty(socket.id)){
				delete players[socket.id];
				socket.broadcast.emit('player_quit', {id: socket.id});
			}
		});

		// A message from the client to the socket
		socket.on('message', function (data) {
			console.log(data);
		});

		// A message to broadcast to the other clients
		socket.on('global_message', function (data) {
			console.log('Message from ' + socket.id + ' : ', data);
			socket.broadcast.emit('global_message', {id: socket.id, message: data});
		});

		// When the client sends the player's data to the socket after he connected
		socket.on('send_user_data', function (data) {
			console.log('\n\n\nUSER DATA: ', data);console.log('\n\n');
			var connectedPlayers = players;
			socket.emit('get_players', connectedPlayers);	// We send him info about the other players
			players[data.id] = data;						// We had him to the connected players
			socket.broadcast.emit('new_player', data);		// We tell everyone else he is connected
		});

		var playerData = setPlayerData(socket);
		console.log('\n\n\n\n**************CONNECTION OK***************************');
		socket.emit('connection_ok', playerData);
	});
	
	function setPlayerData(socket) {
		var data = {id: socket.id};
		data['x'] = Math.random()*700;
		data['y'] = Math.random()*520;
		return data;
	}
}