exports.Asteroid = function(data) {
	this.x = data.x;
	this.y = data.y;
	this.xDirection = (this.x < 0) ? 1 : -1;
	this.yDirection = (this.y < 270) ? 1 : -1;
	this.size = data.size;
	this.speed = 2;
	this.color = data.color;
	this.inside = false;
};

/**
 * Sets the points that will be used to draw the asteroid
 */
exports.Asteroid.prototype.setDrawbox = function() {
	// We define the center of the element's bounding box
	this.center = {
		x: this.x + 15 * this.size / 2,
		y: this.y + 15 * this.size / 2
	};
	this.drawbox = [
		[this.x, this.y],
		[this.x + 15*this.size, this.y],
		[this.x + 15*this.size, this.y + 15*this.size],
		[this.x, this.y + 15*this.size]
	];
};