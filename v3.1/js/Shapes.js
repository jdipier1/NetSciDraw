/**
 * @Shapes
 * 
 * Represents a shape, to be used by Node.js
 */

window.Shapes = {};

Shapes.CIRCLE = {
    isPointInside: function(node, px, py) {
        return _isPointInCircle(px, py, node.x, node.y, node.width);
    },

    draw: function(ctx, node) {
        ctx.arc(0, 0, node.width-2, 0, Math.TAU, false);
    },

    drawText: function(ctx, node) {
        var size = Math.sqrt(1.5 * (node.width*node.width));
        _boundedText(ctx, node.label, 0, 0, size ,size, 0);
    },

    id: 0
};

Shapes.TRIANGLE = {
    isPointInside: function(node, px, py) {
        var dx = (node.width/2);
        var dy = (node.height/2);
        var points = [node.x, node.y-dy,
              node.x+dx, node.y+dy,
              node.x-dx, node.y+dy];
        return _isPointInHull(px, py, points);
    },

    draw: function(ctx, node) {
        ctx.beginPath();
        ctx.moveTo(0, -node.height);
        ctx.lineTo(-node.width, node.height);
        ctx.lineTo(node.width, node.height);
        ctx.closePath();
    },

    drawText: function(ctx, node) {
            // TODO: Something that actually fits in the triangle
            _boundedTextTri(ctx, node.label, 0, 64, node.width*2, node.height*2, 250);
        },

        id: 1
};

Shapes.RECTANGLE = {
    isPointInside: function(node, px, py) {
        var dx = (node.width/2);
		var dy = (node.height/2);
        return _isPointInBox(px, py, box={x: node.x-dx, y: node.y-dy, width:dx*2, height:dy*2});
    },

    draw: function(ctx, node) {
        ctx.rect(-node.width, -node.height, node.width*2, node.height*2);
    },

    drawText: function(ctx, node) {
            _boundedText(ctx, node.label, 0, 0, node.width*2, node.height*2, 40);
        },

        id: 2
};

// Todo
Shapes.STAR = {
    isPointInside: function(node, px, py) {
        var dx = (node.width/2);
		var dy = (node.height/2);
        return _isPointInBox(px, py, box={x: node.x-dx, y: node.y-dy, width:dx*2, height:dy*2});
    },

    draw: function(ctx, node) {
        ctx.beginPath();
        // This will work for any rotationally-symmetrical shape
        // Though, could probably be a bit cleaner. Whatev -jay
        var offset = Math.TAU / 10; // number of points * 2
        var start = Math.PI / 2;
        var innerPtRadius = node.width/2;
        ctx.moveTo(0, -node.width);
        for(var i = start + offset; i < Math.TAU; i += offset*2) {
            ctx.lineTo(innerPtRadius*Math.cos(i), innerPtRadius*-Math.sin(i));
            ctx.lineTo(node.width*Math.cos(offset + i), node.width*-Math.sin(offset + i));    
        }
        
        ctx.lineTo(innerPtRadius*Math.cos(start-offset), innerPtRadius*-Math.sin(start-offset));
        ctx.closePath();
        
    },

    drawText: function(ctx, node) {
            _boundedText(ctx, node.label, 0, 0, node.width, node.height, 80);
        },

        id: 3
};

Shapes.SPECIAL_HOUSE = {
    isPointInside: function(node, px, py) {
        var dx = (node.width/2);
		var dy = (node.height/2);
        return _isPointInBox(px, py, box={x: node.x-dx, y: node.y-dy, width:dx*2, height:dy*2});
    },

    draw: function(ctx, node) {
        var dx = node.width/7;
        var smokeOffsetX = (dx*0.6)*Math.sin(((Loopy.timer % 120) / 60) * Math.TAU);
        ctx.save();

        var timer = ((Loopy.timer % 120));
        ctx.globalAlpha = 1.0 - ((timer > 60) ? (timer-60)/60 : 0.0);
        ctx.beginPath();
        ctx.arc(dx*3.5 + (smokeOffsetX), -node.height - timer*2.5, dx/2, 0, Math.TAU, false);
        ctx.stroke();
        ctx.closePath();
        timer = (((Loopy.timer + 60) % 120));
        ctx.globalAlpha = 1.0 - ((timer > 60) ? (timer-60)/60 : 0.0);
        ctx.beginPath();
        ctx.arc(dx*3.5 - (smokeOffsetX), -node.height - timer*2.5, dx/2, 0, Math.TAU, false);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(dx*3, 0);
        ctx.lineTo(dx*3, -node.height);
        ctx.lineTo(dx*4, -node.height);
        ctx.lineTo(dx*4, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -node.height);
        ctx.lineTo(-node.width, 0);
        ctx.lineTo(-node.width/1.2, 0);
        ctx.lineTo(-node.width/1.2, node.height);
        ctx.lineTo(node.width/1.2, node.height);
        ctx.lineTo(node.width/1.2, 0);
        ctx.lineTo(node.width, 0);
        ctx.closePath();
        ctx.stroke();
        
    },

    drawText: function(ctx, node) {
            _boundedText(ctx, node.label, 0, 0, node.width, node.height, 40);
        },

        id: 4
};

Shapes.checkForSpecials = function(newNode, loopy) {
    console.log("specials");
    if (newNode.shape == Shapes.TRIANGLE) {
        var nodeBelow = loopy.model.getNodeByPoint(newNode.x, newNode.y + newNode.height);

        if (nodeBelow && nodeBelow.shape == Shapes.RECTANGLE/* && Math.abs(newNode.bottom - nodeBelow.top) < 5000*/) {
            Shapes.createHouse(nodeBelow, newNode, newNode);
        }
    }
    else if (newNode.shape == Shapes.RECTANGLE) {
        var nodeAbove = loopy.model.getNodeByPoint(newNode.x, newNode.y - newNode.height);
        console.log(nodeAbove);
        if (nodeAbove && nodeAbove.shape == Shapes.TRIANGLE) {
            Shapes.createHouse(newNode, nodeAbove, newNode);
        }
    }
}

Shapes.createHouse = function(rect, tri, parent) {
    var triBounds = tri.getBoundingBox();
    var rectBounds = rect.getBoundingBox();

    var w = Math.max(triBounds.right, rectBounds.right) - Math.min(triBounds.left, rectBounds.left);
    var h = (rectBounds.bottom - triBounds.top);
    var nx = Math.min(triBounds.left, rectBounds.left) + (w / 2.0); 
    var ny = triBounds.top + (h / 2.0);
    
    
    var newNode = loopy.model.addNode({
        x: nx,
        y: ny,
        width: w,
        height: h,
        shape: Shapes.SPECIAL_HOUSE,
        label: parent.label,
        hue: parent.hue,
        textHue: parent.textHue,
    });

    loopy.sidebar.edit(newNode);
    rect.kill();
    tri.kill();
}

Shapes.getShape = function(shape) {

    switch(shape) {
        case '1': return Shapes.TRIANGLE;
        case '2': return Shapes.RECTANGLE;
        case '3': return Shapes.STAR;
        case '4': return Shapes.SPECIAL_HOUSE;
    }

    return Shapes.CIRCLE;
}