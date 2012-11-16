// require.config({
// 	paths: {
// 		'socket_io'  : '/socket.io/socket.io',
// 		'jquery'  : 'lib/jquery'
// 	},
// 	shim: {
// 		'socket_io': {
// 			exports: 'io'
// 		},
// 		'jquery': {
// 			exports: '$'
// 		}
// 	}
// });

// require(['jquery', 'game_engine'], function ($, gameEngine) {
	$(function() {
		gameEngine.init($('#game_content'));
	});
// });