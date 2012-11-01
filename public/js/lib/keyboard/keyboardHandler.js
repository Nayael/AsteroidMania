function handleKeyboard (obj) {
	addEventListener('keydown', function (e) {
		obj.keysDown[e.keyCode] = true;
	}, false);

	addEventListener('keyup', function (e) {
		delete obj.keysDown[e.keyCode];
	}, false);
}