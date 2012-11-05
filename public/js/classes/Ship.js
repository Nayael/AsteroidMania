/**
 * A Ship for "Asteroid Mania"
 */
game.Ship = function (x, y, angle, color, player) {
	this.id;
	this.username;
	this.x = x || 0;
	this.y = y || 0;
	this.angle = angle || 0;
	this.speed = 0;
	this.color = color || "#333";
	this.width = 20;
	this.height = 20;
	
	// We set the different interactions between the ships and the asteroids, in function of the colors
	this.vulnerability = {
		'#FF0000': (this.color === game.colors[0] ? 0 : (this.color === game.colors[1] ? 1 : 2)),
		'#00FF00': (this.color === game.colors[0] ? 1 : (this.color === game.colors[1] ? 0 : 2)),
		'#0000FF': (this.color === game.colors[0] ? 2 : (this.color === game.colors[1] ? 1 : 0))
	}

	addMoveCapabilities(this);	// We add the movement methods

	if (player) {
		this.controls = {
			left: [KEYBOARD.LEFT, this.moveLeft],
			right: [KEYBOARD.RIGHT, this.moveRight],
			forward: [KEYBOARD.UP, this.moveForward],
			backwards: [KEYBOARD.DOWN, this.moveBackwards]
		};

		addControlsCapabilities(this);	// We make the ship controllable with the keyboard
	}
};