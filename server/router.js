exports.route = function (app, checkAuth) {
	
	app.get('/', function(request, response) {
		response.render('home.jade');
	});
	
	app.get('/game', checkAuth, function(request, response) {
		response.render('game.jade', {
			player: request.currentPlayer
		});
	});

	app.get('/technical', function(request, response) {
		response.render('technical.jade');
	});

	app.post('/auth', function(request, response) {
		for (player in GLOBAL.players) {
			player = GLOBAL.players[player];
			if (player.username === request.param('username')) {
				response.json({error: 'username_already_taken'});
				return;
			}
		}
		var player = app.game.createOrFindPlayer(request.param('username'));
		request.session.playerId = player.id;
		response.json({success: true, player: player});
	});
};