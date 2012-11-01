/**
 * A Ship for "Asteroid Mania"
 */
function Ship (x, y) {
	this.x = x || 0;
	this.y = y || 0;
	this.angle = 0;
	this.speed = 0;
	this.keysDown = {};
	var LEFT = KEYBOARD.LEFT;
	var RIGHT = KEYBOARD.RIGHT;
	var UP = KEYBOARD.UP;
	var DOWN = KEYBOARD.DOWN;

	this.left = function() {
		return LEFT;
	};
	this.right = function() {
		return RIGHT;
	};
	this.up = function() {
		return UP;
	};
	this.down = function() {
		return DOWN;
	};

	addMoveCapabilities(this);
	addControlsCapabilities(this);
};