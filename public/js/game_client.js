define(['Ship', 'Asteroid', 'Bullet', 'Keyboard'], function(Ship, Asteroid, Bullet, Keyboard) {
	var game = {};	// The game namespace

	/**
	 * Initializes the game's data
	 * @param {HTMLDivElement} gameContainer	The <div> which the canvas will be added in
	 */
	game.init = function(gameContainer, socket) {
		game.players = {};
		game.asteroids = [];
		game.colors = ['#FF0000', '#00FF00', '#FFFF00'];
		gameContainer.append('<canvas id="main_canvas" width="800" height="540"></canvas>');
		game.canvas = document.getElementById('main_canvas');
	};

	/** 
	 * Sets the room's remaining game time
	 */
	game.resetTime = function() {
		game.time = 2000 * 60;
	}

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
		Keyboard.on('keydown', 'R', game.readyPlayer);
		Keyboard.on('keydown', 'ESCAPE', game.confirmLeave);
		game.toggleReadyText();
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
			var message = '', returnData = {}, special = [];

			// We render the player only if he is not dead
			if (!game.user.dead) {
				game.user.checkControls();			// We detect the pressed keys
				game.user.move(game.canvas);
			}else {	// If he is, we only clear the canvas on each frame
				game.user.remove(game.canvas);
			}
			// We handle the player's bullets
			for (var i = 0; i < game.user.bullets.length; i++) {
				// We make the bullets move
				if (game.user.bullets[i].move(game.canvas) === false) {	// If the bullet passes the canvas view
					game.user.bullets.splice(i, 1);	// We delete it
					continue;
				}
				// If the user can't shoot, it means there is a new bullet
				// We will send the new bullet data to the server
				if (i == game.user.bullets.length - 1 && game.user.shooting) {
					game.user.shooting = false;
					special.push({
						bullet: {
							x: game.user.bullets[i].x,
							y: game.user.bullets[i].y,
							angle: game.user.bullets[i].angle
						}
					});
				}
			};

			// We render all the players
			for (var index in game.players) {
				if (!game.players[index].dead) {
					game.players[index].render(game.canvas, Ship);
					// We handle the player's bullets
					for (var i = 0, bullet; i < game.players[index].bullets.length; i++) {
						bullet = game.players[index].bullets[i];
						// If the bullet passes the canvas view
						if (bullet.x < 0 || bullet.x > game.canvas.width || bullet.y < 0 || bullet.y > game.canvas.height) {
							game.players[index].bullets.splice(i, 1);
							i--;
							continue;
						}
						game.players[index].bullets[i].render(game.canvas);
					};

					// We handle collisions
					message = game.user.handleCollision(game.players[index]);
					if (typeof(message) == 'string')
						game.log(message);
				}
			};

			// We render the asteroids and test for collisions
			for (var asteroid in game.asteroids) {
				game.asteroids[asteroid].render(game.canvas);
				message = game.user.handleCollision(game.asteroids[asteroid]);
				if (typeof(message) == 'string')
					game.log(message);
				else if (typeof(message) == 'object' && message != null && special.indexOf(message) == -1)
					special.push(message);
			};

			if (!game.user.dead) {
				returnData.player = {
					id : game.user.id,
					roomId : game.user.roomId,
					x : game.user.x,
					y : game.user.y,
					angle : game.user.angle,
					speed : game.user.speed
				};
				if (special.length > 0) {	// We send special data if there is (death, bullets)
					returnData.special = {};
					for (var i = 0; i < special.length; i++) {
						if (special[i].die === true) {	// If the player died
							game.user.dead = true;
							returnData.special.die = true;	// We will say it to the server, in the return data to the game engine
						}
						if (special[i].bullet) {	// If the player shot a bullet
							returnData.special.bullet = special[i].bullet;
						}
					};
				}
				game.displayHUD();	// We show the remaining time
				return returnData;
			}else {
				game.displayHUD();	// We show the remaining time
			}
		};
	};

	game.startLevel = function(data) {
		$('#end_screen').hide();	// We hide the end screen in case it is displayed
		$('#end_screen').empty();
		game.resetTime();
		game.user.score = data.playerScore || 0;
		game.level = data.level;
		game.asteroids = [];
		for (var asteroid in data.asteroids) {
			game.addAsteroid(data.asteroids[asteroid]);
		};
	}

	game.endLevel = function(data) {
		game.time = 0;	// We stop the game
		var scores = [];
		$('#content').append('<div id="end_screen"></div>');
		$('#end_screen').append('<h2>Temps écoulé</h2>');
		
		// We get the players' scores
		scores.push([game.user.username, game.user.score]);
		game.user.score = 0;
		for (player in game.players) {
			if (game.players.hasOwnProperty(player)) {
				scores.push([game.players[player].username, game.players[player].score]);
				game.players[player].score = 0;
			}
		}
		scores.sort(function(a, b) {return b[1] - a[1];});	// We order them by descending score
		// We display them
		for (var i = 0; i < scores.length; i++) {
			$('#end_screen').append('<div class="player_score">' + scores[i][0] + ' : ' + scores[i][1] + ' pts</div>');
		};
		$('#end_screen').append('<h3>Préparez-vous pour la prochaine bataille !</h3>');
		$('#end_screen').toggle();
		
		delete game.lobby;
		game.asteroids = [];
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
			game.user.render(game.canvas, Ship);	// We display the created user's ship
		}else {
			game.players[player.id] = new Ship(player, game.colors);
			game.players[player.id].render(game.canvas, Ship);	// We display the created user's ship
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
		leavingPlayer.remove(game.canvas);	// We remove the ship from the canvas
		delete game.players[player.id];
		// We render the other ships again, just in case the game is not started
		for (player in game.players) {
			if (game.players.hasOwnProperty(player)) {
				game.players[player].render(game.canvas);
			}
		}
		game.user.render(game.canvas);
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

	/**
	 * Displays information to the player
	 */
	game.displayHUD = function() {
		if (game.canvas.getContext) {
			var time = game.time,
				ctx = game.canvas.getContext('2d'),
				seconds = time / 1000 > 1 ? Math.floor(time / 1000) : 0,
				minutes = Math.floor(seconds / 60);
			seconds -= minutes * 60;
			ctx.fillStyle = '#FEFEFE';
			ctx.fillText('Temps restant  ' + (minutes < 10 ? ('0' + minutes) : minutes) + ' : ' + (seconds < 10 ? ('0' + seconds) : seconds), 10, 20);
			ctx.fillText('Round #' + (game.level + 1), 730, 20);
		}
	};

	/**
	 * Destroys an asteroid
	 */
	game.addBullet = function(data) {
		var player = game.players[data.playerId],
			bullet = new Bullet(data.bullet.x, data.bullet.y, null, player.color);
		player.bullets.push(bullet);
	};

	/**
	 * Destroys an asteroid
	 */
	game.destroyAsteroid = function(data) {
		var player;
		if (game.user.id == data.player) {	// If the player who shot is the current user
			player = game.user;
		}else {
			player = game.players[data.player];
		}
		player.score = data.playerScore;
		player.bullets.splice(data.bullet, 1);				// We remove the bullet
		game.asteroids[data.asteroid].explode(game.canvas);	// We make the asteroid explode
	};

	/**
	 * Displays the text at the beginning to tell the player to ready himself
	 */
	game.toggleReadyText = function() {
		if (game.canvas.getContext) {
			var x, ctx = game.canvas.getContext('2d');
			if (game.readyText != undefined) {
				var metrics = ctx.measureText(game.readyText),
					textWidth = metrics.width;
				ctx.clearRect(220, 32, textWidth + 50, 25);
			}
			if (game.readyText === 'Appuyer sur R si vous êtes prêt(e) à commencer'){
				game.readyText = 'Appuyer sur R si vous n\'êtes pas prêt(e) à commencer';
				ctx.fillStyle = '#FEFEFE';
				ctx.font = '14px Calibri';
				ctx.fillText('Prêt', 10, 20);
				x = 220;
			}else {
				game.readyText = 'Appuyer sur R si vous êtes prêt(e) à commencer';
				x = 240;
				ctx.clearRect(0, 0, 50, 50);
			}
			ctx.fillStyle = '#FEFEFE';
			ctx.font = '18px Calibri';
			ctx.fillText(game.readyText, x, 50);
		}
	}	

	return game;
});