exports.routes = function (app) {
	app.get('/', function(request, response) {
		response.render('home.jade');
	});
}