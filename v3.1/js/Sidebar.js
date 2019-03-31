/**********************************
SIDEBAR CODE
**********************************/
function Sidebar(loopy){

	var self = this;
	PageUI.call(self, document.getElementById("sidebar"));
	Sidebar.width = document.getElementById("sidebar").offsetWidth;

	// Edit
	self.edit = function(object){
		self.showPage(object._CLASS_);
		self.currentPage.edit(object);
	};

	// Go back to main when the thing you're editing is killed
	subscribe("kill",function(object){
		if(self.currentPage.target==object){
			self.showPage("Edit");
		}
	});

	////////////////////////////////////////////////////////////////////////////////////////////
	// ACTUAL PAGES ////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////

	// Node!
	(function(){
		var page = new SidebarPage();
		page.addComponent(new ComponentHTML({
			html:
			"<b style='font-size:2.2em'>NetSciDraw</b><br>A tool for thinking in systems<hr/>"
		}));
		page.addComponent("label", new ComponentInput({
			label: "Notes",
			textarea: true,
		}));
		page.addComponent("hue", new ComponentSlider({
			bg: "color",
			label: "Color",
			options: [0,1,2,3,4,5,6],
			oninput: function(value){
				Node.defaultHue = value;
			}
		}));
//		page.addComponent("init", new ComponentSlider({
//			bg: "initial",
//			label: "Start Amount:",
//			options: [0, 0.16, 0.33, 0.50, 0.66, 0.83, 1],
//			//options: [0, 1/6, 2/6, 3/6, 4/6, 5/6, 1],
//			oninput: function(value){
//				Node.defaultValue = value;
//			}
//		}));
		page.onedit = function(){

			// Set color of Slider
//			var node = page.target;
//			var color = Node.COLORS[node.hue];
//			page.getComponent("init").setBGColor(color);

			// Focus on the name field IF IT'S "" or "?"
//			var name = node.label;
//			if(name=="" || name=="?") page.getComponent("label").select();

		};
		page.addComponent(new ComponentButton({
			label: "Increase Size",
			//label: "delete circle",
			onclick: function(node){
				node.width += 10;
				node.height += 10;
			}
		}));

		page.addComponent(new ComponentButton({
			label: "Decrease Size",
			//label: "delete circle",
			onclick: function(node){
				if (node.width > 40) node.width -= 10;
				if (node.height > 40) node.height -= 10;
			}
		}));

		page.addComponent(new ComponentButton({
			label: "Duplicate",
			onclick: function(node){
				var cln = node.cloneNode(true);
				//node.cln();

				self.showPage("Edit");
			}
		}));

		page.addComponent(new ComponentButton({
			//label: "delete edge",
			label: "Delete",
			//label: "delete relationship",
			onclick: function(node){
				node.kill();
				self.showPage("Edit");
			}
		}));

		page.addComponent(new ComponentButton({
			header: true,
			label: "Back to Home",
			onclick: function(){
				self.showPage("Edit");
			}
		}));
		self.addPage("Node", page);
	})();

	// Edge!
	(function(){
		var page = new SidebarPage();
		page.addComponent(new ComponentHTML({
			html:
			"<b style='font-size:2.2em'>NetSciDraw</b><br>A tool for thinking in systems<hr/>"
		}));
		page.addComponent("hues", new ComponentSlider({
			bg: "color",
			label: "Color",
			options: [7,8,9,10,11,12,13],
			oninput: function(value){
				Edge.defaultHues = value;
			}

		}));
		page.addComponent(new ComponentButton({
			header: true,
			label: "Back to Home",
			onclick: function(){
				self.showPage("Edit");
			}
		}));

		page.addComponent(new ComponentButton({
			label: "Increase Size",
			onclick: function(edge){
				edge.thickness = Math.min(16, edge.thickness + 2);
			}
		}));

		page.addComponent(new ComponentButton({
			label: "Decrease Size",
			onclick: function(edge){
				edge.thickness = Math.max(2, edge.thickness - 2);
			}
		}));

		page.addComponent(new ComponentButton({
			//label: "delete edge",
			label: "Delete Arrow",
			//label: "delete relationship",
			onclick: function(edge){
				edge.kill();
				self.showPage("Edit");
			}
		}));

		self.addPage("Edge", page);
	})();

	// Label!
	(function(){
		var page = new SidebarPage();
		page.addComponent(new ComponentHTML({
			html:
			"<b style='font-size:2.2em'>NetSciDraw</b><br>A tool for thinking in systems<hr/>"
		}));
//		page.addComponent(new ComponentButton({
//			header: true,
//			label: "back to top",
//			onclick: function(){
//				self.showPage("Edit");
//			}
//		}));
		page.addComponent("text", new ComponentInput({
			label: "Label",
			//label: "Label:",
			textarea: true
		}));

		page.addComponent("hues", new ComponentSlider({
			bg: "color",
			label: "Color",
			options: [14,15,16,17,18,19,20],
			oninput: function(value){
				Edge.defaultHues = value;
			}
		}));
		
		page.onshow = function(){
			// Focus on the text field
			page.getComponent("text").select();
		};
		page.onhide = function(){
			
			// If you'd just edited it...
			var label = page.target;
			if(!page.target) return;

			// If text is "" or all spaces, DELETE.
			var text = label.text;
			if(/^\s*$/.test(text)){
				// that was all whitespace, KILL.
				page.target = null;
				label.kill();
			}

		};

		page.addComponent(new ComponentButton({
			label: "Increase Size",
			onclick: function(label){
				label.fontSize += 20;
			}
		}));

		page.addComponent(new ComponentButton({
			label: "Decrease Size",
			onclick: function(label){
				label.fontSize = Math.max(20, label.fontSize - 20);
			}
		}));

		page.addComponent(new ComponentButton({
			label: "Duplicate",
			onclick: function(label){
				label.cloneLabel();
			}
		}));

		page.addComponent(new ComponentButton({
			label: "Delete Label",
			onclick: function(label){
				label.kill();
				self.showPage("Edit");
			}
		}));

		page.addComponent(new ComponentButton({
			header: true,
			label: "Back to Home",
			onclick: function(){
				self.showPage("Edit");
			}
		}));
		self.addPage("Label", page);
	})();

	// Edit
	(function(){
		var page = new SidebarPage();
		page.addComponent(new ComponentHTML({
			html: ""+

			"<b style='font-size:2.2em'>NetSciDraw</b><br>A tool for thinking in systems<br><br>"+
			"<img src = '../NSD.png' width='195' height='90' border='0'></img>"+
			"<br>"+
			"<br>"+
			"<hr/>"+ "<br>"+

			"<style>"+
			".button {"+
			  "background-color: #555555;"+
			  "border: none;"+
			  "color: white;"+
			  "padding: 10px 30px;"+
			  "text-align: center;"+
			  "text-decoration: none;"+
			  "display: inline-block;"+
			  "font-size: 16px;"+
			  "margin: 1px 2px;"+
			  "cursor: pointer;"+
			  "width: 68%"+
			"}"+
			".button:hover {"+
  			"background-color: #ddd;"+
  			"color: black;"+
  			"}"+
			"</style>"+
			
			// File open/save dialogs
			"<input id='file_input' type='file' name='name' style='left: -999999; display: none;' accept=\".nsd\">"+

			"<span class='button' onclick='publish(\"modal\",[\"save_work\"])'>Save Project</span> <br><br>"+
			"<span class='button' onclick='loopy.model.pictureBounds(true)'>Save As Image</span> <br><br>"+
			//"<span class='button' onclick='publish(\"modal\",[\"load_work\"]);'>Open Project</span><br><br> "+
			"<span class='button' onclick='FileIO.emptyFileCache(); FileIO.openFile(); loopy.load();'>Open Project</span><br><br> "+
			
			"<span class='button' onclick='loopy.model.pictureBounds(false)'>Recenter</span> <br><br>"+
			//"<span class='button' onclick='publish(\"modal\",[\"load_work\"])'>Open Project</span> <br><br>"+
			"<span class='button' onclick='publish(\"modal\",[\"help_button\"])'>Need Help?</span> <br><br>"+
//			"<span class='mini_button' onclick='publish(\"modal\",[\"embed\"])'>embed in your website</span> <br><br>"+
//			"<span class='mini_button' onclick='publish(\"modal\",[\"save_gif\"])'>make a GIF using LICEcap</span> <br><br>"+
			"<br>"+
			"<style='font-size:1.4em'>Click the pencil icon and use your finger or mouse to draw<br><br>"+
			
			"Type in your drawings to organize your thoughts<br><br>"+
			
			"Use the arrows to connect your thoughts and build your own network<br>"+
			//"<br>"+
			//"<hr/><br>"+
				
			//"NetSciDraw</a> is "+
			//"made by Adam Lindeman, Joe Di Piero, Thomas Mayer, Justin Rowe, Chris Bachman and Jay Heller, with supervision of Hiroki Sayama" +
			"<br>"

			
		}));
		self.addPage("Edit", page);
	})();


	// Ctrl-S to SAVE
	subscribe("key/save",function(){
		if(Key.control){ // Ctrl-S or ⌘-S
			publish("modal",["save_link"]);
		}
	});

}

