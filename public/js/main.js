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

require(['jquery', 'game_engine', 'game_client', 'utils', 'Keyboard'], function ($, gameEngine, game, utils, Keyboard) {
	$(function() {
		if ($('#game_content').data('playerid') != null && $('#game_content').data('token') != null) {
		    startGame();
		}else {
			// We display the login form if necessary
			if ($('.prompt') != null) {
				$('.prompt span').css({top:'50%',left:'50%',margin:'-' + ($('.prompt span').height() / 2) + 'px 0 0 -' + ($('.prompt span').width() / 2) + 'px'});
				$('.prompt').toggle();
				$('#sendBt').click(function() {
					if ($('#username').val() == '' && $('#username').val().length <= 4) {
					    alert('Le pseudo doit contenir plus de 4 caractères');
					}else {
						game.authenticate($('#username').val(), startGame);
						Keyboard.remove('keydown', 'ENTER', triggerBt);
					}
				});
				function triggerBt() {
					$('#sendBt').click();
				}
				$('.prompt input').focus(function() {
					Keyboard.on('keydown', 'ENTER', triggerBt);
				})
				$('.prompt input').focusout(function() {
					Keyboard.remove('keydown', 'ENTER', triggerBt);
				})
			}else {
				startGame();
			}
		}
	});

	function startGame() {
		gameEngine.init(game, $('#game_content'));
	}
});