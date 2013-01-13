exports.checkAuth = function(request, response, next) {
	if (request.session.playerId != undefined && request.session.playerId != null) {
		request.currentPlayer = players[request.session.playerId];
		next();
	}else {
		response.render('game.jade', {login: true});
	}
};

/**
 * Initializes authentication
 */
exports.initAuth = function(app, express) {
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: '4f0d2fab2581cbde178ef3c56b985a48',
		store: new express.session.MemoryStore({reapInterval: 60000 * 10})
	}));
}