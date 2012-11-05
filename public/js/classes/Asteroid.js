/**
 * An asteroid for "Asteroid Mania"
 */
game.Asteroid = function (x, y, size, color) {
	this.x = x || 0;
	this.y = y || 0;
	this.size = size || 2;
	this.color = color || "#FF0000";

	addRenderCapabilities(this);
}