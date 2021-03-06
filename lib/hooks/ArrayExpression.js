"use strict";

var _tk = require('rocambole-token');
var _limit = require('../limit');


exports.format = function ArrayExpression(node) {
  if (node.elements.length) {
    _limit.around(node.startToken, 'ArrayExpressionOpening');
    _limit.around(node.endToken, 'ArrayExpressionClosing');

    node.elements.forEach(function(el) {
      // sparse arrays have `null` elements
      if (!el) return;

      var prev = _tk.findPrevNonEmpty(el.startToken);
      if (prev.value === ',') {
        _limit.around(prev, 'ArrayExpressionComma');
      }
    });
  } else {
    // empty array should be single line
    _limit.after(node.startToken, 0);
  }
};


exports.getIndentEdges = function(node) {
  var start;
  var prev = node.startToken;

  node.elements.some(function(el, i, els) {
    // sparse arrays have `null` elements! which is very weird
    if (i) {
      var prevEl = els[i - 1];
      prev = prevEl ? prevEl.endToken : _tk.findNextNonEmpty(prev);
    }
    var next = el ? el.startToken : _tk.findNextNonEmpty(prev);

    if (_tk.findInBetween(prev, next, _tk.isBr)) {
      start = prev;
      return true;
    }
  });

  var end = isChainedMemberExpressionArgument(node) ?
    node.endToken.prev :
    node.endToken;

  return start ? {
    startToken: start,
    endToken: end
  } : false;
};


function isChainedMemberExpressionArgument(node) {
  return (
    node.parent &&
    node.parent.type === 'CallExpression' &&
    node.parent.callee.type === 'MemberExpression'
  );
}
