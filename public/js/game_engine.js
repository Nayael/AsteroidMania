define(['connector', 'onEachFrame'], function(connectSocket, onEachFrame) {
	var gameEngine = {};

	/**
	 * Initializes the game engine
	 */
	gameEngine.init = function(game, gameContainer) {
		game.init(gameContainer);
		gameEngine.socket = connectSocket();

		/**
		 * Displays the lobby screen
		 * @param {Object} lobby The lobby object
		 */
		game.showLobby = function(lobby, player) {
			game.log('Bienvenue <strong>' + player.username + '</strong> !');
			$('#lobby').toggle();
			if (Object.size(lobby.rooms) == 0) {
				$('#lobby').append('<div id="rooms">Aucune room de jeu disponible</div>');
			}else {
				for (roomId in lobby.rooms) {
				    if (lobby.rooms.hasOwnProperty(roomId)) {
						$('#lobby').append('<div id="rooms"></div>');
						$('#rooms').append('<div class="room selectable lobby_option" id="room' + roomId + '" data-roomid="' + roomId + '"><h5>Room #' + roomId + '</h5><p class="room_players">' + Object.size(lobby.rooms[roomId].players) + ' joueur(s)</p></div>');
						if (Object.size(lobby.rooms[roomId].players) >= 6) {
						    $('#room' + roomId).removeClass('selectable').addClass('full');
						}
				    }
				}
			}
			$('#lobby').append('<button id="create_room" class="lobby_option btn">Créer une room</button>');
			$('#create_room').click(function() {
				gameEngine.socket.emit('create_room', player);
			});
			$('.room.selectable').click(function() {
				gameEngine.socket.emit('join_room', {
					roomId: $(this).data('roomid'),
					player: player
				});
			});
			game.lobby = lobby;
		};
		

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