function SidebarPage(){

	// TODO: be able to focus on next component with an "Enter".

	var self = this;
	self.target = null;

	// DOM
	self.dom = document.createElement("div");
	self.show = function(){ self.dom.style.display="block"; self.onshow(); };
	self.hide = function(){ self.dom.style.display="none"; self.onhide(); };

	// Components
	self.components = [];
	self.componentsByID = {};
	self.addComponent = function(propName, component){

		// One or two args
		if(!component){
			component = propName;
			propName = "";
		}

		component.page = self; // tie to self
		component.propName = propName; // tie to propName
		self.dom.appendChild(component.dom); // add to DOM

		// remember component
		self.components.push(component);
		self.componentsByID[propName] = component;

		// return!
		return component;

	};
	self.getComponent = function(propName){
		return self.componentsByID[propName];
	};

	// Edit
	self.edit = function(object){

		// New target to edit!
		self.target = object;

		// Show each property with its component
		for(var i=0;i<self.components.length;i++){
			self.components[i].show();
		}

		// Callback!
		self.onedit();

	};

	// TO IMPLEMENT: callbacks
	self.onedit = function(){};
	self.onshow = function(){};
	self.onhide = function(){};

	// Start hiding!
	self.hide();

}



/////////////////////////////////////////////////////////////////////////////////////////////
// COMPONENTS ///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

