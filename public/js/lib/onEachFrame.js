define(function() {
	var requestAnimationFrame = window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};

	function onEachFrame(cb) {
		var _cb = function() { cb(); requestAnimationFrame(_cb); };
		_cb();
	};

	return onEachFrame;
});