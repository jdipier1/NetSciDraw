/**
 * @Shapes
 * 
 * Represents a shape, to be used by Node.js
 */

window.Shapes = {};

Shapes.CIRCLE = {
    isMouseInside: function(node) {
        return _isPointInCircle(Mouse.x, Mouse.y, node.x, node.y, node.width);
    },

    draw: function(ctx, node) {
        ctx.arc(0, 0, 2*node.width-2, 0, Math.TAU, false);
    },

    drawText: function(ctx, node) {
        var size = Math.sqrt(4 * (node.width*node.width));
        _boundedText(ctx, node.label, 0, 0, size ,size, 0);
    }
};

Shapes.RECTANGLE = {
    isMouseInside: function(node) {
        var dx = (node.width/2);
		var dy = (node.height/2);
        return _isPointInBox(Mouse.x, Mouse.y, box={x: node.x-dx, y: node.y-dy, width:dx*2, height:dy*2});
    },

    draw: function(ctx, node) {
        ctx.rect(-node.width, -node.height, node.width*2, node.height*2);
    },

    drawText: function(ctx, node) {
            _boundedText(ctx, node.label, 0, 0, node.width*2, node.height*2, 40);
        },
};