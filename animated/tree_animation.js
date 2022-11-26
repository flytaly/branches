import * as dat from 'dat.gui';

/** @typedef {{x1:number, y1:number, x2:number, y2:number, xMid:number, yMid:number}} BaseCoords */

/**
 * @typedef {Object} BranchSplit
 * @property {BaseCoords} BranchSplit.coords
 * @property {number} BranchSplit.length
 * @property {number} BranchSplit.width
 * @property {number} BranchSplit.angle
 */

export function randomBetween(low, high) {
    return Math.random() * (high - low) + low;
}

export class LinkedNode {
    /**
     *  @arg {Object} props
     *  @arg {LinkedNode} props.next
     *  @arg {LinkedNode} props.prev
     *  @arg {BranchSplit} props.data
     * */
    constructor({ prev = null, next = null, data } = {}) {
        this.next = next;
        this.data = data;
        if (!prev) return;
        if (!next) {
            this.next = prev.next;
        }
        prev.next = this;
    }
}

export class Tree {
    /**
     * @arg {Object} props
     * @arg {Object} props.params
     * @arg {()=>void} props.onParamsChange
     * @arg {CanvasRenderingContext2D} props.context
     * @arg {bool} props.withGui
     * @arg {[number, number]} props.startPoint
     * */
    constructor({ context, params, onParamsChange, withGui, startPoint } = {}) {
        this.params = {
            finalLength: 5,
            minLenReduction: 0.7,
            maxLenReduction: 0.9,
            minWeightReduction: 0.6,
            maxWeightReduction: 0.8,
            deltaMin: Math.PI / 4,
            deltaMax: Math.PI / 4,
            color: '#1e1e1e',
            ...(params ? params : {}),
        };
        this.onParamsChange = onParamsChange;
        this.count = 0;
        this.context = context;
        if (withGui) {
            this.initDatGui();
        }

        /** @type LinkedNode  */
        this.first = null;
        /** @type LinkedNode  */
        this.last = null;
        this.setStartPoint(startPoint);
    }

    /** @arg {[number, number]} startPoint */
    setStartPoint(startPoint) {
        this.params.count = 0;
        let width = randomBetween(20, 35);
        const base = {
            x1: startPoint[0] - width / 2,
            y1: startPoint[1],
            x2: startPoint[0] + width / 2,
            y2: startPoint[1],
        };
        const node = {
            // Trunk
            angle: Math.PI / 2,
            length: randomBetween(90, 120),
            width,
            coords: {
                xMid: base.x1 + (base.x2 - base.x1) / 2,
                yMid: base.y1 + (base.y2 - base.y1) / 2,
                ...base,
            },
        };
        this.first = new LinkedNode({ data: node });
        this.last = this.first;
    }

    line(x0, y0, x1, y1) {
        this.context.beginPath();
        this.context.moveTo(x0, y0);
        this.context.lineTo(x1, y1);
        this.context.stroke();
    }

    initDatGui() {
        this.gui = new dat.GUI();
        this.gui.add(this.params, 'finalLength', 3, 40).onFinishChange(this.onParamsChange);
        this.gui.add(this.params, 'minLenReduction', 0.3, 0.9).onFinishChange(this.onParamsChange);
        this.gui.add(this.params, 'maxLenReduction', 0.3, 0.95).onFinishChange(this.onParamsChange);
        this.gui.add(this.params, 'minWeightReduction', 0.2, 1.0).onFinishChange(this.onParamsChange);
        this.gui.add(this.params, 'drawWithLines').onFinishChange(this.onParamsChange);
        this.gui.addColor(this.params, 'color').onFinishChange(this.onParamsChange);
    }

    drawNext() {
        let drawnLength = 0;
        while (drawnLength < 100) {
            if (!this.first) {
                return false;
            }

            const split = this.first.data;
            drawnLength += split.length;
            this.branch(split);
            this.first = this.first.next;
        }
        return true;
    }

    /** @arg {BranchSplit} split */
    branch(split) {
        this.context.lineWidth = split.width;
        this.context.fillStyle = this.params.color;
        this.context.strokeStyle = this.params.color;
        const coords = this.trapezoid(split);

        const { angle1, angle2 } = this.calcNextAngles(split.angle);

        let width = randomBetween(
            split.width * this.params.minWeightReduction,
            split.width * this.params.maxWeightReduction,
        );
        let length = randomBetween(
            split.length * this.params.minLenReduction,
            split.length * this.params.maxLenReduction,
        );

        if (length < this.params.finalLength) {
            return;
        }

        const split1 = { length, width, coords, angle: angle1 };
        const split2 = { length, width, coords, angle: angle2 };

        if (Math.random() > 0.7) {
            const n1 = new LinkedNode({ data: split1, prev: this.last });
            this.last = new LinkedNode({ data: split2, prev: n1 });
        } else {
            const n1 = new LinkedNode({ data: split1, prev: this.first });
            const n2 = new LinkedNode({ data: split2, prev: n1 });
            if (this.first == this.last) {
                this.last = n2;
            }
        }
    }

    /**
     * @arg {BranchSplit} split
     * @returns {BaseCoords} coords
     * */
    trapezoid({ coords, width, length, angle }) {
        // find mid point of trapezoid top base
        const middleEnd = {
            xMid: coords.xMid + length * Math.cos(angle),
            yMid: coords.yMid - length * Math.sin(angle),
        };

        // Find coordinates of trapezoid's top base which will be bottom base of the next trapezoid.
        // Bases of a trapezoid have 90° angle to the trapezoid's height.
        const half = width / 2;
        const c = Math.cos(Math.PI / 2 - angle);
        const s = Math.sin(Math.PI / 2 - angle);
        const baseTop = {
            x1: middleEnd.xMid - half * c,
            y1: middleEnd.yMid - half * s,
            x2: middleEnd.xMid + half * c,
            y2: middleEnd.yMid + half * s,
        };
        this.context.beginPath();
        this.context.moveTo(coords.x1, coords.y1);
        this.context.lineTo(baseTop.x1, baseTop.y1);
        this.context.lineTo(baseTop.x2, baseTop.y2);
        this.context.lineTo(coords.x2, coords.y2);
        this.context.fill();
        this.context.closePath();

        return { ...baseTop, ...middleEnd };
    }

    calcNextAngles(angle) {
        let angleMax = angle + this.params.deltaMax;
        let angleMin = angle - this.params.deltaMin;
        let angleDiff = randomBetween(0, angleMax - angleMin - Math.PI / 16);
        let angle1 = angleMax - angleDiff / 2;
        let angle2 = angleMin + angleDiff / 2;
        return { angle1, angle2 };
    }
}
