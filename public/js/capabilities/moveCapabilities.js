function addMoveCapabilities (obj) {
	/**
	 * Calculates the element's new position from its speed and angle
	 * @param canvas	The canvas which the element is drawn in
	 */
	obj.move = function(canvas) {
		obj.remove(canvas);
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

	/**
	 * Displays the element to its new position
	 * @param canvas	The canvas which the element is drawn in
	 */
	obj.render = function(canvas) {
		if (canvas.getContext) {
			obj.remove(canvas);
			var ctx = canvas.getContext('2d');
			ctx.beginPath();
			ctx.moveTo(obj.x, obj.y);
			ctx.lineTo(obj.x - 20*Math.cos((obj.angle * Math.PI / 180) - 0.3), obj.y + 20*Math.sin((obj.angle * Math.PI / 180) - 0.3));
			ctx.lineTo(obj.x - 20*Math.cos((obj.angle * Math.PI / 180) + 0.3), obj.y + 20*Math.sin((obj.angle * Math.PI / 180) + 0.3));
			ctx.closePath();
			ctx.strokeStyle = obj.color;
			ctx.lineWidth = '2';
			ctx.stroke();
		}
	};

	/**
	 * Erases the element from the canvas
	 * @param canvas	The canvas which the element is drawn in
	 */
	obj.remove = function(canvas) {
		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');
			ctx.clearRect(obj.x - (40 + 3 * obj.speed), obj.y - (40 + 3 * obj.speed), 100, 100);
		}
	};
};