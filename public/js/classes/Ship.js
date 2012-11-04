/**
 * A Ship for "Asteroid Mania"
 */
function Ship (x, y, angle, color, player, keys) {
	this.id;
	this.username;
	this.x = x || 0;
	this.y = y || 0;
	this.angle = angle || 0;
	this.speed = 0;
	this.color = color || "#333";

	addMoveCapabilities(this);	// We add the movement methods

	if (player) {
		if (keys != undefined) {
			var leftKey = keys.left || KEYBOARD.LEFT,
				rightKey = keys.right || KEYBOARD.RIGHT,
				forwardKey = keys.forward || KEYBOARD.UP,
				backwardsKey = keys.backwards || KEYBOARD.DOWN;
		}

		this.controls = {
			left: [leftKey || KEYBOARD.LEFT, this.moveLeft],
			right: [rightKey || KEYBOARD.RIGHT, this.moveRight],
			forward: [forwardKey || KEYBOARD.UP, this.moveForward],
			backwards: [backwardsKey || KEYBOARD.DOWN, this.moveBackwards]
		};

		addControlsCapabilities(this);	// We make the ship controllable with the keyboard
	}
};