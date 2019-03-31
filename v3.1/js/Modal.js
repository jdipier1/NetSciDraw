/***********************

Use the same PAGE UI thing

************************/

function Modal(loopy){

	var self = this;
	self.loopy = loopy;
	PageUI.call(self, document.getElementById("modal_page"));

	// Is showing?
	self.isShowing = false;

	// show/hide
	self.show = function(){
		document.getElementById("modal_container").setAttribute("show","yes");
		self.isShowing = true;
	};
	self.hide = function(){
		document.getElementById("modal_container").setAttribute("show","no");
		if(self.currentPage.onhide) self.currentPage.onhide();
		self.isShowing = false;
	};

	// Close button
	document.getElementById("modal_bg").onclick = self.hide;
	document.getElementById("modal_close").onclick = self.hide;

	// Show... what page?
	subscribe("modal", function(pageName){

		self.show();
		var page = self.showPage(pageName);

		// Do something
		if(page.onshow) page.onshow();

		// Dimensions
		var dom = document.getElementById("modal");
		dom.style.width = self.currentPage.width+"px";
		dom.style.height = self.currentPage.height+"px";

	});

	///////////////////
	// PAGES! /////////
	///////////////////

/*
// Save as link
	(function(){
		var page = new Page();
		page.width = 500;
		page.height = 225;
		page.addComponent(new ComponentHTML({
			html: "copy your link:"
		}));
		var output = page.addComponent(new ComponentOutput({}));

		var button = document.createElement("BUTTON");
		//button.style = "float: right;"
		var t = document.createTextNode("Copy to Clipboard");
		button.appendChild(t);
		button.addEventListener("click", function() {
			output.select();
			document.execCommand("copy");
			alert("Link copied to clipboard!");
		});

		page.dom.appendChild(button);

		var label = document.createElement("div");
		label.style.textAlign = "right";
		label.style.fontSize = "14px";
		label.style.marginTop = "6px";
		label.style.color = "#888";
		label.innerHTML = "<br>(this is a long URL, so you may want to use a link-shortener like <a target='_blank' href='https://bitly.com/'>bit.ly</a>)";
		page.dom.appendChild(label);

		// chars left...
		var chars = document.createElement("div");
		chars.style.textAlign = "right";
		chars.style.fontSize = "13px";
		chars.style.marginTop = "3px";
		chars.style.color = "#888";
		chars.innerHTML = "X out of 2048 characters";
		page.dom.appendChild(chars);
			

		page.onshow = function(){

			// Copy-able link
			//var link = loopy.saveToURL();
		
			output.output(link);
			output.dom.select();

			// Chars left
			var html = 1+" / 2048 characters";
			if(1>2048){
				html += " - MAY BE TOO LONG FOR MOST BROWSERS";
			}
			chars.innerHTML = html;
			chars.style.fontWeight = (1>2048) ? "bold" : "100";
			chars.style.fontSize = (1>2048) ? "14px" : "15px";

		};

		// or, tweet it
		self.addPage("save_link", page);
	})();

*/
	
	// Save
	(function(){
		var page = new Page();
		page.width = 500;
		page.height = 125;
		page.addComponent(new ComponentHTML({
			html: "Name your project:<br>"
		}));

		var input = document.createElement("INPUT"); 
		input.type = "text";
		
		page.dom.appendChild(input);

		var button = document.createElement("BUTTON");

		page.onshow = function(e) {
			input.value = "my_nsd_project"
			button.disabled = false;
		}

		// eugh
		input.onkeydown = function(event) {
			button.disabled = (input.value == "");
		}
		input.oninput = function(event) {
			button.disabled = (input.value == "");
		}
		input.onpaste = function(event) {
			button.disabled = (input.value == "");
		}

		var t = document.createTextNode("Save Project");
		button.appendChild(t);
		button.addEventListener("click", function() {
			loopy.save(input.value);
		});
		page.dom.appendChild(button);

		self.addPage("save_work", page);
		
	})();

	// Save to image
	(function(){
		var page = new Page();
		page.width = 500;
		page.height = 125;
		page.addComponent(new ComponentHTML({
			html: "Save as image:<br>"
		}));

		var input = document.createElement("INPUT"); 
		input.type = "text";
		page.dom.appendChild(input);

		var button = document.createElement("BUTTON");

		page.onshow = function(e) {
			input.value = "my_nsd_image"
			button.disabled = false;
		}

		// eugh
		input.onkeydown = function(event) {
			button.disabled = (input.value == "");
		}
		input.oninput = function(event) {
			button.disabled = (input.value == "");
		}
		input.onpaste = function(event) {
			button.disabled = (input.value == "");
		}

		var t = document.createTextNode("Save Project");
		button.appendChild(t);
		button.addEventListener("click", function() {
			FileIO.saveCanvas(input.value);
		});
		page.dom.appendChild(button);

		self.addPage("save_img", page);
		
	})();

	// Help
	(function(){
		var page = new Page();
		page.width = 800;
		page.height = 600;
		page.addComponent(new ComponentHTML({
			html: ""+
			"Here's a short clip to get you started!<br><br>"+
			"<video width='760' height='450' loop controls>"+
			"<source src='../tutorial.mp4' type='video/mp4'>"+
			"</video>"
		
		}));

		
		page.onshow = function(){

			//STUFF NEEDS TO GO HERE TO GET THIS TO WORK
			
		};

		self.addPage("help_button", page);
	})();

}



function ModalIframe(config){

	var self = this;

	// IFRAME
	var iframe = document.createElement("iframe");
	self.dom = iframe;
	iframe.width = config.width;
	iframe.height = config.height;

	// Show & Hide
	if(!config.manual){
		config.page.onshow = function(){
			iframe.src = config.src;
		};
		config.page.onhide = function(){
			iframe.removeAttribute("src");
		};
	}

}

