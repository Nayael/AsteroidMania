var game = {};
game.init = function (user) {
	$(function() {
		game.players = {};
		game.asteroids = [];
		game.colors = ['#FF0000', '#00FF00', '#FFFF00'];
		game.canvas = document.getElementById('main_canvas');
		game.addPlayer(user, true);	// We add the user to the list of players
		
		game.perSecond = function() {
			game.time = game.time || new Date();
			var t = new Date();
			var dt = (t - game.time) / 100;
				
			game.time = t;
			return dt;
		};
		
		onEachFrame(function() {
			var player = game.players[user.id];
			player.control();	// We detect the pressed keys
			player.move(game.canvas);	// We detect the pressed keys

			for (var index in game.players) {
				game.players[index].render(game.canvas);
				if (game.players[index] != player) {
					player.handleCollision(game.players[index]);
				}
			};

			for (var asteroid in game.asteroids) {
				game.asteroids[asteroid].render(game.canvas);
				player.handleCollision(game.asteroids[asteroid], true);
			};

			var userData = {
				x : player.x,
				y : player.y,
				angle : player.angle,
				speed : player.speed
			};
			socket.emit('send_user_data', userData);
		});
	});
};

game.user = {
	username : 'Player' + Math.floor(Math.random() * 99999)
};

game.addPlayer = function (playerData, isUser) {
	if (isUser) {	// If we are creating the current user's ship
		playerData['username'] = game.user.username;
		game.user = playerData;
	}
	game.players[playerData.id] = new game.Ship(playerData.x, playerData.y, playerData.angle, playerData.color, (isUser === true ? true : false));
	game.players[playerData.id].id = playerData.id;
	game.players[playerData.id].username = playerData.username;

	game.players[playerData.id].render(game.canvas);	// We display the created user's ship
};

game.addAsteroid = function (asteroid) {
	game.asteroids.push(asteroid);
}

game.log = function (message) {
	$('#logger').append('<div class="message">' + message + '</div>');
	console.log(message);
}