define(['Ship', 'Asteroid', 'Keyboard'], function(Ship, Asteroid, Keyboard) {
	var game = {};	// The game namespace

	/**
	 * Initializes the game's data
	 * @param {HTMLDivElement} gameContainer	The <div> which the canvas will be added in
	 */
	game.init = function(gameContainer) {
		game.players = {};
		game.asteroids = [];
		game.colors = ['#FF0000', '#00FF00', '#FFFF00'];
		gameContainer.append('<canvas id="main_canvas" width="800" height="540"></canvas>');
		game.canvas = document.getElementById('main_canvas');
	};

	/**
	 * Makes the player enter in the game room
	 */
	game.enterRoom = function() {
		game.inLobby = false;
		$('#lobby').empty();
		$('#lobby').toggle();
		$('#players_list .lobby_player').remove();
		$('#players_list_title').text('Joueurs connectés');
		$('#players_list').append('<div class="player room_player" data-username="' + game.user.username + '">' + game.user.username + '</div>');
		game.log('Bienvenue dans la room #' + game.user.roomId);
		game.log('Appuyez sur R si vous êtes prêt(e) à commencer.');
		Keyboard.on('keydown', 'R', game.readyPlayer);
		Keyboard.on('keydown', 'ESCAPE', game.confirmLeave);
	};

	/**
	 * Launches the game
	 */
	game.launch = function() {
		Keyboard.remove('keydown', 'R', game.readyPlayer);
		Keyboard.remove('keydown', 'R', game.unreadyPlayer);
		/**
		 * The game's main loop
		 * @return {Object} The user's new position
		 */
		game.onEachFrame = function() {
			var message = null;
			game.user.checkControls();			// We detect the pressed keys
			game.user.move(game.canvas);

			for (var index in game.players) {
				game.players[index].render(game.canvas);
				if (game.players[index] != game.user) {
					message = game.user.handleCollision(game.players[index]);
					if (message)
						game.log(message);
				}
			};
			for (var asteroid in game.asteroids) {
				game.asteroids[asteroid].render(game.canvas);
				message = game.user.handleCollision(game.asteroids[asteroid]);
				if (message)
					game.log(message);
			};

			return {
				id : game.user.id,
				roomId : game.user.roomId,
				x : game.user.x,
				y : game.user.y,
				angle : game.user.angle,
				speed : game.user.speed
			};
		};
	};

	/**
	 * Calculates the delta to move the elements per second
	 * @return {Number} The delta value
	 */
	game.perSecond = function() {
		game.time = game.time || new Date();
		var t = new Date();
		var dt = (t - game.time) / 100;
			
		game.time = t;
		return dt;
	};

	/**
	 * Adds a player ship to the game
	 * @param {Object} player	The player's data
	 */
	game.addPlayer = function(player) {
		if (game.players[player.id] != undefined) // If the player already exists, we don't add it
			return;
		
		if (player.isUser === true) {	// If we are creating the current user's ship
			game.user = new Ship(player, game.colors);
			game.user.token = player.token;
			game.user.render(game.canvas);	// We display the created user's ship
		}else {
			game.players[player.id] = new Ship(player, game.colors);
			game.players[player.id].render(game.canvas);	// We display the created user's ship
			game.log(player.username + ' a rejoint le jeu');
			$('#players_list').append('<div class="player room_player" data-username="' + player.username + '">' + player.username + '</div>');
		}
	};

	/**
	 * Adds the other players to the game map
	 * @param {Object} players	The players to add
	 */
	game.addPlayers = function(players) {
		for (var player in players) {
			if (!game.players.hasOwnProperty(player)) {
				game.addPlayer(players[player]);
			}
		};
	};

	/**
	 * Removes a player from the game room
	 * @param {Object} player	The player to remove
	 */
	game.removePlayer = function(player) {
		game.removePlayerFromList(player);
		var leavingPlayer = game.players[player.id];
		leavingPlayer.remove(game.canvas);
		delete game.players[player.id];
	}

	/**
	 * Adds a player ship to the game
	 * @param {Object} asteroid	The asteroid to add's data
	 */
	game.addAsteroid = function(asteroid) {
		game.asteroids.push(new Asteroid(asteroid));
	};

	/**
	 * Displays a message to the player in the window aside the game canvas
	 * @param {string} message	The message to display
	 */
	game.log = function(message) {
		$('#logger').append('<div class="message">' + message + '</div>');
		$("#logger").scrollTop($("#logger")[0].scrollHeight)
	};

	game.addPlayerToLobby = function(username) {
		game.log(username + ' a rejoint le salon de jeu');
		$('#players_list').append('<div class="player" data-username="' + username + '">' + username + '</div>');
	};

	game.removePlayerFromLobbyRoom = function(player) {
		game.log(player.username + ' a quitté la room #' + player.roomId);
		$('#room' + player.roomId).find('[data-playerid="' + player.id + '"]').remove();
		$('#room' + player.roomId + ' #nb_players').html(parseInt($('#room' + player.roomId + ' #nb_players').html()) - 1);
		if ($('#room' + player.roomId).hasClass('full'))
			$('#room' + player.roomId).removeClass('full')
	};

	game.removePlayerFromList = function(player) {
		game.log(player.username + ' a quitté le jeu');
		$('#players_list').find('[data-username="' + player.username + '"]').remove();
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

	/**
	 * Sends data to the server to authenticate the user
	 * @param {string} username The user's name
	 * @param {function} callback The callback in case of success of the request
	 */
	game.authenticate = function(username, callback) {
		$.ajax({
			url: '/auth',
			type: 'POST',
			data: {username: username},
			dataType: 'json',
			success: function(data) {
				if (data.success) {
					$('.prompt').remove();	// We remove the prompt dialog
					$('#game_content').data('playerid', data.player.id);
					$('#game_content').data('token', data.player.token);
					if (callback)
						callback();
				}else if (data.error === 'username_already_taken') {
					alert('Le pseudo est déjà utilisé.');
				}
			}
		});
	};

	/**
	 * Displays a popup for the player to confirm that he wants to leave
	 */
	game.confirmLeave = function() {
		// First, we remove all the keyboard listeners
		Keyboard.remove('keydown', 'ESCAPE', game.confirmLeave);
		Keyboard.remove('keydown', 'R', game.readyPlayer);
		Keyboard.remove('keydown', 'R', game.unreadyPlayer);

		// We display the popup
		$('body').prepend('<div class="prompt" id="confirm-leave"></div>');
		$('#confirm-leave').append('<span><h3>Voulez-vous vraiment quitter le jeu ?</h3><p><button id="leave-yes" class="btn">Oui</button><button id="leave-no" class="btn">Non</button></p></span>');
		$('#confirm-leave .btn').css('margin', '5px');
		$('#leave-yes').click(function() {
			$('#confirm-leave').remove();
			game.leave();
			// We clear the game canvas
			if (game.canvas.getContext) {
				var ctx = game.canvas.getContext('2d');
				ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
			}
		});
		$('#leave-no').click(function() {
			$('#confirm-leave').remove();
			Keyboard.on('keydown', 'ESCAPE', game.confirmLeave);
			if (!game.onEachFrame) {	// If the game has not started yet
				Keyboard.on('keydown', 'R', game.user.ready ? game.unreadyPlayer : game.readyPlayer);
			}
		});
		$('#confirm-leave span').css({top:'50%',left:'50%',margin:'-' + ($('#confirm-leave span').height() / 2) + 'px 0 0 -' + ($('#confirm-leave span').width() / 2) + 'px'});
		$('#confirm-leave').toggle();
	};

	return game;
});