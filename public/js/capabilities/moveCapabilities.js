function addMoveCapabilities (obj) {
	/**
	 * Calculates the objects new position from its speed and angle
	 */
	obj.move = function() {
		obj.x += obj.speed * Math.cos(obj.angle * Math.PI / 180);
		obj.y -= obj.speed * Math.sin(obj.angle * Math.PI / 180);
	};

	obj.moveLeft = function() {
		obj.angle += 3;
	};

	obj.moveRight = function() {
		obj.angle -= 3;
	};

	obj.moveForward = function() {
		obj.speed += 0.1;
	};

	obj.moveBackwards = function() {
		obj.speed -= 0.1;
	};
};