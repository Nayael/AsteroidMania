exports.checkAuth = function(req, res, next) {
	if (req.session.playerId !== null) {
		req.currentPlayer = players[req.session.playerId];
		console.log('req.currentPlayer: ', req.currentPlayer);
		next();
	}else {
		// res.redirect('/game', {login: true});
		res.redirect('/login');
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