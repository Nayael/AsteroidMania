function addMoveCapabilities (obj) {
	/**
	 * Calculates the objects new position from its speed and angle
	 */
	obj.move = function(canvas) {
		obj.x += obj.speed * Math.cos(obj.angle * Math.PI / 180);
		obj.y -= obj.speed * Math.sin(obj.angle * Math.PI / 180);
		obj.render(canvas);
	};

	obj.moveLeft = function() {
		obj.angle += 3;
	};

	obj.moveRight = function() {
		obj.angle -= 3;
	};

	obj.moveForward = function() {
		if (obj.speed < 5) {
			obj.speed += 0.1;
		}
	};

	obj.moveBackwards = function() {
		if (obj.speed > -5) {
			obj.speed -= 0.1;
		}
	};
};