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
			game.inLobby = true;
			if (!game.lobby) {
				game.log('Bienvenue <strong>' + player.username + '</strong> !');
				$('#lobby').toggle();
				$('#players_list').empty();
			}

			for (user in lobby.users) {
				if (lobby.users.hasOwnProperty(user)) {
					$('#players_list').append('<div class="player">' + lobby.users[user].username + '</div>');
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

		game.addPlayerToLobby = function(username) {
			game.log(username + ' a rejoint le salon de jeu.');
			$('#players_list').append('<div class="player" data-username="' + username + '">' + username + '</div>');
		};

		game.removePlayerFromLobbyRoom = function(player) {
			game.log(player.username + ' a quitté la room #' + player.roomId);
			$('#room' + player.roomId).find('[data-playerid="' + player.id + '"]').remove();
			$('#room' + player.roomId + ' #nb_players').html(parseInt($('#room' + player.roomId + ' #nb_players').html()) - 1);
			if ($('#room' + player.roomId).hasClass('full'))
				$('#room' + player.roomId).removeClass('full')
		}
		
		/**
		 * Adds a room to the display list
		 * @param {Room} room	The room data
		 */
		game.addRoom = function(room) {
			$('#rooms').append('<div class="room selectable lobby_option" id="room' + room.id + '" data-roomid="' + room.id + '"><h5>Room #' + room.id + '</h5></div>');

			// We display the players' names
			$('#room' + room.id).append('<p class="room_players"></p>');
			for (playerId in room.players) {
				var roomPlayer = room.players[playerId];
				if (room.players.hasOwnProperty(playerId)) {
					$('#room' + room.id + ' .room_players').append('<p data-playerid="' + playerId + '">' + roomPlayer.username + '</p>');
				}
			}

			$('#room' + room.id).append('<p class="room_nb_players"><span id="nb_players">' + Object.size(room.players) + '</span> joueur(s)</p>');
			if (Object.size(room.players) >= 6) {
				$('#room' + room.id).removeClass('selectable').addClass('full');
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
