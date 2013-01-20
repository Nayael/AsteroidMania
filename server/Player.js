exports.Player = function(username) {
	var nbPlayers = Object.size(GLOBAL.players);

	this.id = nbPlayers;
	this.token = Math.round(9999999999 * Math.random());
	this.username = username;
	this.inGame = false;
	this.ready = false;
	this.inLobby = true;
};

/**
 * Sets the points that will be used to draw the ship
 */
exports.Player.prototype.setDrawbox = function() {
	// We define the center of the element's bounding box
	this.center = {
		x: this.x - 10*Math.cos((this.angle * Math.PI / 180) - 0.3),
		y: this.y + 10*Math.sin((this.angle * Math.PI / 180) - 0.3)
	};
	// this.drawbox = [
	// 	[this.x, this.y],
	// 	[this.x - 20*Math.cos((this.angle * Math.PI / 180) - 0.3), this.y + 20*Math.sin((this.angle * Math.PI / 180) - 0.3)],
	// 	[this.x - 20*Math.cos((this.angle * Math.PI / 180) + 0.3), this.y + 20*Math.sin((this.angle * Math.PI / 180) + 0.3)]
	// ];
};