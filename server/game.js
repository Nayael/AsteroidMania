var Player = require('./Player').Player;

exports.createOrFindPlayer = function(id, username) {
	return new Player(id, username);
}

/**
 * Moves the asteroids according to their direction
 */
exports.moveAsteroids = function () {
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