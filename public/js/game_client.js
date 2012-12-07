define(['Ship', 'Asteroid'], function (Ship, Asteroid) {
	var game = {};	// The game namespace

	game.user = {
		username : 'Player' + Math.floor(Math.random() * 99999)
	};

	/**
	 * Initializes the game's data
	 * @param gameContainer	The <div> which the canvas will be added in
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
	 * @param playerData	obj: The player's data
	 * @param isUser	bool: Is the player the current user ?
	 */
	game.addPlayer = function (playerData, isUser) {
		if (isUser) {	// If we are creating the current user's ship
			playerData['username'] = game.user.username;
			game.user = playerData;
		}
		game.players[playerData.id] = new Ship({
			x: playerData.x,
			y: playerData.y,
			angle: playerData.angle,
			color: playerData.color,
			isUser: (isUser === true ? true : false)
		}, game.colors);
		game.players[playerData.id].id = playerData.id;
		game.players[playerData.id].username = playerData.username;

		game.players[playerData.id].render(game.canvas);	// We display the created user's ship
	};

	/**
	 * Adds a player ship to the game
	 * @param asteroidData	The asteroid to add's data
	 */
	game.addAsteroid = function (asteroidData) {
		game.asteroids.push(new Asteroid(asteroidData));
	};

	/**
	 * Displays a message to the player in the window aside the game canvas
	 * @param message	The message to display
	 */
	game.log = function (message) {
		$('#logger').append('<div class="message">' + message + '</div>');
		console.log(message);
	};

	return game;
});