// Well, technecally this handles the mouse AND touch interface now

window.Mouse = {};
Mouse.pinching = false;

//Dragging
Mouse.initPinchDist = -1;
Mouse.initPinchScale = -1;
Mouse.PINCH_SENSITIVITY = 256.0;

Mouse.init = function(target){

	// Events!

	var _onmousedown = function(event){
		Mouse.moved = false;
		Mouse.pressed = true;
		Mouse.startedOnTarget = true;
		publish("mousedown");
	};
	var _onmousemove = function(event){

		// DO THE INVERSE
		var canvasses = document.getElementById("canvasses");
		var tx = 0;
		var ty = 0;
		var s = 1/loopy.offsetScale;
		var CW = canvasses.clientWidth - _PADDING - _PADDING;
		var CH = canvasses.clientHeight - _PADDING_BOTTOM - _PADDING;

		if(loopy.embedded){
			tx -= _PADDING/2; // dunno why but this is needed
			ty -= _PADDING/2; // dunno why but this is needed
		}
		
		tx -= (CW+_PADDING)/2;
		ty -= (CH+_PADDING)/2;
		
		tx = s*tx;
		ty = s*ty;

		tx += (CW+_PADDING)/2;
		ty += (CH+_PADDING)/2;

		tx -= loopy.offsetX;
		ty -= loopy.offsetY;

		// Mutliply by Mouse vector
		var mx = event.x*s + tx;
		var my = event.y*s + ty;

		// Mouse!
		Mouse.x = mx;
		Mouse.y = my;

		Mouse.moved = true;
		publish("mousemove");

	};
	var _onmouseup = function(){
		Mouse.pressed = false;
		if(Mouse.startedOnTarget){
			publish("mouseup");
			if(!Mouse.moved) publish("mouseclick");
		}
		Mouse.moved = false;
		Mouse.startedOnTarget = false;
	};

	// Add mouse & touch events!
	_addMouseEvents(target, _onmousedown, _onmousemove, _onmouseup);

	// Cursor & Update
	Mouse.target = target;
	Mouse.showCursor = function(cursor){
		Mouse.target.style.cursor = cursor;
	};
	Mouse.update = function(){
		Mouse.showCursor("");
	};
};

Mouse.onPinchMove = function(e) {
	if (Mouse.initPinchDist === -1) {
		Mouse.initPinchDist = Math.hypot(
			e.touches[0].pageX - e.touches[1].pageX,
			e.touches[0].pageY - e.touches[1].pageY);
		Mouse.initPinchScale = Model.scale;
		return;
	}

	var dist = Math.hypot(
		e.touches[0].pageX - e.touches[1].pageX,
		e.touches[0].pageY - e.touches[1].pageY);

	Model.targetScale = Math.min(Math.max(Mouse.initPinchScale + ((Mouse.initPinchDist - dist)/Mouse.PINCH_SENSITIVITY), .25), 3);
}

Mouse.onPinchEnd = function(e) {
	Mouse.initPinchDist = -1;
}