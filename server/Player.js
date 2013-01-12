exports.Player = function(id, username) {
	var nbPlayers = Object.size(players);

	// this.id = nbPlayers;
	this.id = id;
	this.token = Math.round(9999999999 * Math.random());
	this.username = username;
	this.x = (nbPlayers < 3 ? 200 : 600);
	this.y = (nbPlayers == 0 || nbPlayers == 3) ? 150 : (nbPlayers == 1 || nbPlayers == 4) ? 300 : 450;
	this.color = (nbPlayers == 0 || nbPlayers == 3) ? "#FF0000" : (nbPlayers == 1 || nbPlayers == 4) ? "#00FF00" : "#FFFF00";
	this.angle = (nbPlayers < 3 ? 180 : 0);
	this.speed = 0;
	this.inGame = false;
	this.inLobby = true;
};