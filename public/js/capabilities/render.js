function addRenderCapabilities (obj) {
	/**
	 * Displays the element to its new position
	 * @param canvas	The canvas which the element is drawn in
	 */
	obj.render = function(canvas) {
		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');
			if (obj.setHitbox) {		    
				obj.setHitbox();
			}
			ctx.beginPath();
			ctx.moveTo(obj.hitbox[0][0], obj.hitbox[0][1]);
			// The hitbox array contains the coordinates of the bounding box of the object
			for (var i = 1, newX, newY; i < obj.hitbox.length; i++) {
				// console.log('obj.hitbox[i][0], obj.hitbox[i][1]: ', obj.hitbox[i][0], obj.hitbox[i][1]);
				newX = obj.hitbox[i][0];
				newY = obj.hitbox[i][1]
				ctx.lineTo(newX, newY);
				for (var player in game.players) {
					if (game.players[player] !== this) {
					    
					}
				};

				for (var asteroid in game.asteroids) {
					if (game.asteroids[asteroid] !== this) {
					    
					}
				};
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