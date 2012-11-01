/**
 * Method to implement inheritance in JavaScript
 * To use : inherit(Child, Parent);
 */
function inherit(C, P) {
	var F = function(){};
	F.prototype = P.prototype;
	C.prototype = new F();
}