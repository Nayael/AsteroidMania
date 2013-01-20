/**
 * Initialises the server's variables and methods
 */
exports.init = function() {
	Object.size = function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};
	GLOBAL.players = {};
};