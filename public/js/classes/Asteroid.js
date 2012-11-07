/**
 * An asteroid for "Asteroid Mania"
 */
game.Asteroid = function (data) {
	this.x = data.x || 0;
	this.y = data.y || 0;
	this.size = data.size || 2;
	this.color = data.color || "#FF0000";
	this.speed = data.speed || 10 * (1/this.size);
	this.xDirection = data.xDirection || 1;
	this.yDirection = data.yDirection || 1;
	this.inside = false;

	addRenderCapabilities(this);
}

game.Asteroid.prototype.setHitbox = function() {
	this.hitbox = [
		[this.x, this.y],
		[this.x + 10*this.size, this.y],
		[this.x + 10*this.size, this.y + 10*this.size],
		[this.x, this.y + 10*this.size]
	];
};