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
			game.user.ready = true;
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
			game.user.ready = false;
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
				if (lobby.users.hasOwnProperty(user) && user.id != player.id) {
					$('#players_list').append('<div class="player lobby_player" data-username="' + lobby.users[user].username + '">' + lobby.users[user].username + '</div>');
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

		/**
		 * Exits the game room to return to the lobby
		 */
		game.leave = function() {
			game.inLobby = true;
			delete game.onEachFrame;
			delete game.lobby;
			game.players = {};
			game.asteroids = [];
			gameEngine.socket.emit('player_leave_room', {
				id: game.user.id,
				username: game.user.username,
				roomId: game.user.roomId
			});
			delete game.user;
		};

		// We define the main loop
		onEachFrame(function() {
			if (game.onEachFrame) {
				var frameData = game.onEachFrame();
				if (frameData != null)  
					gameEngine.sendToServer(frameData);
			}
		});
	};

	/**
	 * Synchronizes the user with the server
	 * @param frameData	The data to send to the server
	 */
	gameEngine.sendToServer = function(frameData) {
		gameEngine.socket.emit('send_user_data', frameData.player);
		if (frameData.special) {
			if (frameData.special.die === true) {
				gameEngine.socket.emit('user_dead', {
					id: frameData.player.id,
					roomId: frameData.player.roomId
				});
			}
		}
	};

	return gameEngine;
});
