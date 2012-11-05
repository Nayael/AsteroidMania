exports.init = function (io, game) {
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
			// If it's the first player, we initialize the level
			var connectedPlayers = players;
			socket.emit('get_players', connectedPlayers);	// We send him info about the other players
			players[data.id] = data;						// We add him to the connected players
			socket.broadcast.emit('new_player', data);		// We tell everyone else he is connected
			
			if (Object.size(players) == 1) {
				game.initLevel(level);
				socket.emit('start_level', asteroids);
				socket.broadcast.emit('start_level', asteroids);
			}
			
			// When the client sends the player's data to the socket (on each frame)
			socket.on('send_user_data', function (data) {
				players[data.id] = data;					// We update his datas
				var gameData = {
					players: players,
					asteroids: []
				};
				console.log('\n\n\nasteroids: ', asteroids);
				console.log('\n\n\n');
				for (var i in asteroids) {	// We also pass him the asteroids datas, to make them move on his screen
					gameData.asteroids.push(asteroids[i]);
				};
				socket.emit('get_game_state', gameData);	// We send him the players' and asteroids' datas
			});
		});

	});
	
	function setPlayerData(socket) {
		var x, y, angle, color;
		switch (Object.size(players)){
			case 0: case 3:
				y = 150;
				color = "#FF0000";
				break;
			case 1: case 4:
				y = 300;
				color = "#00FF00";
				break;
			case 2: case 5:
				y = 450;
				color = "#0000FF";
				break;
			default:
				x = Math.random()*700;
				y = Math.random()*520;
				color = "#FF0000";
				break;
		}
		switch (Object.size(players)){
			case 0: case 1: case 2:
				x = 200;
				angle = 180;
				break;
			case 3: case 4: case 5:
				x = 600;
				angle = 0;
				break;
			default:
				x = Math.random()*700;
				y = Math.random()*520;
				color = "#FF0000";
				break;
		}
		var data = {
			id: socket.id,
			x: x,
			y: y,
			speed: 0,
			angle: angle,
			color: color
		};
		return data;
	}
}