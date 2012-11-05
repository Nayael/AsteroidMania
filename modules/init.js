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
	GLOBAL.level = 0;
};

exports.initLevel = function (index) {
	var waves = [{
			max: 3,	// The maximum size of asteroids in this wave
			total: 15
		},{
			max: 3,
			total: 20
		},{
			max: 4,
			total: 25
		},{
			max: 4,
			total: 30
		},{
			max: 5,
			total: 35
		}],
		colors = ['#FF0000', '#00FF00', '#0000FF'],
		colorIndex = 0,
		totalSize = 0;	// We use the asteroids' sizes to set a number of asteroids per wave
	GLOBAL.asteroids = [];

	while (totalSize < waves[index].total) {
		if (colorIndex > 2) {
		    colorIndex = 0;
		}
		var size = Math.ceil(Math.random() * waves[index].max);
		totalSize += size;
		asteroids.push({
			x: (Math.random() <= 0.5) ? (-120 + Math.random() * (50 - 10 * size)) : ((850 + 10 * size) + Math.random() * 920),
			y: Math.random() * 500,
			xDirection: (this.x < 0) ? 1 : -1,
			yDirection: (this.y < 270) ? 1 : -1,
			speed: 10 * (1 / size),
			size: size,
			color: colors[colorIndex],
			inside: false
		});
		colorIndex++;
	};
}