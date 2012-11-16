var gameEngine = {
	/**
	 * Initializes the game engine
	 */
	init: function (gameContainer) {
		game.init(gameContainer);
		gameEngine.socket = connectSocket();
		onEachFrame(function() {
			if (game.onEachFrame) {
				var userData = game.onEachFrame();
				gameEngine.syncToServer(userData);
			}
		});
	},

	/**
	 * Synchronizes the user with the server
	 * @param userData	The data to send to the server
	 */
	syncToServer: function(userData) {
		// TODO asynchrone : Si le joueur ne change pas de direction, on n'envoie pas les données : les autres joueurs calculent le déplacement de leur côté
		gameEngine.socket.emit('send_user_data', userData);
	}
};
