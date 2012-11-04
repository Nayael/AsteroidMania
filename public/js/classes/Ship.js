/**
 * A Ship for "Asteroid Mania"
 */
function Ship (x, y, player, keys) {
	this.x = x || 0;
	this.y = y || 0;
	this.angle = 0;
	this.speed = 0;

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

/**
 * Displays the ship to its new position
 * @param canvas	The canvas which the ship is drawn in
 */
Ship.prototype.render = function(canvas) {
	if (canvas.getContext) {
		var cx = canvas.getContext('2d');
		cx.clearRect(0, 0, canvas.width, canvas.height);
		cx.beginPath();
		cx.moveTo(this.x, this.y);
		cx.lineTo(this.x - 20*Math.cos((this.angle * Math.PI / 180) - 0.3), this.y + 20*Math.sin((this.angle * Math.PI / 180) - 0.3));
		cx.lineTo(this.x - 20*Math.cos((this.angle * Math.PI / 180) + 0.3), this.y + 20*Math.sin((this.angle * Math.PI / 180) + 0.3));
		cx.closePath();
		cx.strokeStyle = '#333';
		cx.lineWidth = '2';
		cx.stroke();
	}
};