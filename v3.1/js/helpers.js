/*****************************

A miscellaneous collection of reuseable helper methods
that I couldn't be arsed to put into separate classes

*****************************/

Math.TAU = Math.PI*2;

window.HIGHLIGHT_COLOR = "rgba(193, 220, 255, 0.6)";

var isMacLike = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)?true:false;

var _PADDING = 25;
var _PADDING_BOTTOM = 110;

window.onresize = function(){
	publish("resize");
};

window.onbeforeunload = function(e) {
	if(loopy.dirty){
		var dialogText = "Are you sure you want to leave without saving your changes?";
		e.returnValue = dialogText;
		return dialogText;
	}
};

function _createCanvas(){

	var canvasses = document.getElementById("canvasses");
	var canvas = document.createElement("canvas");

	// Dimensions
	var _onResize = function(){
		var width = canvasses.clientWidth*Model.scale;
		var height = canvasses.clientHeight*Model.scale;
		canvas.width = width*2; // retina
		canvas.style.width = width+"px";
		canvas.height = height*2; // retina
		canvas.style.height = height+"px";
	};
	_onResize();

	// Add to body!
	canvasses.appendChild(canvas);

	// subscribe to RESIZE
	subscribe("resize",function(){
		_onResize();
	});

	// Gimme
	return canvas;

}

function _createLabel(message){
	var label = document.createElement("div");
	label.innerHTML = message;
	label.setAttribute("class","component_label");
	return label;
}

function _createButton(label, onclick){
	var button = document.createElement("div");
	button.innerHTML = label;
	button.onclick = onclick;
	button.setAttribute("class","component_button");
	return button;
}

function _createInput(className, textarea){
	var input = textarea ? document.createElement("textarea") : document.createElement("input");
	input.setAttribute("class",className);
	input.addEventListener("keydown",function(event){
		event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
	},false); // STOP IT FROM TRIGGERING KEY.js
	return input;
}

function _createNumberInput(onUpdate){

	var self = {};

	// dom!
	self.dom = document.createElement("input");
	self.dom.style.border = "none";
	self.dom.style.width = "40px";
	self.dom.style.padding = "5px";

	self.dom.addEventListener("keydown",function(event){
		event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
	},false); // STOP IT FROM TRIGGERING KEY.js

	// on update
	self.dom.onchange = function(){
		var value = parseInt(self.getValue());
		if(isNaN(value)) value=0;
		self.setValue(value);
		onUpdate(value);
	};

	// select on click, yo
	self.dom.onclick = function(){
		self.dom.select();
	};

	// set & get value
	self.getValue = function(){
		return self.dom.value;
	};
	self.setValue = function(num){
		self.dom.value = num;
	};

	// return an OBJECT.
	return self;

}

function _getTotalOffset(target){
	var bounds = target.getBoundingClientRect();
	return {
		left: bounds.left,
		top: bounds.top
	};
}

function _addMouseEvents(target, onmousedown, onmousemove, onmouseup){

	// WRAP THEM CALLBACKS
	var _onmousedown = function(event){
		var _fakeEvent = _onmousemove(event);
		onmousedown(_fakeEvent);
	};
	var _onmousemove = function(event){
		
		// Mouse position
		var _fakeEvent = {};
		if(event.changedTouches){
			// Touch
			var offset = _getTotalOffset(target);
			_fakeEvent.x = event.changedTouches[0].clientX - offset.left;
			_fakeEvent.y = event.changedTouches[0].clientY - offset.top;
			event.preventDefault();

			if (Mouse.pinching && event.touches.length === 2) {
				Mouse.onPinchMove(event);
			} else if (!Mouse.pinching && event.touches.length === 2) {
				Mouse.pinching = true;
			} else if (Mouse.pinching) {
				Mouse.onPinchEnd(event);
			}

			if (event.touches.length != 1) 
				return;
		}else{
			// Not Touch
			_fakeEvent.x = event.offsetX;
			_fakeEvent.y = event.offsetY;
		}

		// Mousemove callback
		onmousemove(_fakeEvent);
		return _fakeEvent;

	};
	var _onmouseup = function(event){
		var _fakeEvent = {};
		onmouseup(_fakeEvent);
	};

	// Add events!
	target.addEventListener("mousedown", _onmousedown);
	target.addEventListener("mousemove", _onmousemove);
	document.body.addEventListener("mouseup", _onmouseup);

	// TOUCH.
	var _ontouchstart = function(event) {
		if (event.touches.length === 1) {
			_onmousedown(event);
		}
	}

	var _ontouchend = function(event) {
		if (Mouse.pinching) {
			Mouse.onPinchEnd(event);
			Mouse.pinching = false;
			_onmouseup(event);
		}
		
		_onmouseup(event);
	}
	
	target.addEventListener("touchstart",_ontouchstart,false);
	target.addEventListener("touchmove",_onmousemove,false);
	document.body.addEventListener("touchend",_ontouchend,false);

}

