/**
 * A library to control an object with the keyboard
 * 
 **** HOW TO USE ****
 * 		my_object.controls = {
 * 			prop1: [keyCode, my_function1],
 * 			prop2: [keyCode, my_function2]
 * 		};
 * 		addControlsCapabilities(my_object);
 *	Then, call the checkControls() method on your object to apply the pressed keys
 * 		
 * Real World Example :
 * 		ship.controls = {
 * 			shoot: [KEYBOARD.X, shipShoot],
 * 			explode: [KEYBOARD.Y, makeExplosion]
 * 		};
 * 		addControlsCapabilities(ship);
 * 
 * 		onEachFrame(function(){
 *			ship.checkControls();
 *		})
 * 
 * @author Nicolas Vannier
 */

define(function() {
	var KEYBOARD = {
		BACKSPACE: 8,
		TAB: 9,
		ENTER: 13,
		SHIFT: 16,
		CTRL: 17,
		ALT: 18,
		PAUSE_BREAK: 19,
		CAPS_LOCK: 20,
		ESCAPE: 27,
		PAGE_UP: 33,
		PAGE_DOWN: 34,
		END: 35,
		HOME: 36,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		INSERT: 45,
		DELETE: 46,
		KEY_0: 48,
		KEY_1: 49,
		KEY_2: 50,
		KEY_3: 51,
		KEY_4: 52,
		KEY_5: 53,
		KEY_6: 54,
		KEY_7: 55,
		KEY_8: 56,
		KEY_9: 57,
		A: 65,
		B: 66,
		C: 67,
		D: 68,
		E: 69,
		F: 70,
		G: 71,
		H: 72,
		I: 73,
		J: 74,
		K: 75,
		L: 76,
		M: 77,
		N: 78,
		O: 79,
		P: 80,
		Q: 81,
		R: 82,
		S: 83,
		T: 84,
		U: 85,
		V: 86,
		W: 87,
		X: 88,
		Y: 89,
		Z: 90,
		LEFT_WINDOW_KEY: 91,
		RIGHT_WINDOW_KEY: 92,
		SELECT_KEY: 93,
		NUMPAD_0: 96,
		NUMPAD_1: 97,
		NUMPAD_2: 98,
		NUMPAD_3: 99,
		NUMPAD_4: 100,
		NUMPAD_5: 101,
		NUMPAD_6: 102,
		NUMPAD_7: 103,
		NUMPAD_8: 104,
		NUMPAD_9: 105,
		MULTIPLY: 106,
		ADD: 107,
		SUBTRACT: 109,
		DECIMAL_POINT: 110,
		DIVIDE: 111,
		F1: 112,
		F2: 113,
		F3: 114,
		F4: 115,
		F5: 116,
		F6: 117,
		F7: 118,
		F8: 119,
		F9: 120,
		F10: 121,
		F11: 122,
		F12: 123,
		NUM_LOCK: 144,
		SCROLL_LOCK: 145,
		SEMI_COLON: 186,
		EQUAL_SIGN: 187,
		COMMA: 188,
		DASH: 189,
		PERIOD: 190,
		FORWARD_SLASH: 191,
		GRAVE_ACCENT: 192,
		OPEN_BRACKET: 219,
		BACK_SLASH: 220,
		CLOSE_BRAKET: 221,
		SINGLE_QUOTE: 222,

		keysPressed: {},
		callbacks: {}
	};

	addEventListener('keydown', function(e) {
		if (KEYBOARD.listeners != undefined) {
			// We execute the keydown listener for the current key
			var listener = KEYBOARD.listeners.keydown[e.keyCode];
			if (listener != undefined) {		    
				listener();
			}
		}

		KEYBOARD.keysPressed[e.keyCode] = true;
	}, false);

	addEventListener('keyup', function(e) {
		if (KEYBOARD.listeners != undefined) {
			// We execute the keyup listener for the current key
			var listener = KEYBOARD.listeners.keyup[e.keyCode];
			if (listener != undefined) {		    
				listener();
			}
		}

		delete KEYBOARD.keysPressed[e.keyCode];
	}, false);

	/**
	 * Binds a given string to one or more keys of the keyboard
	 * @param customKeys	obj: The custom labels and their associated keyboard keys
	 */
	function bindKeys(customKeys) {
		KEYBOARD.callbacks = {};	// We reset the key listeners
		KEYBOARD.customKeys = customKeys;
	};

	/**
	 * Makes an object controllable with the keyboard
	 * @param obj	The object to make controllable
	 */
	function addControlsCapabilities(obj) {
		if (obj.hasOwnProperty('controls')) {
			for (var key in obj.controls) {
				for (var i = 0, realKey; i < KEYBOARD.customKeys[key].length; i++) {
					realKey = KEYBOARD.customKeys[key][i];
					KEYBOARD.callbacks[realKey] = obj.controls[key];	// We get the callbacks from the object one by one
				};
			};

			obj.checkControls = function() {
				var called = {};	// A list of the currently executed callbacks (in order to call them only once)
				for (var key in obj.controls) {
					for (var i = 0, realKey; i < KEYBOARD.customKeys[key].length; i++) {
						realKey = KEYBOARD.customKeys[key][i];
						if ((realKey in KEYBOARD.keysPressed) && KEYBOARD.callbacks.hasOwnProperty(realKey) && called[key] == undefined) {	// If the key from the object controls is pressed
							KEYBOARD.callbacks[realKey]();	// We call the associated function
							called[key] = true;
						}
					};
				};	
			};
		}
	};

	/**
	 * Adds the listeners to a list of keys
	 * @param event	string: The event to listen to ('up' or 'down')
	 * @param key	The key which event will be listened to
	 * @param listener	function: The function to trigger on the event
	 */
	function addKeyListener(event, key, listener) {
		if (KEYBOARD.listeners == undefined) {
			// We create the list of listeners
			KEYBOARD.listeners = {
				keyup: {},
				keydown: {}
			};
		}
		// If the custom keys are defined
		if (KEYBOARD.customKeys != undefined && KEYBOARD.customKeys[key] != undefined) {
			for (var i = 0; i < KEYBOARD.customKeys[key].length; i++) {
				realKey = KEYBOARD.customKeys[key][i];
				KEYBOARD.listeners[event][realKey] = listener;	// We add the listeners for each key associated with the custom key
			};
		}
	}

	return {
		addControlsCapabilities: addControlsCapabilities,
		KEYS: KEYBOARD,
		bindKeys: bindKeys,
		addKeyListener: addKeyListener
	};
});