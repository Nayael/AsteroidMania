function addControlsCapabilities (obj) {
	handleKeyboard(obj);
	obj.controls = function () {
		if (obj.left() in obj.keysDown) {
			obj.angle += 3;
		}
		if (obj.up() in obj.keysDown) {
			obj.speed += 0.1;
		}
		if (obj.right() in obj.keysDown) {	
			obj.angle -= 3;
		}
		if (obj.down() in obj.keysDown) {	
			obj.speed -= 0.1;
		}
	}
};