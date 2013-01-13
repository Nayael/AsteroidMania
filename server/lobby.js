function Lobby() {
	this.users = {};
	this.rooms = {};
};

exports.createLobby = function() {
	GLOBAL.lobby = new Lobby();
};

function Room(firstPlayer) {
	this.players = {};
	this.level = 0;
	this.addPlayer(firstPlayer);
};

Room.prototype.addPlayer = function(player) {
	if (this.players[player.id] == undefined) {
		var nbPlayers = Object.size(this.players);
		player.inGame = true;
		player.inLobby = false;
		player.x = (nbPlayers < 3 ? 200 : 600);
		player.y = (nbPlayers == 0 || nbPlayers == 3) ? 150 : (nbPlayers == 1 || nbPlayers == 4) ? 300 : 450;
		player.color = (nbPlayers == 0 || nbPlayers == 3) ? "#FF0000" : (nbPlayers == 1 || nbPlayers == 4) ? "#00FF00" : "#FFFF00";
		player.angle = (nbPlayers < 3 ? 180 : 0);
		delete player.isUser;
		this.players[player.id] = player;
		return this;
	}
};

Room.prototype.getPlayersReady = function() {
	var playersReady = 0;
	for (player in this.players) {
		if (this.players.hasOwnProperty(player) && this.players[player].ready === true)
			playersReady++;
	}
	return playersReady;
};

exports.createRoom = function(player) {
	if (Object.size(GLOBAL.lobby.rooms) >= 14)
		return false;
	var room = new Room(player);
	do {
		room.id = Math.round(999 * Math.random());
	}while (GLOBAL.lobby.rooms[room.id]);
	GLOBAL.lobby.rooms[room.id] = room;
	return room;
};

exports.joinRoom = function(roomId, player) {
	if (GLOBAL.lobby.rooms[roomId]) {
		if (Object.size(GLOBAL.lobby.rooms[roomId]) >= 6)
			return false;
		return GLOBAL.lobby.rooms[roomId].addPlayer(player);
	}
	return false;
};