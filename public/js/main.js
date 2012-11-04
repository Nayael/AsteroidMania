var game = {};
game.init = function () {
	$(function() {
		game.ship = new Ship(50, 50, true);
		game.canvas = document.getElementById('main_canvas');
		
		game.perSecond = function () {
		    game.time = game.time || new Date();
		    var t = new Date();
		    var dt = (t - game.time) / 100;
		        
		    game.time = t;
		    return dt;
		};
		
		onEachFrame(function() {
			game.ship.control();
			game.ship.move();
			game.ship.render(game.canvas);
		});
	});
	game.players = {};
	game.user = {
		username : 'Player' + Math.floor(Math.random() * 99999999)
	};
};
