class Quovadis {
    constructor(opt = {}) {
        this.opt = Object.assign({}, this.defaults(), opt);
        this.context = this.opt.context;
        this.prefix = this.opt.prefix;
        this.horizontal = this.opt.horizontal;
        this.isVer = !this.horizontal;
        this.historyLength = this.opt.historyLength; // Ticks to keep in history.
        this.historyMaxAge = this.opt.historyMaxAge; // History data time-to-live (ms).
        this.thresholdPixels = this.opt.thresholdPixels; // Ignore moves smaller than this.
        this.callback = this.opt.callback;
        this.event = this.opt.event;
        this.history = Array(this.historyLength);
        this.scrollingElement = this.context === document.documentElement ? window : this.context;
        return this;
    }

    defaults() {
        return {
            prefix: 'scrolling',
            context: document.documentElement,
            horizontal: false,
            historyLength: 32,
            historyMaxAge: 512,
            thresholdPixels: 64,
            callback: function() {
                console.log(this);
                let classes = document.documentElement.classList;
                for (var i = classes.length - 1; i >= 0; i--) {
                    if (classes[i].startsWith(this.opt.prefix)) {
                        classes.remove(classes[i]);
                    }
                }
                classes.add(this.prefix + '-' + this.dir);
            },
            event: true,
        }
    }

    init() {
        this.dir = this.isVer ? 'down' : 'right'; // 'up' or 'down'
        this.pivotTime = 0;
        this.pivot = this.isVer ? this.context.scrollTop : this.context.scrollLeft;
        this.callback();
        return this.scrollingElement.addEventListener('scroll', this.handler.bind(this));
    }

    stop() {
        return this.scrollingElement.removeEventListener('scroll', this.handler.bind(this));
    }

    tick() {
        let y = this.isVer ? this.context.scrollTop : this.context.scrollLeft;
        const t = this.e.timeStamp;
        const furthest = this.dir === 'down' || this.dir === 'right' ? Math.max : Math.min;

        // Apply bounds to handle rubber banding
        const yMax = this.isVer ? this.context.scrollHeight - this.context.clientHeight : this.context.scrollWidth - this.context.clientWidth;
        y = Math.max(0, y);
        y = Math.min(yMax, y);

        // Update history
        this.history.unshift({ y, t });
        this.history.pop();

        // Are we continuing in the same direction?
        if (y === furthest(this.pivot, y)) {
            // Update "high-water mark" for current direction
            this.pivotTime = t;
            this.pivot = y;
            return;
        }
        // else we have backed off high-water mark

        // Apply max age to find current reference point
        const cutoffTime = t - this.historyMaxAge;
        if (cutoffTime > this.pivotTime) {
            this.pivot = y;
            for (let i = 0; i < this.historyLength; i += 1) {
                if (!this.history[i] || this.history[i].t < cutoffTime) break;
                this.pivot = furthest(this.pivot, this.history[i].y);
            }
        }

        // Have we exceeded threshold?
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
                this.dispatchEvent()
            }
        }
    }

    dispatchEvent() {
        window.dispatchEvent(new CustomEvent('scrollDirectionChange', {
            detail: {
                direction: this.dir
            }
        }));
    }

    handler(event) {
        this.e = event;
        window.requestAnimationFrame(this.tick.bind(this));
    }
}

export default Quovadis