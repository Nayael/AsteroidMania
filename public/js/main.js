require.config({
	paths: {
		'socket_io'  : '/socket.io/socket.io',
		'jquery'  : 'lib/jquery',
		'Ship': 'classes/Ship',
		'Asteroid': 'classes/Asteroid',
		'onEachFrame': 'lib/onEachFrame',
		'Keyboard': 'lib/Keyboard.min',
		'onEachFrame': 'lib/onEachFrame',
		'render': 'capabilities/render',
		'move': 'capabilities/move',
		'collision': 'capabilities/collision'
	},
	shim: {
		'socket_io': {
			exports: 'io'
		},
		'jquery': {
			exports: '$'
		},
		'Keyboard': {
			exports: 'Keyboard'
		}
	}
});

require(['jquery', 'game_engine', 'game_client'], function ($, gameEngine, game) {
	$(function() {
		gameEngine.init(game, $('#game_content'));
	});
});