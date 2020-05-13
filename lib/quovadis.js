"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = quoVadis;
var settings = {
  off: false,
  context: $(window),
  horizontal: false,
  historyLength: 32,
  historyMaxAge: 512,
  thresholdPixels: 64,
  callback: function callback() {
    $('html').removeClass(function (index, className) {
      return (className.match(/(^|\s)scrolling-\S+/g) || []).join(' ');
    }).addClass('scrolling-' + dir);
  },
  event: true,
  fireEvent: function fireEvent() {
    window.dispatchEvent(new CustomEvent('scrollDirectionChange', {
      detail: {
        direction: dir
      }
    }));
  }
};
var $document = $(document);
var $window = settings.context;
var historyLength = settings.historyLength; // Ticks to keep in history.

var historyMaxAge = settings.historyMaxAge; // History data time-to-live (ms).

var thresholdPixels = settings.thresholdPixels; // Ignore moves smaller than this.

var history = Array(historyLength);
var isVer;
var dir = isVer ? 'down' : 'right'; // 'up' or 'down'

var e; // last scroll event

var pivot; // "high-water mark"

var pivotTime = 0;

var tick = function tickFunc() {
  var y = isVer ? $window.scrollTop() : $window.scrollLeft();
  var t = e.timeStamp;
  var furthest = dir === 'down' || dir === 'right' ? Math.max : Math.min; // Apply bounds to handle rubber banding

  var yMax = isVer ? $document.height() - $window.height() : $document.width() - $window.width();
  y = Math.max(0, y);
  y = Math.min(yMax, y); // Update history

  history.unshift({
    y: y,
    t: t
  });
  history.pop(); // Are we continuing in the same direction?

  if (y === furthest(pivot, y)) {
    // Update "high-water mark" for current direction
    pivotTime = t;
    pivot = y;
    return;
  } // else we have backed off high-water mark
  // Apply max age to find current reference point


  var cutoffTime = t - historyMaxAge;

  if (cutoffTime > pivotTime) {
    pivot = y;

    for (var i = 0; i < historyLength; i += 1) {
      if (!history[i] || history[i].t < cutoffTime) break;
      pivot = furthest(pivot, history[i].y);
    }
  } // Have we exceeded threshold?


  if (Math.abs(y - pivot) > thresholdPixels) {
    pivot = y;
    pivotTime = t;

    if (isVer) {
      dir = dir === 'down' ? 'up' : 'down';
    } else {
      dir = dir === 'right' ? 'left' : 'right';
    }

    settings.callback();

    if (settings.event === true) {
      settings.fireEvent();
    }
  }
};

var handler = function handlerFunc(event) {
  e = event;
  window.requestAnimationFrame(tick);
};

function quoVadis(options) {
  settings = $.extend({}, settings, options);
  if (settings.off === true) return $window.off('scroll', handler);
  isVer = !settings.horizontal;
  pivot = isVer ? $window.scrollTop() : $window.scrollLeft();
  settings.callback();
  return $window.on('scroll', handler);
}

var plugin = window.$ || window.jQuery || window.Zepto;

if (plugin) {
  plugin.fn.extend({
    quoVadis: function quoVadisFunct(options) {
      return quoVadis(options);
    }
  });
} else {
  throw Error('scroll-intent requires jQuery or Zepto');
}