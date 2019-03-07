/**
 * Node
 * 
 * Represents the nodes in the project
 */
Node.COLORS = {
	0: "#EA3E3E", // red
	1: "#EA9D51", // orange
	2: "#FEEE43", // yellow
	3: "#BFEE3F", // green
	4: "#7FD4FF", // blue
	5: "#A97FFF", // purple
	6: "#000000", // black
};

//Node.defaultValue = 0.5;
//Node.defaultHue = 0;

Node.DEFAULT_RADIUS = 60;
Node.scale = 1.0;

function Node(model, config){

	var self = this;
	self._CLASS_ = "Node";

	// Mah Parents!
	self.loopy = model.loopy;
	self.model = model;
	self.config = config;

	// Default values...
	_configureProperties(self, config, {
		id: Node._getUID,
		x: 0,
		y: 0,
		init: Node.defaultValue, // initial value!
		label: "?",
		hue: 6, // Makes the initital color of a circle black
		textHue: 6,
		radius: Node.DEFAULT_RADIUS,
		xscale: 1,
		yscale: 1,
		isRect: false
	});

	// Value: from 0 to 1
	self.value = self.init;
	// TODO: ACTUALLY VISUALIZE AN INFINITE RANGE
	self.bound = function(){ // bound ONLY when changing value.
		/*var buffer = 1.2;
		if(self.value<-buffer) self.value=-buffer;
		if(self.value>1+buffer) self.value=1+buffer;*/
	};

	// MOUSE.
	var _controlsVisible = false;
	var _controlsAlpha = 0;
	var _controlsDirection = 0;
	var _controlsSelected = false;
	var _controlsPressed = false;	
	var _listenerMouseMove = subscribe("mousemove", function(){

		// ONLY WHEN PLAYING
		if(self.loopy.mode!=Loopy.MODE_PLAY) return;

		// If moused over this, show it, or not.
		_controlsSelected = self.isPointInNode(Mouse.x, Mouse.y);
		if(_controlsSelected){
			_controlsVisible = true;
			self.loopy.showPlayTutorial = false;
			_controlsDirection = (Mouse.y<self.y) ? 1 : -1;
		}else{
			_controlsVisible = false;
			_controlsDirection = 0;
		}

	});
	var _listenerMouseDown = subscribe("mousedown",function(){

		if(self.loopy.mode!=Loopy.MODE_PLAY) return; // ONLY WHEN PLAYING
		if(_controlsSelected) _controlsPressed = true;

		// IF YOU CLICKED ME...
		if(_controlsPressed){

			// Change my value
			var delta = _controlsDirection*0.33; // HACK: hard-coded 0.33
			self.value += delta;

			// And also PROPAGATE THE DELTA
			self.sendSignal({
				delta: delta
			});

		}

	});
	var _listenerMouseUp = subscribe("mouseup",function(){
		if(self.loopy.mode!=Loopy.MODE_PLAY) return; // ONLY WHEN PLAYING
		_controlsPressed = false;
	});
	var _listenerReset = subscribe("model/reset", function(){
		self.value = self.init;
	});

	//////////////////////////////////////
	// SIGNALS ///////////////////////////
	//////////////////////////////////////
// ***CAN BE DELETED***
//	var shiftIndex = 0;
//	self.sendSignal = function(signal){
//		var myEdges = self.model.getEdgesByStartNode(self);
//		myEdges = _shiftArray(myEdges, shiftIndex);
//		shiftIndex = (shiftIndex+1)%myEdges.length;
//		for(var i=0; i<myEdges.length; i++){
//			myEdges[i].addSignal(signal);
//		}
//	};
// 
//	self.takeSignal = function(signal){

//		// Change value
//		self.value += signal.delta;
//
//		// Propagate signal
//		self.sendSignal(signal);
//		// self.sendSignal(signal.delta*0.9); // PROPAGATE SLIGHTLY WEAKER
//
//		// Animation
//		// _offsetVel += 0.08 * (signal.delta/Math.abs(signal.delta));
//		_offsetVel -= 6 * (signal.delta/Math.abs(signal.delta));
// 
//	};
// ***DELETE UNTIL***


	//////////////////////////////////////
	// UPDATE & DRAW /////////////////////
	//////////////////////////////////////

	// Update!
	var _offset = 0;
	var _offsetGoto = 0;
	var _offsetVel = 0;
	var _offsetAcc = 0;
	var _offsetDamp = 0.3;
	var _offsetHookes = 0.8;
	self.update = function(speed){

// ***CAN BE DELETED***
		// When actually playing the simulation...
//		var _isPlaying = (self.loopy.mode==Loopy.MODE_PLAY);
//
//		// Otherwise, value = initValue exactly
//		if(self.loopy.mode==Loopy.MODE_EDIT){
//			self.value = self.init;
//		}
//
//		// Cursor!
//		if(_controlsSelected) Mouse.showCursor("pointer");
//
//		// Keep value within bounds!
//		self.bound();
//
//		// Visually & vertically bump the node
//		var gotoAlpha = (_controlsVisible || self.loopy.showPlayTutorial) ? 1 : 0;
//		_controlsAlpha = _controlsAlpha*0.5 + gotoAlpha*0.5;
//		if(_isPlaying && _controlsPressed){
//			_offsetGoto = -_controlsDirection*20; // by 20 pixels
//			// _offsetGoto = _controlsDirection*0.2; // by scale +/- 0.1
//		}else{
//			_offsetGoto = 0;
//		}
//		_offset += _offsetVel;
//		if(_offset>40) _offset=40
//		if(_offset<-40) _offset=-40;
//		_offsetVel += _offsetAcc;
//		_offsetVel *= _offsetDamp;
//		_offsetAcc = (_offsetGoto-_offset)*_offsetHookes;
// ***DELETE UNTIL***

	};

	// Draw
	var _circleRadius = 0;
	self.draw = function(ctx){

		// Retina
		var x = (self.x*2);
		var y = (self.y*2);
		var r = self.radius*2;
		var xs = self.xscale/2;
		var ys = self.yscale/2;
		var color = Node.COLORS[self.hue];
		var textColor = Node.COLORS[self.textHue];

		// Translate!
		ctx.save();
		_translate(ctx, x, y+_offset);
		
		// DRAW HIGHLIGHT
		// TODO: I think this does fuckall -jay
		if(self.loopy.sidebar.currentPage.target == self){
			ctx.beginPath();
			ctx.arc(0, 0, r+40, 0, Math.TAU, false);
//			ctx.fillStyle = HIGHLIGHT_COLOR;
//			ctx.fill();
		}
		
		// White-gray bubble with colored border
		ctx.beginPath();
		if (self.isRect) {
			ctx.rect(-r*xs, -r*ys, (r*2)*xs, (r*2)*ys);
			// Lazy fix for text
			r = xs;
		} else {
			ctx.arc(0, 0, r-2, 0, Math.TAU, false);
		}
		ctx.fillStyle = "#fff";
		ctx.fill();
		ctx.lineWidth = 6;
		ctx.strokeStyle = color;
		ctx.stroke();
		
		// Circle radius
		var _circleRadiusGoto = r*(self.value+1);
		_circleRadius = _circleRadius*0.75 + _circleRadiusGoto*0.25;

		// RADIUS IS (ATAN) of VALUE?!?!?!
		var _r = Math.atan(self.value*5);
		_r = _r/(Math.PI/2);
		_r = (_r+1)/2;

		// INFINITE RANGE FOR RADIUS
		// linear from 0 to 1, asymptotic otherwise.
		var _value;
		if(self.value>=0 && self.value<=1){
			// (0,1) -> (0.1, 0.9)
			_value = 0.1 + 0.8*self.value;
		}else{
			if(self.value<0){
				// asymptotically approach 0, starting at 0.1
				_value = (1/(Math.abs(self.value)+1))*0.1;
			}
			if(self.value>1){
				// asymptotically approach 1, starting at 0.9
				_value = 1 - (1/self.value)*0.1;
			}
		}

		// Colored bubble
//		ctx.beginPath();
//		var _circleRadiusGoto = r*_value; // radius
//		_circleRadius = _circleRadius*0.8 + _circleRadiusGoto*0.2;
//		ctx.arc(0, 0, _circleRadius, 0, Math.TAU, false);
//		ctx.fillStyle = color;
//		ctx.fill();

		var fontsize = 40;
		ctx.font = "normal "+fontsize+"px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#000";
		//var width = ctx.measureText(self.label).width;

		ctx.fillStyle = textColor;
		if (self.isRect) {
			_boundedText(ctx, self.label, 0, 0, xs*4, ys*4, 40);
		} else {
			var size = Math.sqrt(2 * (r*r));
			_boundedText(ctx, self.label, 0, 0, size ,size, 20);
		}

		// Restore
		ctx.restore();

	};

	// Create a copy of this node
	self.cloneNode = function() {

		var offset = Math.max(Math.max(self.xscale, self.radius*2), self.yscale) + 20;
		var theta  = Math.random() * Math.TAU; 

		var newNode = loopy.model.addNode({
			x: self.x + offset*Math.cos(theta),
			y: self.y + offset*Math.sin(theta),
			radius: self.radius,
			xscale: self.xscale,
			yscale: self.yscale,
			isRect: self.isRect,
		});
	
		loopy.sidebar.edit(newNode);
	}

	//////////////////////////////////////
	// KILL NODE /////////////////////////
	//////////////////////////////////////

	self.kill = function(){

		// Kill Listeners!
		unsubscribe("mousemove",_listenerMouseMove);
		unsubscribe("mousedown",_listenerMouseDown);
		unsubscribe("mouseup",_listenerMouseUp);
		unsubscribe("model/reset",_listenerReset);

		// Remove from parent!
		model.removeNode(self);

		// Killed!
		publish("kill",[self]);

	};

	//////////////////////////////////////
	// HELPER METHODS ////////////////////
	//////////////////////////////////////

	self.isPointInNode = function(x, y, buffer){
		buffer = buffer || 0;
		if (self.isRect) {
			var dx = (self.xscale/2)*self.radius;
			var dy = (self.yscale/2)*self.radius;
			return _isPointInBox(x, y, self.x-dx, self.y-dy, dx*2, dy*2);
		} else {
			return _isPointInCircle(x, y, self.x, self.y, self.radius+buffer);
		}
	};

	self.getBoundingBox = function(){
		return {
			left: self.x - self.radius,
			top: self.y - self.radius,
			right: self.x + self.radius,
			bottom: self.y + self.radius
		};
	};

}

////////////////////////////
// Unique ID identifiers! //
////////////////////////////

Node._UID = 0;
Node._getUID = function(){
	Node._UID++;
	return Node._UID;
};
