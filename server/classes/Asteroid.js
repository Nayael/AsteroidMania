function Asteroid(data) {
	this.x = data.x;
	this.y = data.y;
	this.xDirection = data.xDirection || (this.x < 0) ? 1 : -1;
	this.yDirection = data.yDirection || (this.y < 270) ? 1 : -1;
	this.size = 15 * data.weight;
	this.weight = data.weight;
	this.speed = 2;
	this.color = data.color;
	this.inside = false;
};

/**
 * Sets the points that will be used to draw the asteroid
 */
Asteroid.prototype.setDrawbox = function() {
	// We define the center of the element's bounding box
	this.center = {
		x: this.x + this.size / 2,
		y: this.y + this.size / 2
	};
	this.drawbox = [
		[this.x, this.y],
		[this.x + this.size, this.y],
		[this.x + this.size, this.y + this.size],
		[this.x, this.y + this.size]
	];
};

/**
 * Makes the asteroid explode (and divide in 2)
 */
Asteroid.prototype.explode = function(roomId) {
	var room = GLOBAL.lobby.rooms[roomId],
		weight = this.weight / 2;	// We divide the asteroid's weight by 2, to create its "children"
	if (!room)
		return;
	// If the asteroid can't be divided
	if (weight < 1) {	// We create a new one that will come into the canvas later
		var wave = require('../game').wave;
		room.asteroids.push(new Asteroid({
			x: (Math.random() <= 0.5) ? (-1 * (50 + Math.random() * 120)) : (850 + Math.random() * 920),
			y: Math.random() * 500,
			weight: Math.ceil(Math.random() * parseInt(wave.max + 1.5 * room.level)),
			color: this.color
		}));
		return;
	}

	// We create the 2 asteroid's children
	for (var i = 0, asteroid; i < 2; i++) {
		asteroid = new Asteroid({
			x: this.x + Math.floor(Math.random() * 100) * (Math.random() > 0.5 ? -1 : 1),
			y: this.y + Math.floor(Math.random() * 100) * (Math.random() > 0.5 ? -1 : 1),
			xDirection: Math.random() > 0.5 ? -1 : 1,
			yDirection: Math.random() > 0.5 ? -1 : 1,
			weight: weight,
			color: this.color
		});
		if (i == 1) {	// The second asteroid goes at the opposite direction
			asteroid.xDirection = -room.asteroids[room.asteroids.length - 1].xDirection;
			asteroid.yDirection = -room.asteroids[room.asteroids.length - 1].yDirection;
		}
		room.asteroids.push(asteroid);
	};
};
exports.Asteroid = Asteroid;