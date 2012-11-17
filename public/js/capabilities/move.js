define(['render'], function(addRenderCapabilities) {
	function addMoveCapabilities (obj) {
		addRenderCapabilities(obj);	// We make the object renderable

		/**
		 * Calculates the element's new position from its speed and angle
		 * @param canvas	The canvas which the element is drawn in
		 */
		obj.move = function(canvas) {
			obj.remove(canvas);
			obj.x += obj.speed * Math.cos(obj.angle * Math.PI / 180);
			obj.y -= obj.speed * Math.sin(obj.angle * Math.PI / 180);

			// We prevent the element from going out of the canvas
			if (obj.x < -obj.width) {
				obj.x = canvas.width + obj.width;
			}
			if (obj.x > canvas.width + obj.width) {
				obj.x = -obj.width;
			}
			if (obj.y < -obj.height) {
				obj.y = canvas.height + obj.height;
			}
			if (obj.y > canvas.height + obj.height) {	
				obj.y = -obj.height;
			}

			// The element automatically slows down
			if (obj.speed > 2) {	    
				obj.speed -= 0.1;
			}

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
				obj.speed += 0.2;
			}
		};
	};
	return addMoveCapabilities;
});