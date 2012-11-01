var game = {};
$(function() {
	game.ship = new Ship(50, 50);
	game.canvas = document.getElementById('main_canvas');
	game.cx;

	var ship = game.ship, canvas = game.canvas, cx = game.cx;

	if (canvas.getContext)
		cx = canvas.getContext('2d');
	
	/************************************** fonction perSecond à définir dans le général ...

	game.perSecond = function () {
	    game.time = game.time || new Date();
	    var t = new Date();
	    var dt = (t - game.time)/1000;
	        
	    game.time = t;
	    return dt;
	};
	*****************************/
	/************************ à mettre dans le oneachframe
	var dt = game.perSecond();
	************************/

	onEachFrame(function() {
		cx.clearRect(0, 0, canvas.width, canvas.height);
		ship.control();
		ship.move(cx);
	});
});