var socket = io.connect('http://192.168.1.105:8080');

// Once the connection is established
socket.on('connection_ok', function (data) {
	game.init(data);			// We initialize the game
	var user = game.user;
	socket.emit('send_user_data', user);	// We send the user data to the socket
	game.user = data.id;	// We only keep the id, since the user is now with the other players
});

// When a message from the server arrives
socket.on('message', function (data) {
	console.log('Message from server :', data);
});

// When a broadcast message from another player arrives
socket.on('global_message', function (data) {
	console.log('Message from ' + data.id + ' : ', data.message);
});

// When the sockets sends the other players data
socket.on('get_players', function (players) {
	for (var player in players) {
		if (!game.players.hasOwnProperty(player) && player != game.user) {
			game.addPlayer(players[player]);
		}
		game.players[player].data = players[player];
	}
	console.log('Players: ', game.players);
});

// When a new player comes in the game
socket.on('new_player', function (newPlayer) {
	if (!game.players.hasOwnProperty(newPlayer.id) && newPlayer.id != game.user) {
		game.addPlayer(newPlayer);
	}
	console.log(game.players[newPlayer.id].data.username + ' has joined the game.');
})

// When a player leaves the game
socket.on('player_quit', function (data) {
	var leavingPlayer = game.players[data.id];
	console.log(leavingPlayer.data.username + ' has left the game.');
	delete game.players[data.id];
})