define(['Asteroid', 'keyboard', 'move', 'collision'], function(Asteroid, keyboard, addMoveCapabilities, addCollisionCapabilities) {
	/**
	 * A Ship for "Asteroid Mania"
	 * @param data	The data to create the ship (coordinates, etc.)
	 */
	function Ship(data, colors) {
		this.id;
		this.username;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.angle = data.angle || 0;
		this.speed = 2;
		this.color = data.color || "#FF0000";
		this.width = 20;
		this.height = 20;
		this.size = 20;
		
		// We set the different interactions between the ships and the asteroids, in function of the colors
		this.vulnerability = {
			'#FF0000': (this.color === colors[0] ? 0 : (this.color === colors[1] ? 1 : 2)),
			'#00FF00': (this.color === colors[0] ? 1 : (this.color === colors[1] ? 0 : 2)),
			'#FFFF00': (this.color === colors[0] ? 2 : (this.color === colors[1] ? 1 : 0))
		}

		addMoveCapabilities(this);	// We add the movement methods
		addCollisionCapabilities(this);

		if (data.isUser) {
			this.controls = {
				left: [keyboard.KEYBOARD.LEFT, this.moveLeft],
				right: [keyboard.KEYBOARD.RIGHT, this.moveRight],
				forward: [keyboard.KEYBOARD.UP, this.moveForward]
			};

			keyboard.addControlsCapabilities(this);	// We make the ship controllable with the keyboard
		}
	};

	/**
	 * Sets the points that will be used to draw the ship
	 */
	Ship.prototype.setDrawbox = function() {
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

	/**
	 * Handles the collisions for a ship
	 * @param target	The element which the collision will be tested with
	 */
	Ship.prototype.handleCollision = function(target) {
		if (this.hitTest(target)) {
			if (target instanceof Asteroid && this.vulnerability[target.color] != 0) {
				// game.log('Touché par un astéroïde !');	    
				this.angle += 180;
			}else if (target instanceof Ship) {
				// game.log('Ne vous rentrez pas dedans !');
			}
		}
	};

	/**
	 * Synchronizes the ship's data with the data received from the server
	 * @param data	The data to insert in the ship
	 */
	Ship.prototype.syncFromServer = function(data) {
		this.x = data.players[this.id].x;
		this.y = data.players[this.id].y;
		this.speed = data.players[this.id].speed;
		this.angle = data.players[this.id].angle;
	};

	return Ship;
});