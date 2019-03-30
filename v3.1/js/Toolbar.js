/**********************************

TOOLBAR CODE

**********************************/

function Toolbar(loopy){

	var self = this;

	// Tools & Buttons
	var buttons = [];
	var buttonsByID = {};
	self.dom = document.getElementById("toolbar");
	self.addButton = function(options){

		var id = options.id;
		var tooltip = options.tooltip;
		var callback = options.callback;
		var isSelectable = options.isSelectable;

		// Add the button
		var button = new ToolbarButton(self,{
			id: id,
			icon: "css/icons/"+id+".png",
			tooltip: tooltip,
			callback: callback,
		});
		button.isSelectable = isSelectable	// When set to true, clicking the button will select (highlight) it
		button.dom.setAttribute("isDisabled", "no");
		self.dom.appendChild(button.dom);
		buttons.push(button);
		buttonsByID[id] = button;

		// Keyboard shortcut!
		(function(id){
			subscribe("key/"+id,function(){
				loopy.ink.reset(); // also CLEAR INK CANVAS
				buttonsByID[id].callback();
			});
		})(id);

		return button;
	};

	// Select button
	self.selectButton = function(button) {
		for(var i=0;i<buttons.length;i++) {
			buttons[i].deselect();
		}

		button.select();
	};

	self.disableButtons = function() {
		for(var i=0;i<buttons.length;i++) {
			var button = buttons[i];
			if (button.id == 'zoom_in') {
				button.dom.setAttribute("isDisabled", (Model.targetScale >= 1)?"yes":"no");
			}
	
			if (button.id == 'zoom_out') {
				button.dom.setAttribute("isDisabled", (Model.targetScale <= 0.25)?"yes":"no");
			}
		}
	}

	// Set Tool
	self.currentTool = "ink";
	self.setTool = function(tool){
		self.currentTool = tool;
		var name = "TOOL_"+tool.toUpperCase();
		loopy.tool = Loopy[name];
		document.getElementById("canvasses").setAttribute("cursor",tool);
	};

	// Populate those buttons!
	self.addButton({
		id: "ink",
		tooltip: "PE(N)CIL",
		isSelectable: true,
		callback: function(){
			self.setTool("ink");
		}
	});

	self.addButton({
		id: "label",
		tooltip: "(T)EXT",
		isSelectable: true,
		callback: function(){
			self.setTool("label");
		}
	});

	self.addButton({
		id: "drag",
		tooltip: "MO(V)E",
		isSelectable: true,
		callback: function(){
			self.setTool("drag");
		}
	});

	self.addButton({
		id: "erase",
		tooltip: "(E)RASER",
		isSelectable: true,
		callback: function(){
			self.setTool("erase");
		}
	});

	var zIn = self.addButton({
		id: "zoom_in",
		tooltip: "ZOOM IN",
		isSelectable: false,
		callback: function() {
			Model.targetScale = Math.min(Model.targetScale + 0.25, 1);
			Model.zoomOffset.initialZoom = Model.scale;
		}
	});
	zIn.dom.setAttribute("isDisabled", (Model.targetScale == 1)?"yes":"no");

	var zOut = self.addButton({
		id: "zoom_out",
		tooltip: "ZOOM OUT",
		isSelectable: false,
		callback: function() {
			Model.targetScale = Math.max(Model.targetScale - 0.25, 0.25);
			Model.zoomOffset.initialZoom = Model.scale;
		}
	});
	zOut.dom.setAttribute("isDisabled", (Model.targetScale == 0.25)?"yes":"no");

	// Select button
	buttonsByID.ink.callback();

	// Hide & Show

}

function ToolbarButton(toolbar, config){

	var self = this;
	self.id = config.id;

	// Icon
	self.dom = document.createElement("div");
	self.dom.setAttribute("class", "toolbar_button");
	self.dom.style.backgroundImage = "url('"+config.icon+"')";

	// Tooltip!
	self.dom.setAttribute("data-balloon", config.tooltip);
	self.dom.setAttribute("data-balloon-pos", "above");

	// Selected?
	self.select = function(){
		self.dom.setAttribute("selected", "yes");
		
	};
	self.deselect = function(){
		self.dom.setAttribute("selected", "no");
	};

	// On Click
	self.callback = function(){
		Audio.play('edit');
		
		config.callback();
		if (self.isSelectable) {
			toolbar.selectButton(self);
		}

		toolbar.disableButtons();
	};
	self.dom.onclick = self.callback;

}