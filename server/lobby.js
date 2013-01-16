function Lobby() {
	this.users = {};
	this.rooms = {};
};

Lobby.prototype.broadcast = function(io, event, data) {
	for (user in this.users) {
		io.sockets.socket(this.users[user].socket).emit(event, data);
	};
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
		// TODO Couleurs en fonction des joueurs présents dans la room, et pas du nombre de joueurs (s'il ne reste qu'un vert, éviter de recréer un vert)
		player.x = (nbPlayers < 3 ? 200 : 600);
		player.y = (nbPlayers == 0 || nbPlayers == 3) ? 150 : (nbPlayers == 1 || nbPlayers == 4) ? 300 : 450;
		player.color = (nbPlayers == 0 || nbPlayers == 3) ? "#FF0000" : (nbPlayers == 1 || nbPlayers == 4) ? "#00FF00" : "#FFFF00";
		player.angle = (nbPlayers < 3 ? 180 : 0);
		delete player.isUser;
		delete GLOBAL.lobby.users[player.id];	// We remove the player from the lobby users
		this.players[player.id] = player;
		return this;
	}
};

Room.prototype.getPlayersReady = function() {
	var playersReady = 0;
	for (player in this.players) {
		if (this.players.hasOwnProperty(player) && this.players[player].ready === true)
			playersReady++;
	};
	return playersReady;
};

Room.prototype.broadcast = function(io, event, data) {
	for (player in this.players) {
		io.sockets.socket(this.players[player].socket).emit(event, data);
	};
};

exports.createRoom = function(player) {
	if (Object.size(GLOBAL.lobby.rooms) >= 14)
		return false;
	var room = new Room(player);
	do {
		room.id = Math.round(999 * Math.random());
	}while (GLOBAL.lobby.rooms[room.id]);
	GLOBAL.lobby.rooms[room.id] = room;
	GLOBAL.players[player.id].roomId = room.id;
	return room;
};

exports.joinRoom = function(roomId, player) {
	if (GLOBAL.lobby.rooms[roomId]) {
		if (Object.size(GLOBAL.lobby.rooms[roomId]) >= 6)
			return false;
		GLOBAL.players[player.id].roomId = roomId;
		return GLOBAL.lobby.rooms[roomId].addPlayer(player);
	}
	return false;
};