require.config({
	paths: {
		'socket_io'  : '/socket.io/socket.io',
		'jquery'  : 'lib/jquery',
		'Ship': 'classes/Ship',
		'Asteroid': 'classes/Asteroid',
		'Bullet': 'classes/Bullet',
		'onEachFrame': 'lib/onEachFrame',
		'Keyboard': 'lib/Keyboard.min',
		'onEachFrame': 'lib/onEachFrame',
		'render': 'capabilities/render',
		'ship': 'capabilities/ship',
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
				function triggerBt() {
					$('#sendBt').click();
				}
				$('.prompt span').css({top:'50%',left:'50%',margin:'-' + ($('.prompt span').height() / 2) + 'px 0 0 -' + ($('.prompt span').width() / 2) + 'px'});
				$('.prompt').toggle();
				$('.prompt input#username').focus(function() {
					Keyboard.on('keydown', 'ENTER', triggerBt);
				});
				$('.prompt input#username').focusout(function() {
					Keyboard.remove('keydown', 'ENTER', triggerBt);
				});
				$('#username').focus();
				$('#sendBt').click(function() {
					if ($('#username').val() == '' && $('#username').val().length <= 4) {
					    alert('Le pseudo doit contenir plus de 4 caractères');
					}else {
						game.authenticate($('#username').val(), startGame);
						Keyboard.remove('keydown', 'ENTER', triggerBt);
					}
				});
			}else {
				startGame();
			}
		}
	});

	function startGame() {
		gameEngine.init(game, $('#game_content'));
	}
});