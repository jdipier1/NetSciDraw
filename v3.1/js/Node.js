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

Node.DEFAULT_RADIUS = 120;
Node.scale = 1.0; 

function Node(model, config) {

	var self = this;
	self._CLASS_ = "Node";

	// Parents
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
		width: Node.DEFAULT_RADIUS,
		height: Node.DEFAULT_RADIUS,
		shape: Shapes.CIRCLE,
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
	self.draw = function(ctx){

		// Retina
		var x = (self.x*2);
		var y = (self.y*2);
		var color = Node.COLORS[self.hue];
		var textColor = Node.COLORS[self.textHue];

		// Translate!
		ctx.save();
		_translate(ctx, x, y+_offset);
		
		// DRAW HIGHLIGHT
		if(self.loopy.sidebar.currentPage.target == self) {
			ctx.beginPath();
			ctx.lineWidth = 60;					// Highlight border size, change to make the highlight bigger/smaller
			ctx.strokeStyle = HIGHLIGHT_COLOR;
			self.shape.draw(ctx, self);
			ctx.stroke();
		}

		ctx.beginPath();
		ctx.lineWidth = 6;
		ctx.strokeStyle = color;
		ctx.fillStyle = "#fff";
		self.shape.draw(ctx, self);
		ctx.fill();
		ctx.stroke();

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
		self.shape.drawText(ctx, self)

		// Restore
		ctx.restore();

	};

	// Create a copy of this node
	self.cloneNode = function() {

		var offset = Math.max(self.width, self.height) + 20;
		var theta  = Math.random() * Math.TAU; 

		var newNode = loopy.model.addNode({
			x: self.x + offset*Math.cos(theta),
			y: self.y + offset*Math.sin(theta),
			width: self.width,
			height: self.height,
			shape: self.shape,
			label: self.label, 	// Copies the label
			hue: self.hue, 		// Copies the color
			textHue: self.textHue,
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

	self.isPointInNode = function(x, y, buffer) {
		return self.shape.isPointInside(self, x, y);
	};

	self.getBoundingBox = function() {
		var dx = (self.width/2);
		var dy = (self.height/2);

		return {
			left: self.x - dx,
			top: self.y - dy,
			right: self.x + dx,
			bottom: self.y + dy
		};
	};

}

////////////////////////////
// Unique ID identifiers! //
////////////////////////////

Node._UID = 0;
Node._getUID = function(){
	Node._UID++;
	console.log(Node._UID)
	return Node._UID;
};
