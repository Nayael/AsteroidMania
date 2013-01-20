exports.Asteroid = function(data) {
	this.x = data.x;
	this.y = data.y;
	this.xDirection = (this.x < 0) ? 1 : -1;
	this.yDirection = (this.y < 270) ? 1 : -1;
	this.size = 15 * data.weight;
	this.weight = data.weight;
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