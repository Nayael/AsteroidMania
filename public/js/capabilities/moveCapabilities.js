function addMoveCapabilities (obj) {
	obj.move = function(cx) {
		var speed = this.speed,
			angle = this.angle;
		this.x += speed * Math.cos(angle * Math.PI / 180);
		this.y -= speed * Math.sin(angle * Math.PI / 180);
		
		cx.beginPath();
		cx.moveTo(this.x, this.y);
		cx.lineTo(this.x - 20*Math.cos((angle * Math.PI / 180) - 0.3), this.y + 20*Math.sin((angle * Math.PI / 180) - 0.3));
		cx.lineTo(this.x - 20*Math.cos((angle * Math.PI / 180) + 0.3), this.y + 20*Math.sin((angle * Math.PI / 180) + 0.3));
		cx.closePath();
		cx.strokeStyle = '#333';
		cx.lineWidth = '2';
		cx.stroke();
	};
};