function _getBounds(points){

	// Bounds
	var left=Infinity, top=Infinity, right=-Infinity, bottom=-Infinity;
	for(var i=0;i<points.length;i++){
		var point = points[i];
		if(point[0]<left) left=point[0];
		if(right<point[0]) right=point[0];
		if(point[1]<top) top=point[1];
		if(bottom<point[1]) bottom=point[1];
	}

	// Dimensions
	var width = (right-left);
	var height = (bottom-top);

	// Gimme
	return {
		left:left, right:right, top:top, bottom:bottom,
		width:width, height:height
	};
	
}

function _translatePoints(points, dx, dy){
	points = JSON.parse(JSON.stringify(points));
	for(var i=0;i<points.length;i++){
		var p = points[i];
		p[0] += dx;
		p[1] += dy;
	}
	return points;
}

function _rotatePoints(points, angle){
	points = JSON.parse(JSON.stringify(points));
	for(var i=0;i<points.length;i++){
		var p = points[i];
		var x = p[0];
		var y = p[1];
		p[0] = x*Math.cos(angle) - y*Math.sin(angle);
		p[1] = y*Math.cos(angle) + x*Math.sin(angle);
	}
	return points;
}

function _configureProperties(self, config, properties){

	for(var propName in properties){

		// Default values!
		if(config[propName]===undefined){
			var value = properties[propName];
			if(typeof value=="function") value=value();
			config[propName] = value;
		}

		// Transfer to "self".
		self[propName] = config[propName];

	}

}

function _isPointInCircle(x, y, cx, cy, radius){
	
	// Point distance
	var dx = (cx)-x;
	var dy = (cy)-y;
	var dist2 = dx*dx + dy*dy;

	// My radius
	var r2 = radius*radius * Model.scale*Model.scale;

	// Inside?
	return dist2<=r2;

}

function _isPointInBox(x, y, box){
	/*
	return (x >= (box.x)
		&&  x <= (box.x+box.width)
		&&  y >= (box.y*Model.scale)
		&&  y <= (box.y+box.height));*/

		return (x >= box.x
		&&  x <= (box.x+box.width)
		&&  y >= (box.y*Model.scale)
		&&  y <= (box.y+box.height));
}

// TODO: Make more use of this???
function _makeErrorFunc(msg){
	return function(){
		throw Error(msg);
	};
}

function _getParameterByName(name){
	var url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
};


function _blendColors(hex1, hex2, blend){
	
	var color = "#";
	for(var i=0; i<3; i++) {
		
		// Into numbers...
		var sub1 = hex1.substring(1+2*i, 3+2*i);
		var sub2 = hex2.substring(1+2*i, 3+2*i);
		var num1 = parseInt(sub1, 16);
		var num2 = parseInt(sub2, 16);

		// Blended number & sub
		var num = Math.floor( num1*(1-blend) + num2*blend );
		var sub = num.toString(16).toUpperCase();
		var paddedSub = ('0'+sub).slice(-2); // in case it's only one digit long

		// Add that babe
		color += paddedSub;

	}

	return color;

}

function _shiftArray(array, shiftIndex){
	var moveThisAround = array.splice(-shiftIndex);
	var shifted = moveThisAround.concat(array);
	return shifted;
}

// TODO: Remove _translate, _toRelX, _toRelY, _fromRelX, and _fromRelY. They're not needed
function _translate(ctx, x, y) {
	//ctx.translate(Model.canvasCenterX, Model.canvasCenterY);
	//ctx.scale(Model.scale, Model.scale);
	//ctx.translate(x + Model.x, y + Model.y);
	ctx.translate(x,y);
}

