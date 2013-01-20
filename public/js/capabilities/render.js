define(function() {
	function addRenderCapabilities (obj) {
		/**
		 * Displays the element to its new position
		 * @param canvas	The canvas which the element is drawn in
		 */
		obj.render = function(canvas, Ship) {
			if (canvas.getContext) {
				var ctx = canvas.getContext('2d');
				if (obj.setDrawbox)
					obj.setDrawbox();
				else 
					return;
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

				if (Ship != undefined && obj instanceof Ship) {
					var displayName = obj.username + ' (' + obj.score + ')',
						metrics = ctx.measureText(displayName),
						textWidth = metrics.width;
					ctx.font = '12px Calibri';
					ctx.fillStyle = obj.color;
					ctx.fillText(displayName, obj.x - textWidth / 2, obj.y - obj.height - 10);
				}
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
	return addRenderCapabilities;
});