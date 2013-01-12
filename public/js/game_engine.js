define(['connector', 'onEachFrame'], function(connectSocket, onEachFrame) {
	var gameEngine = {};

	/**
	 * Initializes the game engine
	 */
	gameEngine.init = function(game, gameContainer) {
		game.init(gameContainer);
		gameEngine.socket = connectSocket();

		// We define the main loop
		onEachFrame(function() {
			if (game.onEachFrame) {
				var userData = game.onEachFrame();
				if (userData != null)  
					gameEngine.sendToServer(userData);
			}
		});
	};

	/**
	 * Synchronizes the user with the server
	 * @param userData	The data to send to the server
	 */
	gameEngine.sendToServer = function(userData) {
		// TODO asynchrone : Si le joueur ne change pas de direction, on n'envoie pas les données : les autres joueurs calculent le déplacement de leur côté
		gameEngine.socket.emit('send_user_data', userData);
	};

	return gameEngine;
});
