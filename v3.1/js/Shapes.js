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
        ctx.arc(0, 0, 2*node.width-2, 0, Math.TAU, false);
    },

    drawText: function(ctx, node) {
        var size = Math.sqrt(4 * (node.width*node.width));
        _boundedText(ctx, node.label, 0, 0, size ,size, 0);
    }
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
            _boundedText(ctx, node.label, 0, 64, node.width*2, node.height*2, 250);
        },
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
        ctx.moveTo(0, -node.height);
        ctx.lineTo(-node.width, node.height/2);
        ctx.lineTo(node.width, -node.height/2);
        ctx.lineTo(-node.width, -node.height/2);
        ctx.lineTo(node.width, node.height/2);
        ctx.closePath();
        
    },

    drawText: function(ctx, node) {
            _boundedText(ctx, node.label, 0, 0, node.width*2, node.height*2, 40);
        },
};