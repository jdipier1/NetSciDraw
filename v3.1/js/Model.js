/**********************************

MODEL!

**********************************/

Model.scale = 1.0;
Model.targetScale = 1.0;
Model.width = 1;
Model.height = 1;

Model.x = 0;
Model.y = 0;



// This is the translation of the model (ignoring scale offset)
Model.xOffset = 0;
Model.yOffset = 0;
Model.xOffsetTarget = 0;
Model.yOffsetTarget = 0;
Model.smoothTranslate = false;

Model.bgColor = "#FFFFFF";
Model.takingPicture = false;

Model.zoomOffset = {x: 0, y: 0, initialZoom: 1.0};

Model.transformMatrix = [1, 0, 0, 1, 0, 0];

function Model(loopy){

	var self = this;
	self.loopy = loopy;

	// Properties
	self.speed = 0.05;

	// Create canvas & context
	var canvas = _createCanvas();
	var ctx = canvas.getContext("2d");
	self.canvas = canvas;
	self.context = ctx;

	Model.canvasCenterX = canvas.width/2;
	Model.canvasCenterY = canvas.height/2;
	Model.contextCenterX = ctx.canvas.clientWidth/2;
	Model.contextCenterY = ctx.canvas.clientHeight/2;

	//Model.x = -Model.canvasCenterX;
	//Model.y = -Model.canvasCenterY;

	///////////////////
	// NODES //////////
	///////////////////

	// Nodes
	self.nodes = [];
	self.nodeByID = {};
	self.getNode = function(id){
		return self.nodeByID[id];
	};

	Model.getCanvas = function() {
		return canvas;
	}

	// Remove Node
	self.addNode = function(config){

		// Model's been changed!
		publish("model/changed");
		Audio.play('plop');

		// Add Node
		var node = new Node(self,config);
		self.nodeByID[node.id] = node;
		self.nodes.push(node);
		self.update();

		return node;

	};

	// Remove Node
	self.removeNode = function(node){

		// Model's been changed!
		publish("model/changed");

		// Remove from array
		self.nodes.splice(self.nodes.indexOf(node),1);

		// Remove from object
		delete self.nodeByID[node.id];

		// Remove all associated TO and FROM edges
		for(var i=0; i<self.edges.length; i++){
			var edge = self.edges[i];
			if(edge.to==node || edge.from==node){
				edge.kill();
				i--; // move index back, coz it's been killed
			}
		}
		
	};

	self.pictureBounds = function(takePicture) {
		var pb = {
			x1:0,
			y1:0,
			x2:0,
			y2:0
		}

		Model.takingPicture = takePicture;

		for(var i = 0; i < self.nodes.length; i++) {
			var n = self.nodes[i];
			if (n) {
				pb.x1 = Math.min(pb.x1, n.x - n.width);
				pb.y1 = Math.min(pb.y1, n.y - n.height);
				pb.x2 = Math.max(pb.x2, n.x + n.width);
				pb.y2 = Math.max(pb.y2, n.y + n.height);
			}
		}

		/*for(var i = 0; i < self.labels.length; i++) {
			var n = self.labels[i];
			var width = n.fontSize * n.text;
			if (n) {
				pb.x1 = Math.min(pb.x1, n.x - width);
				pb.y1 = Math.min(pb.y1, n.y - n.fontSize*4);
				pb.x2 = Math.max(pb.x2, n.x + width);
				pb.y2 = Math.max(pb.y2, n.y + n.fontSize*4);
			}
		}*/

		Model.xOffsetTarget = -pb.x1/2;// - (Model.contextCenterX*0.2*Model.targetScale);
		Model.yOffsetTarget = -pb.y1/2;// - (Model.contextCenterX*0.2*Model.targetScale);
		Model.smoothTranslate = true;
		Model.targetScale = Math.max(Math.min((Model.contextCenterX*1.75)/(pb.x2-pb.x1), 3), 0.01);
	}


	///////////////////
	// EDGES //////////
	///////////////////

	// Edges
	self.edges = [];

	// Remove edge
	self.addEdge = function(config){

		// Model's been changed!
		publish("model/changed");
		Audio.play('drop');
		// Add Edge
		var edge = new Edge(self,config);
		self.edges.push(edge);
		self.update();
		return edge;
	};

	// Remove edge
	self.removeEdge = function(edge){

		// Model's been changed!
		publish("model/changed");

		// Remove edge
		self.edges.splice(self.edges.indexOf(edge),1);

	};

	// Get all edges with start node
	self.getEdgesByStartNode = function(startNode){
		return self.edges.filter(function(edge){
			return(edge.from==startNode);
		});
	};




	///////////////////
	// LABELS /////////
	///////////////////

	// Labels
	self.labels = [];

	// Remove label
	self.addLabel = function(config){

		// Model's been changed!
		publish("model/changed");
		Audio.play('plop');
		// Add label
		var label = new Label(self,config);
		self.labels.push(label);
		self.update();
		return label;
	};

	// Remove label
	self.removeLabel = function(label){

		// Model's been changed!
		publish("model/changed");

		// Remove label
		self.labels.splice(self.labels.indexOf(label),1);
		
	};



	///////////////////
	// UPDATE & DRAW //
	///////////////////

	var _canvasDirty = false;

	self.update = function(){

		if (Math.abs(Model.scale - Model.targetScale) > .005) {
			var amount = Model.zoomOffset.initialZoom - Model.scale;

			Model.scale = _lerp(Model.scale, Model.targetScale, 0.35);
			// TODO: This is wonky
			//Model.zoomOffset.x = amount*(canvas.clientWidth);
			//Model.zoomOffset.y = amount*(canvas.clientHeight);	
		} else {
			Model.scale = Model.targetScale;
			if (Mouse.initPinchDist == -1) {
				Model.xOffset += Model.zoomOffset.x;
				Model.yOffset += Model.zoomOffset.y;

				Model.zoomOffset.x = 0;
				Model.zoomOffset.y = 0;
			}
		}

		// Update edges THEN nodes
		for(var i=0;i<self.edges.length;i++) self.edges[i].update(self.speed);
		for(var i=0;i<self.nodes.length;i++) self.nodes[i].update(self.speed);

		// Dirty!
		_canvasDirty = true;

	};

	// SHOULD WE DRAW?
	var drawCountdownFull = 60; // two-second buffer!
	var drawCountdown = drawCountdownFull; 
	
	// ONLY IF MOUSE MOVE / CLICK
	subscribe("mousemove", function(){ drawCountdown=drawCountdownFull; });
	subscribe("mousedown", function(){ drawCountdown=drawCountdownFull; });

	// OR INFO CHANGED
	subscribe("model/changed", function(){
		if(self.loopy.mode==Loopy.MODE_EDIT) drawCountdown=drawCountdownFull;
	});

	// OR RESIZE or RESET
	subscribe("resize",function(){ drawCountdown=drawCountdownFull; });
	subscribe("model/reset",function(){ drawCountdown=drawCountdownFull; });
	subscribe("loopy/mode",function(){
		if(loopy.mode==Loopy.MODE_PLAY){
			drawCountdown=drawCountdownFull*2;
		}else{
			drawCountdown=drawCountdownFull;
		}
	});

	self.draw = function(){

		if (Model.smoothTranslate && (Model.xOffsetTarget != Model.xOffset || Model.yOffsetTarget != Model.yOffset)) {
			Model.xOffset = _lerp(Model.xOffset, Model.xOffsetTarget, 0.2);
			Model.yOffset = _lerp(Model.yOffset, Model.yOffsetTarget, 0.2);
			loopy.toolbar.disableButtons();
			Model.zoomOffset.x = 0;
			Model.zoomOffset.y = 0;

			if (Math.abs(Model.xOffsetTarget - Model.xOffset) < 0.1) {
				Model.xOffset = Model.xOffsetTarget;
			}
			if (Math.abs(Model.yOffsetTarget - Model.yOffset) < 0.1) {
				Model.yOffset = Model.yOffsetTarget;
			}
		} else {
			Model.smoothTranslate = false;
			if (Model.takingPicture) {
				publish("modal",["save_img"]);
				Model.takingPicture = false;
			}
		}

		// Also only draw if last updated...
		if(!_canvasDirty) return;
		_canvasDirty = false;

		// Clear!
		//ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
		ctx.fillStyle = Model.bgColor;
		ctx.fillRect(0,0,self.canvas.width,self.canvas.height);
		// Translate
		ctx.save();

		// Translate canvas to center
		var canvasses = document.getElementById("canvasses");
		var CW = canvasses.clientWidth - _PADDING - _PADDING;
		var CH = canvasses.clientHeight - _PADDING_BOTTOM - _PADDING;
		var tx = loopy.offsetX*2;
		var ty = loopy.offsetY*2;
		tx -= CW+_PADDING;
		ty -= CH+_PADDING;

		// Scale
		var s = loopy.offsetScale * Model.scale;
		tx = s*tx;
		ty = s*ty;

		Model.x = Model.zoomOffset.x + Model.xOffset;
		Model.y = Model.zoomOffset.y + Model.yOffset;

		// Translate once more
		tx += CW+_PADDING + Model.x;
		ty += CH+_PADDING + Model.y;
		if(loopy.embedded){
			tx += _PADDING; // dunno why but this is needed
			ty += _PADDING; // dunno why but this is needed
		}

		Model.transformMatrix[0] = s;
		Model.transformMatrix[3] = s;
		Model.transformMatrix[4] = Model.x;
		Model.transformMatrix[5] = Model.y;
		ctx.setTransform(Model.transformMatrix[0], Model.transformMatrix[1], Model.transformMatrix[2], Model.transformMatrix[3], Model.transformMatrix[4], Model.transformMatrix[5]);

		// Draw labels THEN edges THEN nodes
		for(var i=0;i<self.labels.length;i++) self.labels[i].draw(ctx);
		for(var i=0;i<self.edges.length;i++) self.edges[i].draw(ctx);
		for(var i=0;i<self.nodes.length;i++) self.nodes[i].draw(ctx);

		// Restore
		ctx.restore();
	};

	//////////////////////////////
	// SERIALIZE & DE-SERIALIZE //
	//////////////////////////////

	self.serialize = function(){

		var data = [];
		// 0 - nodes
		// 1 - edges
		// 2 - labels
		// 3 - UID

		// Nodes
		var nodes = [];
		for(var i=0;i<self.nodes.length;i++){
			var node = self.nodes[i];
			// 0 - id
			// 1 - x
			// 2 - y
			// 3 - init value
			// 4 - label
			// 5 - hue
			// 6 - width
			// 7 - height
			// 8 - shape
			nodes.push([
				node.id,
				Math.round(node.x),
				Math.round(node.y),
				node.init,
				encodeURIComponent(encodeURIComponent(node.label)),
				node.hue,
				node.width,
				node.height,
				node.shape
			]);
		}
		data.push(nodes);

		// Edges
		var edges = [];
		for(var i=0;i<self.edges.length;i++){
			var edge = self.edges[i];
			// 0 - from
			// 1 - to
			// 2 - arc
			// 3 - strength
			// 4 - rotation (optional)
			var dataEdge = [
				edge.from.id,
				edge.to.id,
				Math.round(edge.arc),
				edge.strength,
				edge.hues
			];
			if(dataEdge.f==dataEdge.t){
				dataEdge.push(Math.round(edge.rotation));
			}
			edges.push(dataEdge);
		}
		data.push(edges);

		// Labels
		var labels = [];
		for(var i=0;i<self.labels.length;i++){
			var label = self.labels[i];
			// 0 - x
			// 1 - y
			// 2 - text
			labels.push([
				Math.round(label.x),
				Math.round(label.y),
				encodeURIComponent(encodeURIComponent(label.text))
			]);
		}
		data.push(labels);

		// META.
		data.push(Node._UID);

		// Return as string!
		var dataString = JSON.stringify(data);
		dataString = dataString.replace(/"/gi, "%22"); // and ONLY URIENCODE THE QUOTES
		dataString = dataString.substr(0, dataString.length-1) + "%5D";// also replace THE LAST CHARACTER
		return dataString;

	};

	self.deserialize = function(dataString){

		self.clear();

		var data = JSON.parse(dataString);

		// Get from array!
		var nodes = data[0];
		var edges = data[1];
		var labels = data[2];
		var UID = data[3];

		// Nodes
		for(var i=0;i<nodes.length;i++){
			var node = nodes[i];
			self.addNode({
				id: node[0],
				x: node[1],
				y: node[2],
				init: node[3],
				label: decodeURIComponent(node[4]),
				hue: node[5],
				width: node[6],
				height: node[7],
				shape: node[8]
			});
		}

		// Edges
		for(var i=0;i<edges.length;i++){
			var edge = edges[i];
			var edgeConfig = {
				from: edge[0],
				to: edge[1],
				arc: edge[2],
				strength: edge[3],
				hues: edge[4]
			};
			if(edge[4]) edgeConfig.rotation=edge[4];
			self.addEdge(edgeConfig);
			
		}

		// Labels
		for(var i=0;i<labels.length;i++){
			var label = labels[i];
			self.addLabel({
				x: label[0],
				y: label[1],
				text: decodeURIComponent(label[2])
			});
		}

		// META.
		Node._UID = UID;

	};

	self.loadNode = function(id, x, y, width, height, hue, label, shape) {
		console.log("ID:"+id);
		self.addNode({
			id: id,
			x: x,
			y: y,
			label: label,
			hue: hue,
			width: width,
			height: height,
			shape: Shapes.getShape(shape)
		});
	}

	self.loadEdge = function(from, to, hues, arc, thickness, strength, rotation) {
		self.addEdge({
			from: from,//self.getNodeById(from),
			to: to,//self.getNodeById(to),
			arc: arc,
			thickness: thickness,
			hues: hues,
			strength: strength,
			//rotation: rotation
		});
	}

	self.loadLabel = function(x, y, hues, label, fontSize) {
		self.addLabel({
			x: x,
			y: y,
			hues: hues,
			text: label,
			fontSize: fontSize
		});
	}

	self.clear = function(){

		while(self.nodes.length>0){
			self.nodes[0].kill();
		}

		while(self.edges.length>0){
			self.edges[0].kill();
		}

		while(self.labels.length>0){
			self.labels[0].kill();
		}
	};



	////////////////////
	// HELPER METHODS //
	////////////////////

	self.getNodeByPoint = function(x,y,buffer){
		var result;
		for(var i=self.nodes.length-1; i>=0; i--){ // top-down
			var node = self.nodes[i];
			if(node.isPointInNode(x,y,buffer)) return node;
		}
		return null;
	};

	self.getEdgeByPoint = function(x, y, wholeArrow){
		// TODO: wholeArrow option?
		var result;
		for(var i=self.edges.length-1; i>=0; i--){ // top-down
			var edge = self.edges[i];
			if(edge.isPointOnLabel(x,y)) return edge;
		}
		return null;
	};

	self.getLabelByPoint = function(x, y){
		var result;
		for(var i=self.labels.length-1; i>=0; i--){ // top-down
			var label = self.labels[i];
			if(label.isPointInLabel(x,y)) return label;
		}
		return null;
	};

	// Click to edit!
	subscribe("mousedown",function(){

		// ONLY WHEN EDITING (and NOT erase)
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool==Loopy.TOOL_ERASE) return;

		// Did you click on a node? If so, edit THAT node.
		var clickedNode = self.getNodeByPoint(Mouse.canvasX, Mouse.canvasY);
		if(clickedNode){
			loopy.sidebar.edit(clickedNode);
			return;
		}

		// Did you click on a label? If so, edit THAT label.
		var clickedLabel = self.getLabelByPoint(Mouse.canvasX, Mouse.canvasY);
		if(clickedLabel){
			loopy.sidebar.edit(clickedLabel);
			return;
		}

		// Did you click on an edge label? If so, edit THAT edge.
		var clickedEdge = self.getEdgeByPoint(Mouse.canvasX, Mouse.canvasY);
		if(clickedEdge){
			loopy.sidebar.edit(clickedEdge);
			return;
		}

		// If the tool LABEL? If so, TRY TO CREATE LABEL.
		if(self.loopy.tool==Loopy.TOOL_LABEL){
			loopy.label.tryMakingLabel();
			return;
		}

		// Otherwise, go to main Edit page.
		loopy.sidebar.showPage("Edit");

	});

	// Centering & Scaling
	self.getBounds = function(){


		// If no nodes & no labels, forget it.
		if(self.nodes.length==0 && self.labels.length==0) return;

		// Get bounds of ALL objects...
		var left = Infinity;
		var top = Infinity;
		var right = -Infinity;
		var bottom = -Infinity;
		var _testObjects = function(objects){
			for(var i=0; i<objects.length; i++){
				var obj = objects[i];
				var bounds = obj.getBoundingBox();
				if(left>bounds.left) left=bounds.left;
				if(top>bounds.top) top=bounds.top;
				if(right<bounds.right) right=bounds.right;
				if(bottom<bounds.bottom) bottom=bounds.bottom;
			}
		};
		_testObjects(self.nodes);
		_testObjects(self.edges);
		_testObjects(self.labels);

		// Return
		return {
			left:left,
			top:top,
			right:right,
			bottom:bottom
		};

	};
	self.center = function(andScale){

		// If no nodes & no labels, forget it.
		if(self.nodes.length==0 && self.labels.length==0) return;

		// Get bounds of ALL objects...
		var bounds = self.getBounds();
		var left = bounds.left;
		var top = bounds.top;
		var right = bounds.right;
		var bottom = bounds.bottom;

		// Re-center!
		var canvasses = document.getElementById("canvasses");
		var fitWidth = canvasses.clientWidth - _PADDING - _PADDING;
		var fitHeight = canvasses.clientHeight - _PADDING_BOTTOM - _PADDING;
		var cx = (left+right)/2;
		var cy = (top+bottom)/2;
		loopy.offsetX = (_PADDING+fitWidth)/2 - cx;
		loopy.offsetY = (_PADDING+fitHeight)/2 - cy;

		// SCALE.
		if(andScale){

			var w = right-left;
			var h = bottom-top;

			// Wider or taller than screen?
			var modelRatio = w/h;
			var screenRatio = fitWidth/fitHeight;
			var scaleRatio;
			if(modelRatio > screenRatio){
				// wider...
				scaleRatio = fitWidth/w;
			}else{
				// taller...
				scaleRatio = fitHeight/h;
			}

			// Loopy, then!
			loopy.offsetScale = scaleRatio;

		}

	};

	Model.getPosOnCanvas = function(x, y) {
		var bounds = canvas.getBoundingClientRect();
		
		var tPos = [(x - bounds.left)*1,
					(y - bounds.top)*1];
	
		var matrix = Model.transformMatrix;
		var mx = tPos[0] - matrix[4]/(2.0*Model.scale);
		var my = tPos[1] - matrix[5]/(2.0*Model.scale);
	  
		return {
			x: mx,
			y: my
		}
	}
}