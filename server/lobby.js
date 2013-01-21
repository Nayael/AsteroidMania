function Lobby() {
	this.users = {};
	this.rooms = {};
};

/**
 * Sends a message to every player in the lobby
 * @param {Object} io		Socket.IO module
 * @param {string} event	The event to trigger
 * @param {Object} data		The data to send
 * @param {Array} excluded	An array containing the players that must not receive the message
 */
Lobby.prototype.broadcast = function(io, event, data, excluded) {
	for (user in this.users) {
		// We send the message to all users, except the exluded ones
		if (excluded == undefined || excluded.indexOf(this.users[user].id) == -1) {
			io.sockets.socket(this.users[user].socket).emit(event, data);
		}
	};
};

/**
 * Creates the server's lobby
 */
exports.createLobby = function() {
	GLOBAL.lobby = new Lobby();
};

function Room(firstPlayer) {
	this.players = {};
	this.level = 0;
	this.resetTime();
	this.addPlayer(firstPlayer);
};

/**
 * Adds a player in a room by adding his necessary data
 * @param {PLayer} player	The player to add
 */
Room.prototype.addPlayer = function(player) {
	if (this.players[player.id] == undefined) {
		var nbPlayers = Object.size(this.players);
		player.inGame = true;
		player.inLobby = false;
		player.ready = false;
		player.x = (nbPlayers < 3 ? 200 : 600);
		player.y = (nbPlayers == 0 || nbPlayers == 3) ? 150 : (nbPlayers == 1 || nbPlayers == 4) ? 300 : 450;
		player.color = (nbPlayers == 0 || nbPlayers == 3) ? colors[0] : (nbPlayers == 1 || nbPlayers == 4) ? colors[1] : colors[2];
		player.speed = 0;
		player.score = 0;
		player.dead = false;
		// We make  sure the colors are balanced
		if (this.countColor(GLOBAL.colors[0]) < this.countColor(GLOBAL.colors[1]) || this.countColor(GLOBAL.colors[0]) < this.countColor(GLOBAL.colors[2])) {
			player.color = GLOBAL.colors[0];
			player.y = 150;
		}else if (this.countColor(GLOBAL.colors[1]) < this.countColor(GLOBAL.colors[0]) || this.countColor(GLOBAL.colors[1]) < this.countColor(GLOBAL.colors[2])) {
			player.color = GLOBAL.colors[1];
			player.y = 300;
		}else if (this.countColor(GLOBAL.colors[2]) < this.countColor(GLOBAL.colors[1]) || this.countColor(GLOBAL.colors[2]) < this.countColor(GLOBAL.colors[0])) {
			player.color = GLOBAL.colors[2];
			player.y = 450;
		}
		
		player.angle = (nbPlayers < 3 ? 180 : 0);
		delete player.isUser;
		delete GLOBAL.lobby.users[player.id];	// We remove the player from the lobby users
		this.players[player.id] = player;
		return this;
	}
};

/**
 * returns the number of players in the room that are ready to start
 */
Room.prototype.getPlayersReady = function() {
	var playersReady = 0;
	for (player in this.players) {
		if (this.players.hasOwnProperty(player) && this.players[player].ready === true)
			playersReady++;
	};
	return playersReady;
};

/**
 * Counts the number of ships by color
 * @param {string} color	The color to count ship by
 */
Room.prototype.countColor = function(color) {
	var i = 0;
	for (var player in this.players) {
		if (this.players.hasOwnProperty(player) && this.players[player].color == color)
			i++;
	}
	return i;
};

/**
 * Sends a message to every player in the room
 * @param {Object} io		Socket.IO module
 * @param {string} event	The event to trigger
 * @param {Object} data		The data to send
 * @param {Array} excluded	An array containing the players that must not receive the message
 */
Room.prototype.broadcast = function(io, event, data, excluded) {
	for (player in this.players) {
		// We send the message to all users, except the exluded ones
		if (excluded == undefined || excluded.indexOf(this.players[player].id) == -1) {
			io.sockets.socket(this.players[player].socket).emit(event, data);
		}
	};
};

/**
 * Starts the game in the room
 */
Room.prototype.startGame = function() {
	for (player in this.players) {
		if (this.players.hasOwnProperty(player)) {
			this.players[player].ready = true;
		}
	}
};

/** 
 * Sets the room's remaining game time
 */
Room.prototype.resetTime = function() {
	this.time = 2 * 1000 * 60;	// Every wave lasts for 2 minutes
};

/**
 * Resets the room's players' data (after a level is over)
 */
Room.prototype.resetPlayers = function() {
	for (player in this.players) {
		if (this.players.hasOwnProperty(player)) {
			this.players[player].score = 0;
			this.players[player].speed = 2;
		}
	}
};

/**
 * Creates a room, and puts the first player in
 * @param {Player} player	The player who created the room
 */
exports.createRoom = function(player) {
	if (Object.size(GLOBAL.lobby.rooms) >= 7 || GLOBAL.players[player.id] == undefined)
		return false;
	var room = new Room(player);
	do {
		room.id = Math.round(999 * Math.random());
	}while (GLOBAL.lobby.rooms[room.id]);
	GLOBAL.lobby.rooms[room.id] = room;
	GLOBAL.players[player.id].roomId = room.id;
	return room;
};

/**
 * Makes a player join in a room
 * @param {int} roomId		The if of the room to join
 * @param {Player} player	The player who joined the room
 */
exports.joinRoom = function(roomId, player) {
	if (GLOBAL.lobby.rooms[roomId]) {
		if (Object.size(GLOBAL.lobby.rooms[roomId].players) >= 6)
			return false;
		GLOBAL.players[player.id].roomId = roomId;
		return GLOBAL.lobby.rooms[roomId].addPlayer(player);
	}
	return false;
};