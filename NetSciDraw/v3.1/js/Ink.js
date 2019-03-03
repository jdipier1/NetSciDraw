/**********************************

LOOPY!
- with edit & play mode

TODO: smoother bezier curve?
TODO: when switch away tool, clear the Ink canvas

**********************************/

Ink.MINIMUM_RADIUS = Node.DEFAULT_RADIUS;
Ink.SNAP_TO_RADIUS = 25;

function Ink(loopy){

	var self = this;
	self.loopy = loopy;

	// Create canvas & context
	var canvas = _createCanvas();
	var ctx = canvas.getContext("2d");
	self.canvas = canvas;
	self.context = ctx;

	// Stroke data!
	self.strokeData 	= [];

	self.geomEdges 		= [];		// The basic primitive made by strokeData
	self.geomDir		= 0;		// For determining when to add the next edge to the geomEdges
	self.geomScore		= 0;		// A "score" put onto the number of edges

	// Helper function
	extendGeomEdge = function(dx, dy) {
		var lastPt = self.geomEdges[self.geomEdges.length-1];
		var len = _distance(dx,dy,lastPt[0], lastPt[1]);
		var dir = _pointDirection(dx,dy,lastPt[0], lastPt[1]);
		self.geomEdges[self.geomEdges.length-1][0] += len*Math.cos(dir);
		self.geomEdges[self.geomEdges.length-1][1] += len*Math.sin(dir);
	}


	// Drawing!
	self.drawInk = function(){
		if(!Mouse.pressed) return;

		// Last point
		var lastPoint = self.strokeData[self.strokeData.length-1];

		// No point to drawing the same point over again
		if (lastPoint[0] == Mouse.x/Model.scale && lastPoint[1] == Mouse.y/Model.scale) return;

		// Style
		ctx.save();
		ctx.scale(Model.scale, Model.scale);

		ctx.strokeStyle = "#FF000";
		ctx.lineWidth = 5;
		ctx.lineCap = "round";

		

		// DEBUG
		//ctx.arc(Mouse.x, Mouse.y, 64, 0, Math.TAU, true);

		// Draw line from last to current
		ctx.beginPath();
		ctx.moveTo(lastPoint[0]*2, lastPoint[1]*2);
		ctx.lineTo(Mouse.x/Model.scale*2, Mouse.y/Model.scale*2);
		ctx.stroke();
		ctx.restore();

		

		// Update last point
		self.strokeData.push([Mouse.x/Model.scale,Mouse.y/Model.scale]);


		var dx = _roundDown(Mouse.x/Model.scale, 4);
		var dy = _roundDown(Mouse.y/Model.scale, 4);
		// Update primitive
		if (self.geomEdges.length < 2) {
			self.geomEdges.push([dx, dy]);
		} else {
			var g1 = self.geomEdges[self.geomEdges.length-2];
			var g2 = self.geomEdges[self.geomEdges.length-1];

			if (_distanceSquared(dx,dy,g2[0],g2[1]) < 100) {
				return;
			}
		
			if (self.geomEdges.length == 2) {
				self.geomDir 	= _normalize(_pointDirection(g1, g2));
			}

			if (g2[0] == dx && g2[1] == dy) {
				return;
			}
			
			var newDir	= _normalize([dx - g2[0], dy - g2[1]]);
			var dp = _dotProduct(self.geomDir, newDir);

			if (dp > .65) {
				if (dp > .8) {
					extendGeomEdge(dx, dy);
				} else {
					self.geomEdges.push([dx, dy]);
					self.geomDir = newDir;
				}
			} else {
				self.geomEdges.push([dx, dy]);
				self.geomScore++;
				self.geomDir = newDir;
			}
		}
	};

	self.reset = function(){
		ctx.clearRect(0,0,canvas.width,canvas.height); // Clear canvas
		self.strokeData = []; // Reset stroke data
		self.geomEdges = [];
		self.geomScore = 0;
	};
	subscribe("mousedown",function(){

		// ONLY WHEN EDITING w INK
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_INK) return;

		// New stroke data
		self.strokeData = [];
		self.strokeData.push([Mouse.x/Model.scale,Mouse.y/Model.scale]);
		self.geomEdges = [];
		self.geomEdges.push([Mouse.x/Model.scale,Mouse.y/Model.scale]);
		self.geomScore = 0;

		// Draw to canvas!
		self.drawInk();

	});
	subscribe("mousemove",function(){

		// ONLY WHEN EDITING w INK
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_INK) return;

		// Draw ink!
		self.drawInk();

	});
	subscribe("mouseup",function(){

		// ONLY WHEN EDITING w INK
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_INK) return;

		if(self.strokeData.length<2) return;
		if(!Mouse.moved) return;

		/*************************
		
		Detect what you drew!
		1. Started in a node?
		1a. If ended near/in a node, it's an EDGE.
		2. If not, it's a NODE. // TODO: actual circle detection?

		*************************/

		// Started in a node?
		var startPoint = self.strokeData[0];
		var startNode = loopy.model.getNodeByPoint(startPoint[0], startPoint[1]);
		if(!startNode) startNode=loopy.model.getNodeByPoint(startPoint[0], startPoint[1], 20); // try again with buffer

		// Ended in a node?
		var endPoint = self.strokeData[self.strokeData.length-1];
		var endNode = loopy.model.getNodeByPoint(endPoint[0], endPoint[1]);
		if(!endNode) endNode=loopy.model.getNodeByPoint(endPoint[0], endPoint[1], 40); // try again with buffer

		// EDGE: started AND ended in nodes
		if(startNode && endNode){

			// Config!
			var edgeConfig = {
				from: startNode.id,
				to: endNode.id
			};

			// If it's the same node...
			if(startNode==endNode){

				// TODO: clockwise or counterclockwise???
				// TODO: if the arc DOES NOT go beyond radius, don't make self-connecting edge. also min distance.

				// Find rotation first by getting average point
				var bounds = _getBounds(self.strokeData);
				var x = (bounds.left+bounds.right)/2;
				var y = (bounds.top+bounds.bottom)/2;
				var dx = x-startNode.x;
				var dy = y-startNode.y;
				var angle = Math.atan2(dy,dx);

				// Then, find arc height.
				var translated = _translatePoints(self.strokeData, -startNode.x, -startNode.y);
				var rotated = _rotatePoints(translated, -angle);
				bounds = _getBounds(rotated);

				// Arc & Rotation!
				edgeConfig.rotation = angle*(360/Math.TAU) + 90;
				edgeConfig.arc = bounds.right;

				// ACTUALLY, IF THE ARC IS *NOT* GREATER THAN THE RADIUS, DON'T DO IT.
				// (and otherwise, make sure minimum distance of radius+25)
				if(edgeConfig.arc < startNode.radius){
					edgeConfig=null;
					loopy.sidebar.edit(startNode); // you were probably trying to edit the node
				}else{
					var minimum = startNode.radius+25;
					if(edgeConfig.arc<minimum) edgeConfig.arc=minimum;
				}

			}else{

				// Otherwise, find the arc by translating & rotating
				var dx = endNode.x-startNode.x;
				var dy = endNode.y-startNode.y;
				var angle = Math.atan2(dy,dx);
				var translated = _translatePoints(self.strokeData, -startNode.x, -startNode.y);
				var rotated = _rotatePoints(translated, -angle);
				var bounds = _getBounds(rotated);
				
				// Arc!
				if(Math.abs(bounds.top)>Math.abs(bounds.bottom)) edgeConfig.arc = -bounds.top;
				else edgeConfig.arc = -bounds.bottom;

			}

			// Add the edge!
			if(edgeConfig){
				var newEdge = loopy.model.addEdge(edgeConfig);
				loopy.sidebar.edit(newEdge);
			}

		}

		// NODE: did NOT start in a node.
		if(!startNode){

			// Just roughly make a circle the size of the bounds of the circle
			var bounds = _getBounds(self.strokeData);

			// TODO: This breaks when Model.scale != 1

			/*bounds.left  = Model.canvasCenterX + (bounds.left -Model.canvasCenterX)*Model.scale;
			bounds.right = Model.canvasCenterX + (bounds.right-Model.canvasCenterX)*Model.scale;
			bounds.top 		= Model.canvasCenterY + (bounds.top    -Model.canvasCenterY)*Model.scale;
			bounds.bottom 	= Model.canvasCenterY + (bounds.bottom -Model.canvasCenterY)*Model.scale;*/


			var x = ((bounds.left+bounds.right)/2);
			var y = ((bounds.top+bounds.bottom)/2);
			var r = ((bounds.width/2)+(bounds.height/2))/2;

			x = Model.contextCenterX + ((x - Model.contextCenterX)*Model.scale);
			y = Model.contextCenterY + ((y - Model.contextCenterY)*Model.scale);

			// Circle can't be TOO smol
			if(r>15){

				// Snap to radius
				/*r = Math.round(r/Ink.SNAP_TO_RADIUS)*Ink.SNAP_TO_RADIUS;
				if(r<Ink.MINIMUM_RADIUS) r=Ink.MINIMUM_RADIUS;*/

				// LOCK TO JUST SMALLEST CIRCLE.
				r = (((bounds.right-bounds.left)/4)+(bounds.bottom-bounds.top)/4); //change made from min radius 
				
				// Make that node!
				if (self.geomScore > 3) {
					var newNode = loopy.model.addNode({
						x:x,
						y:y,
						radius:1,								// If you want this to noly make squares, change this to 'r'
						xscale:bounds.right - bounds.left,		// in addition to above, comment out this line
						yscale:bounds.bottom - bounds.top,		// and this line
						isRect: true
					});
				} else {
					var newNode = loopy.model.addNode({
						x:x,
						y:y,
						radius:r,
						isRect: false
					});
				}
				
				// Edit it immediately
				loopy.sidebar.edit(newNode);
			}

		}

		// Reset.
		self.reset();

	});
	subscribe("mouseclick",function(){

		// ONLY WHEN EDITING w INK
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_INK) return;

		// Reset
		self.reset();

	});
}