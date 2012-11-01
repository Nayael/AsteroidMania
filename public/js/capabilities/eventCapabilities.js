function addEventsCapabilities(object) {
	object.listeners = {};
	
	object.on = function(eventName, callback) {
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = [];
		}
		this.listeners[eventName].push(callback);
	};
	
	object.emit = function () {
		var args = Array.prototype.slice.call(arguments);
		var eventName = args.shift();
		
		var listeners = this.listeners[eventName];
		for (var i = 0; i < listeners.length; i++) {
			try {
				listeners[i].apply(this, args);
			} catch (e) {
				console.warn('Error on event ' + eventName);
				throw(e); 
			}
		}
	};
}