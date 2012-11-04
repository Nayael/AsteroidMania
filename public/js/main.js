var game = {};
game.init = function (user) {
	$(function() {
		game.players = {};
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
			game.players[user.id].control();	// We detect the pressed keys
			for (var index in game.players) {
				game.players[index].move(game.canvas);
			};

			var userData = {
				id : game.players[user.id].id,
				x : game.players[user.id].x,
				y : game.players[user.id].y,
				angle : game.players[user.id].angle,
				speed : game.players[user.id].speed
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
	game.players[playerData.id] = new Ship(playerData.x, playerData.y, (isUser === true ? true : false));
	game.players[playerData.id].id = playerData.id;
	game.players[playerData.id].username = playerData.username;

	game.players[playerData.id].render(game.canvas);	// We display the created user's ship
};