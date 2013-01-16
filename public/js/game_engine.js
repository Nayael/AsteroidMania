define(['connector', 'onEachFrame', 'Keyboard'], function(connectSocket, onEachFrame, Keyboard) {
	var gameEngine = {};

	/**
	 * Initializes the game engine
	 */
	gameEngine.init = function(game, gameContainer) {
		game.init(gameContainer);
		gameEngine.socket = connectSocket();

		/**
		 * Sets the player ready
		 */
		game.readyPlayer = function() {
			game.log('Appuyez sur R si vous n\'êtes pas prêt(e) à commencer.');
			user.ready = true;
			gameEngine.socket.emit('ready_player', {
				playerId: game.user.id,
				roomId: game.user.roomId
			});
			Keyboard.on('keydown', 'R', game.unreadyPlayer);
		}

		/**
		 * Sets the player not ready
		 */
		game.unreadyPlayer = function() {
			game.log('Appuyez sur R si vous êtes prêt(e) à commencer.');
			user.ready = false;
			gameEngine.socket.emit('unready_player', {
				playerId: game.user.id,
				roomId: game.user.roomId
			});
			Keyboard.on('keydown', 'R', game.readyPlayer);
		}

		/**
		 * Displays the lobby screen
		 * @param {Object} lobby The lobby object
		 */
		game.showLobby = function(lobby, player) {
			game.inLobby = true;
			if (!game.lobby) {
				game.log('Bienvenue <strong>' + player.username + '</strong> !');
				$('#lobby').toggle();
				$('#players_list').empty();
				$('#players_list_title').text('Joueurs en attente');
			}

			for (user in lobby.users) {
				if (lobby.users.hasOwnProperty(user)) {
					$('#players_list').append('<div class="player" data-username="' + lobby.users[user].username + '">' + lobby.users[user].username + '</div>');
				}
			}

			$('#lobby').append('<h2>Asteroid Mania</h2>');
			$('#lobby').append('<div id="rooms"></div>');
			if (Object.size(lobby.rooms) == 0) {
				$('#rooms').append('Aucune room de jeu disponible');
			}else {
				for (roomId in lobby.rooms) {
					if (lobby.rooms.hasOwnProperty(roomId)) {
						game.addRoom(lobby.rooms[roomId]);
					}
				}
			}
			$('#rooms').append('<button id="create_room" class="lobby_option btn">Créer une room</button>');
			$('#create_room').click(function() {
				gameEngine.socket.emit('create_room', player);
			});
			$('.room.selectable').click(function() {
				gameEngine.socket.emit('join_room', {
					roomId: $(this).data('roomid'),
					player: player
				});
			});
			$('.room').hover(function() {
				var room_players = $(this).find('.room_players');
				room_players.toggle();
			}, function() {
				$(this).find('.room_players').toggle();
			});
			game.lobby = lobby;
			
			/**
			 * Refreshes the lobby
			 * @param {Lobby} lobby	The new lobby data
			 */
			game.refreshLobby = function(lobby) {
				if (!game.onEachFrame) {	// If the game is not running, we refresh the lobby display
					$('#lobby').empty();
					$('#players_list').empty();
					game.showLobby(lobby, player);
				}
			}
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
