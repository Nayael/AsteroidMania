function addRenderCapabilities (obj) {
	/**
	 * Displays the element to its new position
	 * @param canvas	The canvas which the element is drawn in
	 */
	obj.render = function(canvas) {
		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');
			if (obj.setDrawbox) {		    
				obj.setDrawbox();
			}
			ctx.beginPath();
			ctx.moveTo(obj.drawbox[0][0], obj.drawbox[0][1]);
			// The drawbox array contains the coordinates of the bounding box of the object
			for (var i = 1, newX, newY; i < obj.drawbox.length; i++) {
				newX = obj.drawbox[i][0];
				newY = obj.drawbox[i][1]
				ctx.lineTo(newX, newY);
			};
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
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	};
};