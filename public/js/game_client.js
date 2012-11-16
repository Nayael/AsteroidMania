// define(['connector'], function (connectSocket) {
	var game = {}/*,
		socket*/;

	game.user = {
		username : 'Player' + Math.floor(Math.random() * 99999)
	};

	/**
	 * Initializes the game's data
	 * @param gameContainer	The <div> which the canvas will be added in
	 */
	game.init = function (gameContainer) {
		// game.players = {};
		// game.asteroids = [];
		// game.colors = ['#FF0000', '#00FF00', '#FFFF00'];
		// gameContainer.append('<canvas id="main_canvas" width="800" height="540"></canvas>');
		// game.canvas = document.getElementById('main_canvas');
		// socket = connectSocket();
	};

	/**
	 * Launches the game
	 * @param user	The current game user
	 */
	game.launch = function (user) {
		game.players = {};
		game.asteroids = [];
		game.colors = ['#FF0000', '#00FF00', '#FFFF00'];
		game.canvas = document.getElementById('main_canvas');
		game.addPlayer(user, true);	// We add the user to the list of players
		
		onEachFrame(function() {
			var player = game.players[user.id];
			player.control();			// We detect the pressed keys
			player.move(game.canvas);
			for (var index in game.players) {
				game.players[index].render(game.canvas);
				if (game.players[index] != player) {
					player.handleCollision(game.players[index]);
				}
			};
			for (var asteroid in game.asteroids) {
				game.asteroids[asteroid].render(game.canvas);
				player.handleCollision(game.asteroids[asteroid], true);
			};
			var userData = {
				x : player.x,
				y : player.y,
				angle : player.angle,
				speed : player.speed
			};
			game.syncToServer(userData);
		});
	};

	/**
	 * Calculates the delta to move the elements per second
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
		});
		game.players[playerData.id].id = playerData.id;
		game.players[playerData.id].username = playerData.username;

		game.players[playerData.id].render(game.canvas);	// We display the created user's ship
	};

	/**
	 * Adds a player ship to the game
	 * @param asteroid	The asteroid to add
	 */
	game.addAsteroid = function (asteroid) {
		game.asteroids.push(asteroid);
	};

	/**
	 * Displays a message to the player in the window aside the game canvas
	 * @param message	The message to display
	 */
	game.log = function (message) {
		$('#logger').append('<div class="message">' + message + '</div>');
		console.log(message);
	};

	/**
	 * Synchronizes the user with the server
	 * @param userData	The data to send to the server
	 */
	game.syncToServer = function(userData) {
		// TODO asynchrone : Si le joueur ne change pas de direction, on n'envoie pas les données : les autres joueurs calculent le déplacement de leur côté
		socket.emit('send_user_data', userData);
	};

// 	return game;
// });