function _toRelX(x) {
	return x;//Model.contextCenterX + ((x - Model.contextCenterX)*Model.scale);
}

function _toRelY(y) {
	return y;//Model.contextCenterY + ((y - Model.contextCenterY)*Model.scale);
}

function _fromRelX(x) {
	var left = (Model.contextCenterX - (Model.contextCenterX*Model.scale));
	return x;//((x-left)/Model.scale);//(x*(Model.scale/2))-(left*Model.scale);
	//
	//var dx = ((x-Model.contextCenterX));
	//return Model.contextCenterX + dx;
	//var offset = (Model.contextCenterX*Model.scale)/Model.contextCenterX;
	//return Model.contextCenterX + ((x - Model.contextCenterX)*Model.scale);
}

function _fromRelY(y) {
	var top = (Model.contextCenterY - (Model.contextCenterY*Model.scale));
	return y;//((y-top)/Model.scale);
}

/**
 * Draws a string at x,y bounded by a width and height value
 * 
 * @param {} ctx the canvas
 * @param {*} str the string to draw
 * @param {*} x the x position
 * @param {*} y the y position
 * @param {*} width the width that the string should not exceed
 * @param {*} height the height that the string should not exceed
 * @param {*} padding padding between the text and the bounded borders
 */
function _boundedText(ctx, str, x, y, width, height, padding) {
	var w = 0;
	var numBreaks = 0;
	var hApprox = 30; // Approximate height
	var strNew = "";
	var strings = [];
	var yOffset = 0;

	for(var i = 0; i < str.length; i++) {
		if (w+20 > width-padding) {
			if ((hApprox * numBreaks) + (hApprox) > height-padding) {
				var targetLen = ctx.measureText("...").width;
				var numCharsToRemove = 1;
				while(true) {
					if (strNew.length < numCharsToRemove) {
						numCharsToRemove = 0
						break;
					}

					var chop = ctx.measureText(strNew.substring(0, strNew.length-numCharsToRemove)).width;
					if (chop >= targetLen) {
						break;
					}

					numCharsToRemove++;
				}
				strNew = strNew.substring(0, strNew.length-numCharsToRemove);
				strNew += "...";
				break;
			}

			strings.push(strNew);

			numBreaks++;
			strNew = "";
			yOffset -= hApprox/2;
		}

		strNew += str.charAt(i);
		w = ctx.measureText(strNew).width;
	}

	for(var i = 0; i < strings.length; i++) {
		ctx.fillText(strings[i], x, (y-((i+1)*hApprox))-yOffset);
	}
	ctx.fillText(strNew, x, y-yOffset);
}

function _boundedTextTri(ctx, str, x, y, width, height, padding) {
	var w = 0;
	var numBreaks = 0;
	var hApprox = 30; // Approximate height
	var strNew = "";
	var strings = [];
	var yOffset = 0;

	for(var i = 0; i < str.length; i++) {
		var increase = (width/2) + ((numBreaks+5)*((width/height)*hApprox));

		if (w+550 > increase+padding) {
			if ((hApprox * numBreaks) + (hApprox) > height-padding) {
				var targetLen = ctx.measureText("...").width;
				var numCharsToRemove = 1;
				while(true) {
					if (strNew.length < numCharsToRemove) {
						numCharsToRemove = 0
						break;
					}

					var chop = ctx.measureText(strNew.substring(0, strNew.length-numCharsToRemove)).width;
					if (chop >= targetLen) {
						break;
					}

					numCharsToRemove++;
				}
				strNew = strNew.substring(0, strNew.length-numCharsToRemove);
				strNew += "...";
				break;
			}

			strings.push(strNew);

			numBreaks++;
			strNew = "";
			yOffset += hApprox/2;
		}

		strNew += str.charAt(i);
		w = ctx.measureText(strNew).width;
	}

	for(var i = 0; i < strings.length; i++) {
		ctx.fillText(strings[i], x, (y+(i*hApprox))-yOffset);
	}
	ctx.fillText(strNew, x, y+(strings.length*hApprox)-yOffset);
}