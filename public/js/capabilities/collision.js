define(function() {
	function addCollisionCapabilities (obj) {
		obj.hitTest = function(obj2) {
			var x1 = obj.center.x,
				y1 = obj.center.y,
				size1 = obj.size / 2,
				x2 = obj2.center.x,
				y2 = obj2.center.y,
				size2 = obj2.size / 2,
				bottom1, bottom2, left1, left2, right1, right2, top1, top2;
			left1 = x1 - size1;
			right1 = x1 + size1;
			top1 = y1 - size1;
			bottom1 = y1 + size1;
			left2 = x2 - size2;
			right2 = x2 + size2;
			top2 = y2 - size2;
			bottom2 = y2 + size2;
			return !(left1 > right2 || left2 > right1 || top1 > bottom2 || top2 > bottom1);
		};
	};
	return addCollisionCapabilities;
});