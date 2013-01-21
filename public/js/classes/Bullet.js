define(function() {
	function Bullet(x, y, angle, color) {
		this.x = x;
		this.y = y;
		if (angle != null) {
			this.angle = angle;
		}
		this.color = color;
		this.speed = 8
	}

	Bullet.prototype.render = function(canvas) {
		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');
			ctx.beginPath();
			ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI, true);
			ctx.fillStyle = this.color;
			ctx.fill();
		}
	};

	/**
	 * Calculates the element's new position from its speed and angle
	 * @param canvas	The canvas which the element is drawn in
	 */
	Bullet.prototype.move = function(canvas) {
		this.x += this.speed * Math.cos(this.angle * Math.PI / 180);
		this.y -= this.speed * Math.sin(this.angle * Math.PI / 180);

		// We delete the bullet once outside of the canvas
		if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
			return false;
		}else{
			this.render(canvas);
		}
	};

	/**
	 * Erases the bullet from the canvas
	 * @param canvas	The canvas which the bullet is drawn in
	 */
	Bullet.prototype.remove = function(canvas) {
		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	};

	return Bullet;
});