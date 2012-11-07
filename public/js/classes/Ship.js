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
	this.size = 20;
	
	// We set the different interactions between the ships and the asteroids, in function of the colors
	this.vulnerability = {
		'#FF0000': (this.color === game.colors[0] ? 0 : (this.color === game.colors[1] ? 1 : 2)),
		'#00FF00': (this.color === game.colors[0] ? 1 : (this.color === game.colors[1] ? 0 : 2)),
		'#FFFF00': (this.color === game.colors[0] ? 2 : (this.color === game.colors[1] ? 1 : 0))
	}

	addMoveCapabilities(this);	// We add the movement methods
	addCollisionCapabilities(this);

	if (player) {
		this.controls = {
			left: [KEYBOARD.LEFT, this.moveLeft],
			right: [KEYBOARD.RIGHT, this.moveRight],
			forward: [KEYBOARD.UP, this.moveForward]
		};

		addControlsCapabilities(this);	// We make the ship controllable with the keyboard
	}
};

/**
 * Sets the points that will be used to draw the ship
 */
game.Ship.prototype.setDrawbox = function() {
	// We define the center of the element's hitbox
	this.center = {
		x: this.x - 10*Math.cos((this.angle * Math.PI / 180) - 0.3),
		y: this.y + 10*Math.sin((this.angle * Math.PI / 180) - 0.3)
	};
	this.drawbox = [
		[this.x, this.y],
		[this.x - 20*Math.cos((this.angle * Math.PI / 180) - 0.3), this.y + 20*Math.sin((this.angle * Math.PI / 180) - 0.3)],
		[this.x - 20*Math.cos((this.angle * Math.PI / 180) + 0.3), this.y + 20*Math.sin((this.angle * Math.PI / 180) + 0.3)]
	];
};

game.Ship.prototype.handleCollision = function(target, isAsteroid) {
	if (this.hitTest(target)) {
		if (isAsteroid && this.vulnerability[target.color] != 0) {
			game.log('Touché par un astéroïde !');	    
		    this.angle += 180;
		}else if (!isAsteroid) {
			game.log('Ne vous rentrez pas dedans !');
		}
	}
};