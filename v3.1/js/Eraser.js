/**********************************

ERASER

**********************************/

function Eraser(loopy){

	var self = this;
	self.loopy = loopy;

	self.erase = function(clicked){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_ERASE) return;

		// Erase any nodes under here
		if(Mouse.pressed || clicked){
			var eraseNode = loopy.model.getNodeByPoint(Mouse.canvasX, Mouse.canvasY);
			if(eraseNode) {
				eraseNode.kill();
				Audio.play('wipe');
			}
		}

		//test code
		


		// Erase any edges under here
		if(Mouse.pressed || clicked){
			var eraseEdge = loopy.model.getEdgeByPoint(Mouse.canvasX, Mouse.canvasY, true);
			
			if(eraseEdge) {
				eraseEdge.kill();
				Audio.play('wipe');
			}
		}

		// Erase any labels under here
		if(Mouse.pressed || clicked){
			var eraseLabel = loopy.model.getLabelByPoint(Mouse.canvasX, Mouse.canvasY);
			
			if(eraseLabel) {
				eraseLabel.kill();
				Audio.play('wipe');
			}
		}

	};

	subscribe("mousemove",function(){
		self.erase();
		
	});
	subscribe("mouseclick",function(){
		self.erase(true);
		
	});

}