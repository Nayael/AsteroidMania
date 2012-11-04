var game = {};
game.init = function (data) {
	$(function() {
		game.players = {};
		game.user = {
			username : 'Player' + Math.floor(Math.random() * 99999)
		};
		game.canvas = document.getElementById('main_canvas');
		game.addPlayer(data, true);	// We add the user to the list of players
		
		game.perSecond = function () {
			game.time = game.time || new Date();
			var t = new Date();
			var dt = (t - game.time) / 100;
				
			game.time = t;
			return dt;
		};
		
		onEachFrame(function() {
			game.players[data.id].ship.control();	// We detect the pressed keys
			for (var index in game.players) {
				game.players[index].ship.move(game.canvas);
			}
		});
	});
};

game.addPlayer = function (playerData, isUser) {
	game.players[playerData.id] = {
		ship: new Ship(playerData.x, playerData.y, (isUser === true ? true : false)),
		data: playerData
	};
	if (isUser) {	// If we are creating the current user's ship
		for (var key in playerData) {
			game.user[key] = playerData[key];	// We keep his datas
		}
		game.players[playerData.id].data['username'] = game.user.username;
	}
	game.players[playerData.id].ship.render(game.canvas);
};