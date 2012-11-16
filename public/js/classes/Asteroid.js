/**
 * An asteroid for "Asteroid Mania"
 * @param data	The data to create the asteroid (coordinates, etc.)
 */
function Asteroid (data) {
	this.x = data.x || 0;
	this.y = data.y || 0;
	this.size = data.size || 2;
	this.color = data.color || "#FF0000";
	this.speed = data.speed;
	this.xDirection = data.xDirection || 1;
	this.yDirection = data.yDirection || 1;
	this.inside = false;

	addRenderCapabilities(this);
}

/**
 * Sets the points that will be used to draw the asteroid
 */
Asteroid.prototype.setDrawbox = function() {
	// We define the center of the element's hitbox
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