/**
 * A Ship for "Asteroid Mania"
 */
game.Ship = function (x, y, angle, color, player) {
	this.id;
	this.username;
	this.x = x || 0;
	this.y = y || 0;
	this.angle = angle || 0;
	this.speed = 2;
	this.color = color || "#333";
	this.width = 20;
	this.height = 20;
	
	// We set the different interactions between the ships and the asteroids, in function of the colors
	this.vulnerability = {
		'#FF0000': (this.color === game.colors[0] ? 0 : (this.color === game.colors[1] ? 1 : 2)),
		'#00FF00': (this.color === game.colors[0] ? 1 : (this.color === game.colors[1] ? 0 : 2)),
		'#FFFF00': (this.color === game.colors[0] ? 2 : (this.color === game.colors[1] ? 1 : 0))
	}

	addMoveCapabilities(this);	// We add the movement methods

	if (player) {
		this.controls = {
			left: [KEYBOARD.LEFT, this.moveLeft],
			right: [KEYBOARD.RIGHT, this.moveRight],
			forward: [KEYBOARD.UP, this.moveForward]
		};

		addControlsCapabilities(this);	// We make the ship controllable with the keyboard
	}
};

game.Ship.prototype.setHitbox = function() {
	this.hitbox = [
		[this.x, this.y],
		[this.x - 20*Math.cos((this.angle * Math.PI / 180) - 0.3), this.y + 20*Math.sin((this.angle * Math.PI / 180) - 0.3)],
		[this.x - 20*Math.cos((this.angle * Math.PI / 180) + 0.3), this.y + 20*Math.sin((this.angle * Math.PI / 180) + 0.3)]
	];
};