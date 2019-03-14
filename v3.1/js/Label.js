/**********************************
LABEL!
**********************************/

Label.FONTSIZE = 40;

function Label(model, config){

	var self = this;
	self._CLASS_ = "Label";

	// Mah Parents!
	self.loopy = model.loopy;
	self.model = model;
	self.config = config;

	// Default values...
	_configureProperties(self, config, {
		x: 0,
		y: 0,
		text: "Enter Text Here",
		hues: 20,
		fontSize: Label.FONTSIZE
	});

	// Draw
	var _circleRadius = 0;
	self.draw = function(ctx){

		// Retina
		var x = self.x*2;
		var y = self.y*2;

		// DRAW HIGHLIGHT???
		if(self.loopy.sidebar.currentPage.target == self){
			var bounds = self.getBounds();
			ctx.save();
			//_translate(ctx, 0, 0);
			ctx.scale(2,2); // RETINA
			ctx.beginPath();
			ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
			ctx.fillStyle = HIGHLIGHT_COLOR;
			ctx.fill();
			ctx.restore();
		}

		// Translate!
		ctx.save();
		_translate(ctx, x,y);

		// Text!
		Label.COLORS = {
		14: "#EA3E3E", // red
		15: "#EA9D51", // orange
		16: "#FEEE43", // yellow
		17: "#BFEE3F", // green
		18: "#7FD4FF", // blue
		19: "#A97FFF", // purple
		20: "#000000", // black
	};
		ctx.font = "100 "+self.fontSize+"px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		var colorlabel = Label.COLORS[self.hues];
		ctx.fillStyle = colorlabel;

		// ugh new lines are a PAIN.
		var lines = self.breakText();
		ctx.translate(0, -(self.fontSize*lines.length)/2);
		for(var i=0; i<lines.length; i++){
			var line = lines[i];
			ctx.fillText(line, 0, 0);
			ctx.translate(0, self.fontSize);
		}

		// Restore
		ctx.restore();

	};

	//////////////////////////////////////
	// KILL LABEL /////////////////////////
	//////////////////////////////////////

	self.kill = function(){

		// Remove from parent!
		model.removeLabel(self);

		// Killed!
		publish("kill",[self]);

	};

	// Create a copy of this node
	self.cloneLabel = function() {

		var newLabel = loopy.model.addLabel({
			x: self.x ,
			y: self.y + self.fontSize*2,
			text: self.text,
			hues: self.hues, 		// Copies the color
			fontSize: self.fontSize,
		});

		loopy.sidebar.edit(newLabel);
	}

	//////////////////////////////////////
	// HELPER METHODS ////////////////////
	//////////////////////////////////////

	self.breakText = function(){
		return self.text.split(/\n/);
	};

	self.getBounds = function(){

		var ctx = self.model.context;
		//ctx.restore();

		// Get MAX width...
		var lines = self.breakText();
		var maxWidth = 0;
		for(var i=0; i<lines.length; i++){
			var line = lines[i];
			var w = (ctx.measureText(line).width + 10)*2;
			if(maxWidth<w) maxWidth=w;
		}

		// Dimensions, then:
		var w = maxWidth;
		var h = (self.fontSize*lines.length)/2;

		// Bounds, then:
		return {
			x: self.x-w/2,
			y: self.y-h/2-self.fontSize/2,
			width: w,
			height: h+self.fontSize/2
		};
	};

	self.isPointInLabel = function(x, y){
		return _isPointInBox(x, y, self.getBounds());
	};

	self.getBoundingBox = function(){
		var bounds = self.getBounds();
		return {
			left: bounds.x,
			top: bounds.y,
			right: bounds.x + bounds.width,
			bottom: bounds.y + bounds.height
		};
	};

}