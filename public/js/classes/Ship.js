define(['Asteroid', 'Keyboard', 'move', 'collision'], function(Asteroid, Keyboard, addMoveCapabilities, addCollisionCapabilities) {
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
			Keyboard.bindKeys({
				left: ['LEFT', 'Q'],
				right: ['RIGHT', 'D'],
				forward: ['UP', 'Z']
			});

			this.controls = {};
			this.controls.left = this.moveLeft;
			this.controls.right = this.moveRight;
			this.controls.forward = this.moveForward;
			// this.controls.LEFT = this.moveLeft;
			// this.controls.RIGHT = this.moveRight;
			// this.controls.UP = this.moveForward;

			Keyboard.makeControllable(this);	// We make the ship controllable with the Keyboard
			// Keyboard.addKeyListener('keyup', 'P', function() {
			// 	console.log('Touche P relâchée');
			// });
		}
	};

	/**
	 * Sets the points that will be used to draw the ship
	 */
	Ship.prototype.setDrawbox = function() {
		// We define the center of the element's bounding box
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
				this.angle += 180;
				return 'Touché par un astéroïde !';
			}else if (target instanceof Ship) {
				return 'Ne vous rentrez pas dedans !';
			}
			return null;
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