var Player = require('./Player').Player,
	Asteroid = require('./Asteroid').Asteroid,
	colors = ['#FF0000', '#00FF00', '#FFFF00'],
	wave = {
		max: 2,	// The maximum size of asteroids in this wave
		total: 10
	};

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
		if (asteroid.inside && (asteroids[key].x <= 0 || asteroids[key].x >= (800 - asteroids[key].size * 10))) {
			asteroids[key].xDirection = -1 * asteroids[key].xDirection;
		}else if (asteroids[key].x > 0 && asteroids[key].x < (800 - asteroids[key].size * 10)) {	// Otherwise, we check if the asteroid is inside the visible area of the canvas
			asteroids[key].inside = true;
		}

		if (asteroids[key].y <= 0 || asteroids[key].y >= (540 - asteroids[key].size * 10)) {   
			asteroids[key].yDirection = -1 * asteroids[key].yDirection;
		}
	};
};
exports.moveAsteroids = moveAsteroids;

/**
 * Launches a game in a room
 * @param {Room} room	The room to launch the game in
 */
exports.launch = function(init, io, room) {
	nextWave(room);	// We create the asteroid wave
	room.broadcast(io, 'launch_game');
	room.broadcast(io, 'start_level', room.asteroids);

	// We start the main loop
	room.mainLoop = setInterval(function() {
		mainLoop(io, room);
	}, 1000 / 60);
};

/**
 * The game's main loop
 */
function mainLoop(io, room) {
	// drawAsteroids(room.asteroids);	// We virtually draw the asteroids to test for collisions
	// drawShips(room.players);	// We virtually draw the ships to test for collisions
	moveAsteroids(room.id);	// We handle the asteroids
	var gameData = {
		players: room.players,
		asteroids: []
	};
	for (var i in room.asteroids) {	// We also pass him the asteroids datas, to make them move on his screen
		gameData.asteroids.push(room.asteroids[i]);
	};
	room.broadcast(io, 'get_game_state', gameData);	// We send him the players' and asteroids' datas
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
		
		var size = Math.ceil(Math.random() * curWave.max),
			x = (Math.random() <= 0.5) ? (-1 * (50 + Math.random() * 120)) : (850 + Math.random() * 920),
			y = Math.random() * 500;
		totalSize += size;
		room.asteroids.push(new Asteroid({
			x: x,
			y: y,
			size: size,
			color: colors[colorIndex],
		}));
		colorIndex++;
	};
};
exports.nextWave = nextWave;