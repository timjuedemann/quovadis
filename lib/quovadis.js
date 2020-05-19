"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Quovadis = /*#__PURE__*/function () {
  function Quovadis() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Quovadis);

    this.opt = Object.assign({}, this.defaults(), opt);
    this.context = this.opt.context;
    this.prefix = this.opt.prefix;
    this.horizontal = this.opt.horizontal;
    this.historyLength = this.opt.historyLength; // Ticks to keep in history.

    this.historyMaxAge = this.opt.historyMaxAge; // History data time-to-live (ms).

    this.thresholdPixels = this.opt.thresholdPixels; // Ignore moves smaller than this.

    this.callback = this.opt.callback;
    this.event = this.opt.event;
    this.history = Array(this.historyLength);
    this.scrollingElement = this.context === document.documentElement ? window : this.context;
    this.isVer = this.horizontal === 'auto' ? !this.getOrientation() : !this.horizontal;
    return this;
  }

  _createClass(Quovadis, [{
    key: "defaults",
    value: function defaults() {
      return {
        prefix: 'scrolling',
        context: document.documentElement,
        horizontal: 'auto',
        historyLength: 32,
        historyMaxAge: 512,
        thresholdPixels: 64,
        callback: function callback() {
          var classes = document.documentElement.classList;

          for (var i = classes.length - 1; i >= 0; i--) {
            if (classes[i].startsWith(this.opt.prefix)) {
              classes.remove(classes[i]);
            }
          }

          classes.add(this.prefix + '-' + this.dir);
        },
        event: true
      };
    }
  }, {
    key: "getOrientation",
    value: function getOrientation() {
      var scr = this.scrollingElement,
          con = this.context,
          el = con === document.documentElement ? this.getLastChild(document.body.lastElementChild) : this.getLastChild(con.lastElementChild),
          scrWidth = scr === con ? scr.clientWidth : window.innerWidth,
          scrHeight = scr === con ? scr.clientHeight : window.innerHeight;

      if (el.getBoundingClientRect().left + con.scrollLeft > scrWidth) {
        return true;
      } else if (el.getBoundingClientRect().top + con.scrollTop > scrHeight) {
        return false;
      }
    }
  }, {
    key: "getLastChild",
    value: function getLastChild(el) {
      if (el.nodeName != 'LINK' && el.nodeName != 'SCRIPT' && el.style.position != 'fixed' && el.style.position != 'absolute' && el.style.position != 'sticky') {
        return el;
      } else {
        return this.getLastChild(el.previousElementSibling);
      }
    }
  }, {
    key: "init",
    value: function init() {
      this.dir = this.isVer ? 'down' : 'right'; // 'up' or 'down'

      this.pivotTime = 0;
      this.pivot = this.isVer ? this.context.scrollTop : this.context.scrollLeft;
      this.callback();
      return this.scrollingElement.addEventListener('scroll', this.handler.bind(this));
    }
  }, {
    key: "stop",
    value: function stop() {
      return this.scrollingElement.removeEventListener('scroll', this.handler.bind(this));
    }
  }, {
    key: "tick",
    value: function tick() {
      var y = this.isVer ? this.context.scrollTop : this.context.scrollLeft;
      var t = this.e.timeStamp;
      var furthest = this.dir === 'down' || this.dir === 'right' ? Math.max : Math.min; // Apply bounds to handle rubber banding

      var yMax = this.isVer ? this.context.scrollHeight - this.context.clientHeight : this.context.scrollWidth - this.context.clientWidth;
      y = Math.max(0, y);
      y = Math.min(yMax, y); // Update history

      this.history.unshift({
        y: y,
        t: t
      });
      this.history.pop(); // Are we continuing in the same direction?

      if (y === furthest(this.pivot, y)) {
        // Update "high-water mark" for current direction
        this.pivotTime = t;
        this.pivot = y;
        return;
      } // else we have backed off high-water mark
      // Apply max age to find current reference point


      var cutoffTime = t - this.historyMaxAge;

      if (cutoffTime > this.pivotTime) {
        this.pivot = y;

        for (var i = 0; i < this.historyLength; i += 1) {
          if (!this.history[i] || this.history[i].t < cutoffTime) break;
          this.pivot = furthest(this.pivot, this.history[i].y);
        }
      } // Have we exceeded threshold?


      if (Math.abs(y - this.pivot) > this.thresholdPixels) {
        console.log('threshold');
        this.pivot = y;
        this.pivotTime = t;

        if (this.isVer) {
          this.dir = this.dir === 'down' ? 'up' : 'down';
        } else {
          this.dir = this.dir === 'right' ? 'left' : 'right';
        }

        this.callback();

        if (this.event === true) {
          this.dispatchEvent();
        }
      }
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent() {
      window.dispatchEvent(new CustomEvent('scrollDirectionChange', {
        detail: {
          direction: this.dir
        }
      }));
    }
  }, {
    key: "handler",
    value: function handler(event) {
      this.e = event;
      window.requestAnimationFrame(this.tick.bind(this));
    }
  }]);

  return Quovadis;
}();

var _default = Quovadis;
exports["default"] = _default;