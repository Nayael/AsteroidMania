exports.Player = function(username) {
	var nbPlayers = Object.size(GLOBAL.players);

	this.id = nbPlayers;
	this.token = Math.round(9999999999 * Math.random());
	this.username = username;
	this.inGame = false;
	this.ready = false;
	this.inLobby = true;
};
exports.Player.pointsWin = 10;	// The number of points gained when the player destroyes an asteroid