exports.Bullet = function(x, y, angle, color) {
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.speed = 8;
	this.color = color;
	this.vulnerability = {};
	this.vulnerability[GLOBAL.colors[0]] = (this.color === GLOBAL.colors[0] ? 0 : (this.color === GLOBAL.colors[1] ? 1 : 2));
	this.vulnerability[GLOBAL.colors[1]] = (this.color === GLOBAL.colors[0] ? 1 : (this.color === GLOBAL.colors[1] ? 0 : 2));
	this.vulnerability[GLOBAL.colors[2]] = (this.color === GLOBAL.colors[0] ? 2 : (this.color === GLOBAL.colors[1] ? 1 : 0));
}

/**
 * Calculates the bullet's new position from its speed and angle
 */
exports.Bullet.prototype.move = function(canvasWidth, canvasHeight) {
	this.x += this.speed * Math.cos(this.angle * Math.PI / 180);
	this.y -= this.speed * Math.sin(this.angle * Math.PI / 180);

	// We delete the bullet once outside of the canvas
	if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
		return false;
	}
};

/**
 * Tests collisions between a bullet and asteroids
 * @param {Object} asteroids The asteroids to test
 * @param {int} roomId The room containing the asteroids
 */
exports.Bullet.prototype.collideAsteroids = function(asteroids, roomId) {
	for (var i = 0; i < asteroids.length; i++) {
		asteroid = asteroids[i];
		var x2 = asteroid.center.x,
			y2 = asteroid.center.y,
			size2 = asteroid.size / 2,
			bottom2, left2, right2, top2;
		left2 = x2 - size2;
		right2 = x2 + size2;
		top2 = y2 - size2;
		bottom2 = y2 + size2;
		// If the bullet collides an asteroid
		if (!(this.x > right2 || left2 > this.x || this.y > bottom2 || top2 > this.y) && this.vulnerability[asteroid.color] == 2) {
			asteroid.explode(roomId);	// The asteroid explodes
			asteroids.splice(i, 1);		// We delete it
			return i;
		}
	};
	return false;
};