function addRenderCapabilities (obj) {
	/**
	 * Displays the element to its new position
	 * @param canvas	The canvas which the element is drawn in
	 * @param isAsteroid	**TEMPORARY** Is the object an asteroid ? (Temporary parameter, later done with sprites)
	 */
	obj.render = function(canvas, isAsteroid) {
		if (canvas.getContext) {
			obj.remove(canvas, isAsteroid);
			var ctx = canvas.getContext('2d');
			ctx.beginPath();
			ctx.moveTo(obj.x, obj.y);
			if (isAsteroid) {
			    ctx.lineTo(obj.x + 10*obj.size, obj.y);
			    ctx.lineTo(obj.x + 10*obj.size, obj.y + 10*obj.size);
			    ctx.lineTo(obj.x, obj.y + 10*obj.size);
			}else{
				ctx.lineTo(obj.x - 20*Math.cos((obj.angle * Math.PI / 180) - 0.3), obj.y + 20*Math.sin((obj.angle * Math.PI / 180) - 0.3));
				ctx.lineTo(obj.x - 20*Math.cos((obj.angle * Math.PI / 180) + 0.3), obj.y + 20*Math.sin((obj.angle * Math.PI / 180) + 0.3));
			}
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
	obj.remove = function(canvas, isAsteroid) {
		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');
			if (isAsteroid) {
				ctx.clearRect(obj.x - (obj.size + 10 * obj.speed), obj.y - (obj.size + 10 * obj.speed), 2.5 * (obj.size + 10 * obj.speed), 2.5 * (obj.size + 10 * obj.speed));
			}else {
				ctx.clearRect(obj.x - (obj.width + 3 * obj.speed), obj.y - (obj.width + 3 * obj.speed), obj.width * 3, obj.width * 3);
			}
		}
	};
};