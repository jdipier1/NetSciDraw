/**********************************

LOOPY!
- with edit & play mode

**********************************/

Loopy.MODE_EDIT = 0;
Loopy.MODE_PLAY = 1;

Loopy.TOOL_INK = 0;
Loopy.TOOL_DRAG = 1;
Loopy.TOOL_ERASE = 2;
Loopy.TOOL_LABEL = 3;

Loopy.REDRAW_TICK_RATE  = 1000 / 60; 	// 60 ticks per second
Loopy.LOGIC_TICK_RATE	= 1000 / 50;	// 50 ticks per second

Loopy.timer = 0;

function Loopy(config){

	var self = this;
	self.config = config;

	// Loopy: EMBED???
	self.embedded = _getParameterByName("embed");
	self.embedded = !!parseInt(self.embedded); // force to Boolean

	// Offset & Scale?!?!
	self.offsetX = 0;
	self.offsetY = 0;
	self.offsetScale = 1;

	Audio.init();

	// Mouse
	Mouse.init(document.getElementById("canvasses")); // TODO: ugly fix, ew
	
	// Model
	self.model = new Model(self);

	// Loopy: SPEED!
	self.signalSpeed = 3;

	// Sidebar
	self.sidebar = new Sidebar(self);
	self.sidebar.showPage("Edit"); // start here

	// Play/Edit mode
	self.mode = Loopy.MODE_EDIT;

	// Tools
	self.toolbar = new Toolbar(self);
	self.tool = Loopy.TOOL_INK;
	self.ink = new Ink(self);
	self.drag = new Dragger(self);
	self.erase = new Eraser(self);
	self.label = new Labeller(self);

//*******PLAY CONTROL CODE IS FULLY DELETED OUT OF THE PROGRAM******
//	// Play Controls 
//	self.playbar = new PlayControls(self);
//	self.playbar.showPage("Editor"); // start here

	// Modal
	self.modal = new Modal(self);

	//////////
	// INIT //
	//////////

	self.init = function(){
		self.loadFromURL(); // try it.
		Node._UID = 3;
	};

	///////////////////
	// UPDATE & DRAW //
	///////////////////

	// Update
	self.update = function(){
		Loopy.timer++;
		Mouse.update();
		if(self.wobbleControls>=0) self.wobbleControls--; // wobble
		if(!self.modal.isShowing){ // modAl
			self.model.update(); // modEl
		}
	};
	setInterval(self.update, Loopy.LOGIC_TICK_RATE); // 30 Fps? psh. 60
	// Draw
	self.draw = function(){
		if(!self.modal.isShowing){ // modAl
			
			self.model.draw(); // modEl
		}
		//requestAnimationFrame(self.draw);
	};
	setInterval(self.draw, Loopy.REDRAW_TICK_RATE); // 30 Fps? psh. 60

	// TODO: Smarter drawing of Ink, Edges, and Nodes
	// (only Nodes need redrawing often. And only in PLAY mode.)

	//////////////////////
	// PLAY & EDIT MODE //
	//////////////////////

//***CAN BE DELETED***
//	self.showPlayTutorial = false;
//	self.wobbleControls = -1;
//	self.setMode = function(mode){
//
//		self.mode = mode;
//		publish("loopy/mode");
//
//		// Play mode!
//		if(mode==Loopy.MODE_PLAY){
//			self.showPlayTutorial = true; // show once!
//			if(!self.embedded) self.wobbleControls=45; // only if NOT embedded
//			self.sidebar.showPage("Edit");
//			self.playbar.showPage("Player");
//			self.sidebar.dom.setAttribute("mode","play");
//			self.toolbar.dom.setAttribute("mode","play");
//			document.getElementById("canvasses").removeAttribute("cursor"); // TODO: EVENT BASED
//		}else{
//			publish("model/reset");
//		}
//
//		// Edit mode!
//		if(mode==Loopy.MODE_EDIT){
//			self.showPlayTutorial = false; // donezo
//			self.wobbleControls = -1; // donezo
//			self.sidebar.showPage("Edit");
//			self.playbar.showPage("Editor");
//			self.sidebar.dom.setAttribute("mode","edit");
//			self.toolbar.dom.setAttribute("mode","edit");
//			document.getElementById("canvasses").setAttribute("cursor", self.toolbar.currentTool); // TODO: EVENT BASED
//		}
//
//	};
//***DELETE UNTIL***

	/////////////////
	// SAVE & LOAD //
	/////////////////

	self.dirty = false;

	

	// YOU'RE A DIRTY BOY
	subscribe("model/changed", function(){
		if(!self.embedded) self.dirty = true;
	});

	self.save = function(name) {
		FileIO.writeFile(name);

		FileIO.write('nodeNum', self.model.nodes.length);
		FileIO.write('edgeNum', self.model.edges.length);
		FileIO.write('labelNum', self.model.labels.length);

		for(var i = 0; i < self.model.nodes.length; i++) {
			var node = self.model.nodes[i];
			node.newId = i;
			FileIO.write('n'+i, i + ',' + node.x + ',' + node.y + ',' + node.width + ',' + node.height + ',' + node.hue + ',' + node.label + ',' + node.shape.id);
		}

		for(var i = 0; i < self.model.edges.length; i++) {
			var edge = self.model.edges[i];
			FileIO.write('e'+i, edge.from.newId + ',' + edge.to.newId + ',' + edge.hues + ',' + edge.arc + ',' + edge.thickness + ',' + edge.strength + ',' + edge.rotation);
		}

		for(var i = 0; i < self.model.labels.length; i++) {
			var label = self.model.labels[i];
			FileIO.write('l'+i, label.x + ',' + label.y + ',' + label.hues + ',' + label.text + ',' + label.fontSize);
		}

		FileIO.saveFile();
	};

	self.load = function() {
		window.addEventListener('readevent', function(event) {
			var nodeNum = FileIO.read('nodeNum');
			var edgeNum = FileIO.read('edgeNum');
			var labelNum = FileIO.read('labelNum');

			// We don't just create the nodes/edges/labels in the first three loops, just in case the file loaded is malformatted
			// This ensures that we don't wipe away the previous work and load garbage
			var nodes = [];
			var edges = [];
			var labels = [];

			for(var i = 0; i < nodeNum; i++) {
				var data = FileIO.read('n'+i).split(',');
				if (data == "MISSING_DATA") {
					break;
				}
				nodes.push(data);
			}

			if (nodes.length != nodeNum) {
				return;
			}

			for(var i = 0; i < edgeNum; i++) {
				var data = FileIO.read('e'+i).split(',');
				if (data == "MISSING_DATA") {
					break;
				}
				edges.push(data);
			}

			if (edges.length != edgeNum) {
				return;
			}

			for(var i = 0; i < labelNum; i++) {
				var data = FileIO.read('l'+i).split(',');
				if (data == "MISSING_DATA") {
					break;
				}
				labels.push(data);
			}

			if (labels.length != labelNum) {
				return;
			}

			self.model.clear();

			for(var i = 0; i < nodeNum; i++) {
				var data = nodes[i];
				self.model.loadNode(data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7]);
			}

			for(var i = 0; i < edgeNum; i++) {
				var data = edges[i];
				self.model.loadEdge(data[0], data[1], data[2], data[3], data[4], data[5], data[6]);
			}

			for(var i = 0; i < labelNum; i++) {
				var data = labels[i];
				self.model.loadLabel(data[0], data[1], data[2], data[3], data[4]);
			}
			self.reading = false;
		}, false);
	};

	// "BLANK START" DATA:
	var _blankData = "[[[1,405,2,1,%22Net%22,0],[2,405,382,1,%22Draw%2520%22,4],[3,800,200,1,%22Sci%2520%22,2]],[[2,1,94,-1,11],[1,3,140,1,7],[3,2,120,1,9]],[[550,210,%22Welcome%2520to%2520NetSciDraw!%2520Need%2520any%250Aideas%253F%2520how%2520about%253A%250A%250A%25E3%2583%25BBfamily trees%250A%25E3%2583%25BBchemical reactions%250A%25E3%2583%25BBgreatest common factors%250A%25E3%2583%25BBfood chains%250A%25E3%2583%25BBwater cycle%250A%25E3%2583%25BBcritical path method%22]],2%5D";

	self.loadFromURL = function(){
		var data = _getParameterByName("data");
		if(!data) data=decodeURIComponent(_blankData);
		self.model.deserialize(data);
	};


	///////////////////////////
	//////// EMBEDDED? ////////
	///////////////////////////

	self.init();

	if(self.embedded){

		// Hide all that UI
		self.toolbar.dom.style.display = "none";
		self.sidebar.dom.style.display = "none";

		// If *NO UI AT ALL*
		var noUI = !!parseInt(_getParameterByName("no_ui")); // force to Boolean
		if(noUI){
			_PADDING_BOTTOM = _PADDING;
			self.playbar.dom.style.display = "none";
		}

		// Fullscreen canvas
		document.getElementById("canvasses").setAttribute("fullscreen","yes");
		self.playbar.dom.setAttribute("fullscreen","yes");
		publish("resize");

		// Center & SCALE The Model
		self.model.center(true);
		subscribe("resize",function(){
			self.model.center(true);
		});

		// Autoplay!
		self.setMode(Loopy.MODE_PLAY);

		// Also, HACK: auto signal
		var signal = _getParameterByName("signal");
		if(signal){
			signal = JSON.parse(signal);
			var node = self.model.getNode(signal[0]);
			node.takeSignal({
				delta: signal[1]*0.33
			});
		}

	}else{

		// Center all the nodes & labels

		// If no nodes & no labels, forget it.
		if(self.model.nodes.length>0 || self.model.labels.length>0){

			// Get bounds of ALL objects...
			var bounds = self.model.getBounds();
			var left = bounds.left;
			var top = bounds.top;
			var right = bounds.right;
			var bottom = bounds.bottom;

			// Re-center!
			var canvasses = document.getElementById("canvasses");
			var cx = (left+right)/2;
			var cy = (top+bottom)/2;
			var offsetX = (canvasses.clientWidth+50)/2 - cx;
			var offsetY = (canvasses.clientHeight-80)/2 - cy;

			// MOVE ALL NODES
			for(var i=0;i<self.model.nodes.length;i++){
				var node = self.model.nodes[i];
				node.x += offsetX;
				node.y += offsetY;
			}

			// MOVE ALL LABELS
			for(var i=0;i<self.model.labels.length;i++){
				var label = self.model.labels[i];
				label.x += offsetX;
				label.y += offsetY;
			}

		}

}

	// NOT DIRTY, THANKS
	self.dirty = false;

	// SHOW ME, THANKS
	document.body.style.opacity = "";

	// GO.
	//requestAnimationFrame(self.draw);
	self.draw();

}