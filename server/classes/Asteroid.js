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
	if (!room || weight < 1)
		return;

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
		room.asteroids.push(asteroid);
	};
};
exports.Asteroid = Asteroid;