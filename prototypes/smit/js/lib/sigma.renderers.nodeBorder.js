;(function(undefined) {

  /**
   * Sigma Node Border Custom Renderer
   * ==================================
   *
   * The aim of this simple node renderer is to enable the user to display
   * colored node borders.
   *
   * Author: Guillaume Plique (Yomguithereal)
   * Version: 0.0.1
   */

  sigma.canvas.nodes.border = function(node, context, settings) {
    var prefix = settings('prefix') || '';

    context.fillStyle = node.color || settings('defaultNodeColor');
    context.beginPath();
    context.arc(
     node[prefix + 'x'],
     node[prefix + 'y'],
     node[prefix + 'size'],
     0,
     Math.PI * 2,
     true
    );

    context.closePath();
    context.fill();

    context.lineWidth = node.borderWidth || 1;
    context.strokeStyle = node.borderColor || '#fff';
    context.stroke();
  };
}).call(this);
