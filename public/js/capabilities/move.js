define(['render'], function(addRenderCapabilities) {
	function addMoveCapabilities (ship, ShipConstructor) {
		addRenderCapabilities(ship);	// We make the ship renderable

		/**
		 * Calculates the element's new position from its speed and angle
		 * @param canvas	The canvas which the element is drawn in
		 */
		ship.move = function(canvas) {
			var ctx = canvas.getContext('2d');
			ship.remove(canvas);
			ship.x += ship.speed * Math.cos(ship.angle * Math.PI / 180);
			ship.y -= ship.speed * Math.sin(ship.angle * Math.PI / 180);

			// We prevent the element from going out of the canvas
			if (ship.x < -ship.width) {
				ship.x = canvas.width + ship.width;
			}
			if (ship.x > canvas.width + ship.width) {
				ship.x = -ship.width;
			}
			if (ship.y < -ship.height) {
				ship.y = canvas.height + ship.height;
			}
			if (ship.y > canvas.height + ship.height) {	
				ship.y = -ship.height;
			}

			// The element automatically slows down
			if (ship.speed > 2) {	    
				ship.speed -= 0.1;
			}

			ship.render(canvas, ShipConstructor);
		};

		ship.moveLeft = function() {
			ship.angle += 3;
			if (ship.angle >= 180) {
				ship.angle -= 360;
			}else if (ship.angle <= -180) {
				ship.angle += 360;
			}
		};

		ship.moveRight = function() {
			ship.angle -= 3;
			if (ship.angle >= 180) {
				ship.angle -= 360;
			}else if (ship.angle <= -180) {
				ship.angle += 360;
			}
		};

		ship.moveForward = function() {
			if (ship.speed < 5) {
				ship.speed += 0.2;
			}
		};
	};
	return addMoveCapabilities;
});