function Component(){
	var self = this;
	self.dom = null;
	self.page = null;
	self.propName = null;
	self.show = function(){
		// TO IMPLEMENT
	};
	self.getValue = function(){
		return self.page.target[self.propName];
	};
	self.setValue = function(value){
		
		// Model's been changed!
		publish("model/changed");

		// Edit the value!
		self.page.target[self.propName] = value;
		self.page.onedit(); // callback!
		
	};
}

function ComponentInput(config){

	// Inherit
	var self = this;
	Component.apply(self);

	// DOM: label + text input
	self.dom = document.createElement("div");
	var label = _createLabel(config.label);
	var className = config.textarea ? "component_textarea" : "component_input";
	var input = _createInput(className, config.textarea);
	input.oninput = function(event){
		self.setValue(input.value);
	};
	self.dom.appendChild(label);
	self.dom.appendChild(input);

	// Show
	self.show = function(){
		input.value = self.getValue();
	};

	// Select
	self.select = function(){
		setTimeout(function(){ input.select(); },10);
	};

}

function ComponentSlider(config){

	// Inherit
	var self = this;
	Component.apply(self);

	// TODO: control with + / -, alt keys??

	// DOM: label + slider
	self.dom = document.createElement("div");
	var label = _createLabel(config.label);
	self.dom.appendChild(label);
	var sliderDOM = document.createElement("div");
	sliderDOM.setAttribute("class","component_slider");
	self.dom.appendChild(sliderDOM);

	// Slider DOM: graphic + pointer
	var slider = new Image();
	slider.draggable = false;
	slider.src = "css/sliders/"+config.bg+".png";
	slider.setAttribute("class","component_slider_graphic");
	var pointer = new Image();
	pointer.draggable = false;
	pointer.src = "css/sliders/slider_pointer.png";
	pointer.setAttribute("class","component_slider_pointer");
	sliderDOM.appendChild(slider);
	sliderDOM.appendChild(pointer);
	var movePointer = function(){
		var value = self.getValue();
		var optionIndex = config.options.indexOf(value);
		var x = (optionIndex+0.5) * (200/config.options.length);
		pointer.style.left = (x-7.5)+"px";
	};

	// On click... (or on drag)
	var isDragging = false;
	var onmousedown = function(event){
		isDragging = true;
		sliderInput(event);
	};
	var onmouseup = function(){
		isDragging = false;
	};
	var onmousemove = function(event){
		if(isDragging) sliderInput(event);
	};
	var sliderInput = function(event){

		// What's the option?
		var index = event.x/200;
		var optionIndex = Math.floor(index*config.options.length);
		var option = config.options[optionIndex];
		if(option===undefined) return;
		self.setValue(option);

		// Callback! (if any)
		if(config.oninput){
			config.oninput(option);
		}

		// Move pointer there.
		movePointer();

	};
	_addMouseEvents(slider, onmousedown, onmousemove, onmouseup);

	// Show
	self.show = function(){
		movePointer();
	};

	// BG Color!
	self.setBGColor = function(color){
		slider.style.background = color;
	};

}

function ComponentButton(config){

	// Inherit
	var self = this;
	Component.apply(self);

	// DOM: just a button
	self.dom = document.createElement("div");
	var button = _createButton(config.label, function(){
		config.onclick(self.page.target);
	});
	self.dom.appendChild(button);

	// Unless it's a HEADER button!
	if(config.header){
		button.setAttribute("header","yes");
	}

}

function ComponentHTML(config){

	// Inherit
	var self = this;
	Component.apply(self);

	// just a div
	self.dom = document.createElement("div");
	self.dom.innerHTML = config.html;

}

function ComponentOutput(config){

	// Inherit
	var self = this;
	Component.apply(self);

	// DOM: just a readonly input that selects all when clicked
	self.dom = _createInput("component_output");
	self.dom.setAttribute("readonly", "true");
	self.dom.onclick = function(){
		self.dom.select();
	};

	// Output the string!
	self.output = function(string){
		self.dom.value = string;
	};

}