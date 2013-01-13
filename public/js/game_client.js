define(['Ship', 'Asteroid'], function (Ship, Asteroid) {
	var game = {};	// The game namespace

	/**
	 * Initializes the game's data
	 * @param {HTMLDivElement} gameContainer	The <div> which the canvas will be added in
	 */
	game.init = function (gameContainer) {
		game.players = {};
		game.asteroids = [];
		game.colors = ['#FF0000', '#00FF00', '#FFFF00'];
		gameContainer.append('<canvas id="main_canvas" width="800" height="540"></canvas>');
		game.canvas = document.getElementById('main_canvas');
	};

	/**
	 * Launches the game
	 * @param user The current game user
	 */
	game.launch = function (user) {
		game.addPlayer(user, true);	// We add the user to the list of players
		
		/**
		 * The game's main loop
		 * @return {Object} The user's new position
		 */
		game.onEachFrame = function() {
			var gameUser = game.players[user.id],
				message = null;
			gameUser.checkControls();			// We detect the pressed keys
			gameUser.move(game.canvas);

			for (var index in game.players) {
				game.players[index].render(game.canvas);
				if (game.players[index] != gameUser) {
					message = gameUser.handleCollision(game.players[index]);
					if (message != null)
						game.log(message);
				}
			};
			for (var asteroid in game.asteroids) {
				game.asteroids[asteroid].render(game.canvas);
				message = gameUser.handleCollision(game.asteroids[asteroid]);
				if (message != null)
					game.log(message);
			};

			return {
				id : user.id,
				x : gameUser.x,
				y : gameUser.y,
				angle : gameUser.angle,
				speed : gameUser.speed
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
	 * @param {bool} isUser	Is the player the current user ?
	 */
	game.addPlayer = function (player, isUser) {
		player.isUser = false;
		if (isUser) {	// If we are creating the current user's ship
			game.user = player;
			player.isUser = true;
		}
		game.players[player.id] = new Ship(player, game.colors);
		// if (isUser)
		// 	game.players[player.id].token = data.token;
		game.players[player.id].render(game.canvas);	// We display the created user's ship
	};

	/**
	 * Adds a player ship to the game
	 * @param {Object} asteroid	The asteroid to add's data
	 */
	game.addAsteroid = function (asteroid) {
		game.asteroids.push(new Asteroid(asteroid));
	};

	/**
	 * Displays a message to the player in the window aside the game canvas
	 * @param {string} message	The message to display
	 */
	game.log = function (message) {
		$('#logger').append('<div class="message">' + message + '</div>');
		console.log(message);
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
				console.log('data: ', data);
				if (data.success) {
					$('#prompt').remove();	// We remove the prompt dialog
					$('#game_content').data('playerid', data.player.id);
					$('#game_content').data('token', data.player.token);
					$('header').append('<h1>Hello ' + data.player.username + ' !</h1>');
					if (callback)
						callback();
				}else if (data.error === 'username_already_taken') {
				    alert('Le pseudo est déjà utilisé.');
				}
			}
		});
	}

	return game;
});