/**
 * A Ship for "Asteroid Mania"
 */
function Ship (x, y) {
	this.x = x || 0;
	this.y = y || 0;
	this.angle = 0;
	this.speed = 0;

	this.moveLeft = function() {
		this.angle += 3;
	};
	this.moveRight = function() {
		this.angle -= 3;
	};
	this.moveForward = function() {
		this.speed += 0.1;
	};
	this.moveBackwards = function() {
		this.speed -= 0.1;
	};
	this.controls = {
		LEFT: [KEYBOARD.LEFT, this.moveLeft],
		RIGHT: [KEYBOARD.RIGHT, this.moveRight],
		UP: [KEYBOARD.UP, this.moveForward],
		DOWN: [KEYBOARD.DOWN, this.moveBackwards]
	};

	addMoveCapabilities(this);
	addControlsCapabilities(this);
};