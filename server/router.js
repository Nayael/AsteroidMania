exports.route = function (app) {
	
	app.get('/', function(request, response) {
		response.render('home.jade');
	});
	
	app.get('/game', function(request, response) {
		response.render('game.jade');
	});

	app.get('/technical', function(request, response) {
		response.render('technical.jade');
	});

	app.post('/auth', function(request, response) {
		
	})
}