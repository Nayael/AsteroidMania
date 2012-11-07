exports.setPlayerData = function (id) {
	var x, y, angle, color;
	switch (Object.size(players)){
		case 0: case 3:
			y = 150;
			color = "#FF0000";
			break;
		case 1: case 4:
			y = 300;
			color = "#00FF00";
			break;
		case 2: case 5:
			y = 450;
			color = "#FFFF00";
			break;
		default:
			x = Math.random()*700;
			y = Math.random()*520;
			color = "#FF0000";
			break;
	}
	switch (Object.size(players)){
		case 0: case 1: case 2:
			x = 200;
			angle = 180;
			break;
		case 3: case 4: case 5:
			x = 600;
			angle = 0;
			break;
		default:
			x = Math.random()*700;
			y = Math.random()*520;
			color = "#FF0000";
			break;
	}
	var data = {
		id: id,
		x: x,
		y: y,
		speed: 0,
		angle: angle,
		color: color
	};
	return data;
};

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