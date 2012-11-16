require.config({
	paths: {
		'socket_io'  : '/socket.io/socket.io',
		'jquery'  : 'lib/jquery'
	},
	shim: {
		'socket_io': {
			exports: 'io'
		},
		'jquery': {
			exports: '$'
		}
	}
});

require(['jquery', 'game_client'], function ($, game) {
	$(function() {
		game.init($('#game_content'));
	});
});