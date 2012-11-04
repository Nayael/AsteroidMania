var socket = io.connect('http://192.168.1.105:8080');

// Once the connection is established
socket.on('connection_ok', function (data) {
	console.log('You joined the game !');
	game.init();	// We initialize the game
	socket.emit('send_player_data', game.user.username);	// We send the player data to the socket
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
socket.on('get_players', function (data) {
	console.log('Players: ', data);
});

// When a new player comes in the game
socket.on('new_player', function (data) {
	game.players[data.id] = data.data;
	console.log('New player : ', game.players[data.id]);
})

// When a player leaves the game
socket.on('player_quit', function (data) {
	console.log('game.players: ', game.players);
	console.log(/*game.players[*/data.id/*].username*/ + ' left the game');
	// delete game.players[data.id];
})