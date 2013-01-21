define(['Asteroid', 'Bullet', 'Keyboard', 'ship', 'collision'], function(Asteroid, Bullet, Keyboard, addShipCapabilities, addCollisionCapabilities) {
	/**
	 * A Ship for "Asteroid Mania"
	 * @param {Object} data	The data to create the ship (coordinates, etc.)
	 */
	function Ship(data, colors) {
		var that = this;
		this.id = data.id;
		this.roomId = data.roomId;
		this.username = data.username;
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.angle = data.angle || 0;
		this.speed = 2;
		this.score = data.score || 0;
		this.color = data.color || "#FF0000";
		this.width = 20;
		this.height = 20;
		this.size = 20;
		this.dead = false;
		this.canShoot = true;
		this.bullets = [];
		
		// We set the different interactions between the ships and the asteroids, in function of the colors
		this.vulnerability = {
			'#FF0000': (this.color === colors[0] ? 0 : (this.color === colors[1] ? 2 : 1)),
			'#00FF00': (this.color === colors[0] ? 1 : (this.color === colors[1] ? 0 : 2)),
			'#FFFF00': (this.color === colors[0] ? 2 : (this.color === colors[1] ? 1 : 0))
		}

		addShipCapabilities(this, Ship);
		addCollisionCapabilities(this);

		if (data.isUser) {
			Keyboard.bindKeys({
				left: ['LEFT_ARROW', 'Q'],
				right: ['RIGHT_ARROW', 'D'],
				forward: ['UP_ARROW', 'Z']
			});

			this.controls = {};
			this.controls.left = this.moveLeft;
			this.controls.right = this.moveRight;
			this.controls.forward = this.moveForward;
			this.controls['SPACE'] = function() {
				that.shoot();
			};

			Keyboard.makeControllable(this);	// We make the ship controllable with the Keyboard
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
	 * @param {Object} target	The element which the collision will be tested with
	 */
	Ship.prototype.handleCollision = function(target) {
		if (this.hitTest(target)) {
			if (target instanceof Asteroid && this.vulnerability[target.color] != 0 && !this.dead) {
				return {die: true};
			}else if (target instanceof Ship) {
				return 'Ne vous rentrez pas dedans !';
			}
		}
		return null;
	};

	/**
	 * Synchronizes the ship's data with the data received from the server
	 * @param {Object} data	The data to insert in the ship
	 */
	Ship.prototype.syncFromServer = function(data) {
		this.x = data.players[this.id].x;
		this.y = data.players[this.id].y;
		this.angle = data.players[this.id].angle;
		for (var i = 0; i < this.bullets.length; i++) {
			if (!data.players[this.id].bullets[i]) {
				continue;
			}
			this.bullets[i].x = data.players[this.id].bullets[i].x;
			this.bullets[i].y = data.players[this.id].bullets[i].y;
		};
	};

	/**
	 * Makes the ship die (displays the animation)
	 */
	Ship.prototype.die = function(canvas) {
		this.dead = true;
		this.remove(canvas);
	};

	/**
	 * Makes the ship respawn
	 */
	Ship.prototype.respawn = function(data) {
		this.x = data.x;
		this.y = data.y;
		this.speed = data.speed;
		this.angle = data.angle;
		this.score = data.score;
		this.dead = false;
	};

	Ship.prototype.shoot = function() {
		var that = this;
		if (that.canShoot) {
			// We create the bullet
			var bullet = new Bullet(that.x, that.y, that.angle, this.color);
			that.bullets.push(bullet);
			that.shooting = true;
			that.canShoot = false;
			// We allow him to shoot again only after 500 ms
			setTimeout(function() {
				that.canShoot = true;
			}, 500);
		}
	};

	return Ship;
});