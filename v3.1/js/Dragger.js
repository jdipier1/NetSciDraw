/**********************************

DRAGGER

**********************************/

function Dragger(loopy){

	var self = this;
	self.loopy = loopy;

	// Dragging anything?
//	self.dragging = null;
//	self.offsetX = 0;
//	self.offsetY = 0;

	subscribe("mousedown",function(){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_DRAG) return;
		if (Model.smoothTranslate) return;

		// Any node under here? If so, start dragging!
		var dragNode = loopy.model.getNodeByPoint(Mouse.canvasX, Mouse.canvasY);
		if(dragNode){
			self.dragging = dragNode;
			self.offsetX = Mouse.canvasX - dragNode.x;
			self.offsetY = Mouse.canvasY - dragNode.y;
			loopy.sidebar.edit(dragNode); // and edit!
			return;
		}

		// Any label under here? If so, start dragging!
		var dragLabel = loopy.model.getLabelByPoint(Mouse.canvasX, Mouse.canvasY);
		if(dragLabel){
			self.dragging = dragLabel;
			self.offsetX = Mouse.canvasX - dragLabel.x;
			self.offsetY = Mouse.canvasY - dragLabel.y;
			loopy.sidebar.edit(dragLabel); // and edit!
			return;
		}

		// Any edge under here? If so, start dragging!
		var dragEdge = loopy.model.getEdgeByPoint(Mouse.canvasX, Mouse.canvasY);
		if(dragEdge){
			self.dragging = dragEdge;
			self.offsetX = Mouse.canvasX - dragEdge.labelX;
			self.offsetY = Mouse.canvasY - dragEdge.labelY;
			loopy.sidebar.edit(dragEdge); // and edit!
			return;
		}

		// Dragging canvas
		self.dragging = loopy.model;
		self.offsetX = Mouse.x - Model.x;
		self.offsetY = Mouse.y - Model.y;
	});

	subscribe("mousemove",function(){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_DRAG) return;

		// If you're dragging a NODE, move it around!
		if(self.dragging && self.dragging._CLASS_=="Node"){

			// Model's been changed!
			publish("model/changed");
			
			var node = self.dragging;
			node.x = (Mouse.canvasX - self.offsetX);
			node.y = (Mouse.canvasY - self.offsetY);

			// update coz visual glitches
			loopy.model.update();
			
		}

		// If you're dragging an EDGE, move it around!
		else if(self.dragging && self.dragging._CLASS_=="Edge"){

			// Model's been changed!
			publish("model/changed");

			var edge = self.dragging;
			var labelX = Mouse.canvasX - self.offsetX;
			var labelY = Mouse.canvasY - self.offsetY;

			if(edge.from!=edge.to){

				// The Arc: whatever label *Y* is, relative to angle & first node's pos
				var fx=edge.from.x, fy=edge.from.y, tx=edge.to.x, ty=edge.to.y;
				var dx=tx-fx, dy=ty-fy;
				var a = Math.atan2(dy,dx);

				// Calculate arc
				var points = [[labelX,labelY]];
				var translated = _translatePoints(points, -fx, -fy);
				var rotated = _rotatePoints(translated, -a);
				var newLabelPoint = rotated[0];

				// ooookay.
				edge.arc = -newLabelPoint[1]; // WHY NEGATIVE? I DON'T KNOW.

			}else{

				// For SELF-ARROWS: just get angle & mag for label.
				var dx = labelX - edge.from.x,
					dy = labelY - edge.from.y;
				var a = Math.atan2(dy,dx);
				var mag = Math.sqrt(dx*dx + dy*dy);

				// Minimum mag
				var minimum = edge.from.radius+25;
				if(mag<minimum) mag=minimum;

				// Update edge
				edge.arc = mag;
				edge.rotation = a*(360/Math.TAU)+90;

			}

			// update coz visual glitches
			loopy.model.update();

		}

		// If you're dragging a LABEL, move it around!
		else if(self.dragging && self.dragging._CLASS_=="Label"){

			// Model's been changed!
			publish("model/changed");
			
			var label = self.dragging;
			label.x = Mouse.canvasX - self.offsetX;
			label.y = Mouse.canvasY - self.offsetY;

			// update coz visual glitches
			loopy.model.update();
			
		}

		// Dragging canvas
		else if (self.dragging == loopy.model) {
			Model.xOffset = Mouse.x - self.offsetX;
			Model.yOffset = Mouse.y - self.offsetY;
			loopy.model.update();
		}

	});
	subscribe("mouseup",function(){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_DRAG) return;

		// Let go!
		self.dragging = null;
		self.offsetX = 0;
		self.offsetY = 0;
	});

}