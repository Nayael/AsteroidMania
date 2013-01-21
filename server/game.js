var Player = require('./classes/Player').Player,
	Asteroid = require('./classes/Asteroid').Asteroid,
	colors = ['#FF0000', '#00FF00', '#FFFF00'],
	wave = {
		max: 2,	// The maximum size of asteroids in this wave
		total: 10
	},
	canvasWidth = 800,
	canvasHeight = 600;

exports.createOrFindPlayer = function(username) {
	for (var playerId in GLOBAL.players) {
		if (GLOBAL.players.hasOwnProperty(playerId) && GLOBAL.players[playerId].username == username)
			return GLOBAL.players[playerId];
	}
	var player = new Player(username);
	GLOBAL.players[player.id] = player;
	GLOBAL.lobby.users[player.id] = player;
	return player;
};

/**
 * Moves the bullets according to their direction
 * @param {Object} io 	Socket.IO module
 * @param {int} roomId The game room
 */
function moveBullets(io, roomId) {
	var room = GLOBAL.lobby.rooms[roomId], destroyed;
	if (!room)
		return;
	for (var key in room.players) {
		if (room.players.hasOwnProperty(key) && room.players[key].bullets) {
			var player = room.players[key];
			// We make the bullets move
			for (var i = 0; i < player.bullets.length; i++) {
				if (player.bullets[i].move(canvasWidth, canvasHeight) === false)	// If the bullet passes the canvas view
					player.bullets.splice(i, 1);	// We delete it
				else if ((destroyed = player.bullets[i].collideAsteroids(room.asteroids, room.id)) !== false) {	// We test if the bullet touches an asteroid
					player.bullets.splice(i, 1);	// We delete it
					player.score += Player.pointsWin;				// The player wins 10 points
					room.broadcast(io, 'asteroid_destroyed', {
						bullet: i,
						player: key,
						asteroid: destroyed,
						playerScore: player.score
					});
				}
			};
		}
	}
	return false;
};

/**
 * Moves the asteroids according to their direction
 * @param {int} roomId The game room
 */
function moveAsteroids(roomId) {
	var room = GLOBAL.lobby.rooms[roomId];
	if (!room)
		return;
	
	var asteroids = room.asteroids;
	for (var key in asteroids) {
		var asteroid = asteroids[key];
		asteroids[key].x += asteroid.xDirection * asteroid.speed;
		asteroids[key].y += asteroid.yDirection * asteroid.speed;

		// If the asteroid is inside the canvas and touches one of the edges
		if (asteroid.inside && (asteroids[key].x <= 0 || asteroids[key].x >= (800 - asteroids[key].size))) {
			asteroids[key].xDirection *= -1;
		}else if (asteroids[key].x > 0 && asteroids[key].x < (800 - asteroids[key].size)) {	// Otherwise, we check if the asteroid is inside the visible area of the canvas
			asteroids[key].inside = true;
		}

		if (asteroids[key].y <= 0 || asteroids[key].y >= (540 - asteroids[key].size)) {   
			asteroids[key].yDirection *= -1;
		}
	};
};
exports.moveAsteroids = moveAsteroids;

/**
 * Launches a game in a room
 * @param {Object} io 	Socket.IO module
 * @param {Room} room	The room to launch the game in
 */
function launch(io, room) {
	nextWave(room);	// We create the asteroid wave
	if (room.level == 0) {	// If it is the first level, we tell everyone that the game is launched
		room.broadcast(io, 'launch_game');
	}
	room.broadcast(io, 'start_level', {
		asteroids: room.asteroids,
		level: room.level
	});

	// We start the main loop
	room.mainLoop = setInterval(function() {
		mainLoop(io, room);
	}, 1000 / 60);
};
exports.launch = launch;

/**
 * The game's main loop
 * @param {Object} io 	Socket.IO module
 * @param {Room} room	The room to launch the game in
 */
function mainLoop(io, room) {
	drawAsteroids(room.asteroids);	// We virtually draw the asteroids to test for collisions
	// drawShips(room.players);	// We virtually draw the ships to test for collisions
	moveAsteroids(room.id);		// We handle the asteroids
	moveBullets(io, room.id);	// We handle the bullets
	var gameData = {
		players: {},
		asteroids: []
	};
	// We pass the players' datas
	for (var player in room.players) {
		gameData.players[player] = {};
		gameData.players[player].x = room.players[player].x;
		gameData.players[player].y = room.players[player].y;
		gameData.players[player].angle = room.players[player].angle;
		if (!room.players[player].bullets)	// If the player has no bullets displayed, we wont send data about them, we pass to the next player
			continue;
		
		gameData.players[player].bullets = [];
		for (var i = 0; i < room.players[player].bullets.length; i++) {
			gameData.players[player].bullets.push({
				x: room.players[player].bullets[i].x,
				y: room.players[player].bullets[i].y
			});
		};
	};
	for (var i in room.asteroids) {	// We also pass him the asteroids datas, to make them move on his screen
		gameData.asteroids.push(room.asteroids[i]);
	};
	room.time -= 1000 / 60;	// We reduce the room wave timer, until it reaches 0, then the wave is over
	gameData.time = room.time;
	if (room.time <= 0) {
		endLevel(io, room);
	}else {
		room.broadcast(io, 'get_game_state', gameData);	// We send him the players' and asteroids' datas
	}
}

/**
 * Ends the level at the end of the room's timer
 * @param {Object} io 	Socket.IO module
 * @param {Room} room	The room to launch the game in
 */
function endLevel(io, room) {
	clearInterval(room.mainLoop);
	room.broadcast(io, 'level_over');

	// We go to the next level 3 seconds later
	setTimeout(function() {
		room.resetTime();
		room.resetPlayers();
		room.level++;
		launch(io, room);
	}, 3000);
}

/**
 * Draws asteroids' centers and bounding boxes
 */
function drawAsteroids(asteroids) {
	for (var asteroid in asteroids) {
		asteroids[asteroid].setDrawbox();
	};
}

/**
 * Draws ships' centers and bounding boxes
 */
function drawShips(ships) {
	for (var ship in ships) {
		if (GLOBAL.players.hasOwnProperty(ship)) {
			GLOBAL.players[ship].setDrawbox();
		}
	};
}

/**
 * Creates the next asteroid wave
 * @param {Room} room	The room to create the asteroids in
 */
function nextWave(room) {
	var colorIndex = 0,
		totalSize = 0;	// We use the asteroids' sizes to set a number of asteroids per wave
	room.asteroids = [];
	curWave = {
		max: parseInt(wave.max + 1.5 * room.level),
		total: parseInt(wave.total + 1.5 * room.level)
	};

	while (totalSize < curWave.total) {
		if (colorIndex > 2)
			colorIndex = 0;
		
		var weight = Math.ceil(Math.random() * curWave.max),
			x = (Math.random() <= 0.5) ? (-1 * (50 + Math.random() * 120)) : (850 + Math.random() * 920),
			y = Math.random() * 500;
		totalSize += weight;
		room.asteroids.push(new Asteroid({
			x: x,
			y: y,
			weight: weight,
			color: colors[colorIndex],
		}));
		colorIndex++;
	};
};
exports.nextWave = nextWave;