var game = {};
$(function() {
	game.ship = new Ship(50, 50);
	game.canvas = document.getElementById('main_canvas');

	var ship = game.ship, canvas = game.canvas, cx = game.cx;
	
	game.perSecond = function () {
	    game.time = game.time || new Date();
	    var t = new Date();
	    var dt = (t - game.time)/1000;
	        
	    game.time = t;
	    return dt;
	};
var dt = game.perSecond();
	onEachFrame(function() {
		ship.control();
		ship.move();
		ship.render(canvas);
	});
});