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
		socket.on('send_player_data', function (data) {
			socket.emit('get_players', players);	// We send him info about the other players
			players[socket.id] = {username : data};
			socket.broadcast.emit('new_player', {id : socket.id, data : {
					username : data
				}
			});	// We tell everyone else he connected
		});

		socket.emit('connection_ok');
	});
}