import * as dat from 'dat.gui';

const MAX_BRANCHES = 500_000;

export function randomBetween(low, high) {
    return Math.random() * (high - low) + low;
}

export class Tree {
    /**
     * @arg {Object} props
     * @arg {Object} props.params
     * @arg {()=>void} props.onParamsChange
     * @arg {CanvasRenderingContext2D} props.context
     * @arg {bool} props.withGui
     * */
    constructor({ context, params, onParamsChange, withGui } = {}) {
        this.params = {
            finalLength: 6,
            minLenReduction: 0.7,
            maxLenReduction: 0.9,
            minWeightReduction: 0.6,
            maxWeightReduction: 0.8,
            deltaMin: Math.PI / 4,
            deltaMax: Math.PI / 4,
            color: '#1e1e1e',
            drawWithLines: false,
            ...(params ? params : {}),
        };
        this.onParamsChange = onParamsChange;
        this.count = 0;
        this.context = context;
        if (withGui) {
            this.initDatGui();
        }
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

    /** @arg {[number, number]} trunkStart */
    drawTree(trunkStart) {
        this.params.count = 0;
        let trunkEnd = [trunkStart[0], trunkStart[1] - 30];
        let length = randomBetween(90, 120);
        let weight = randomBetween(20, 35);
        this.context.lineWidth = weight;
        this.context.fillStyle = this.params.color;
        this.context.strokeStyle = this.params.color;
        this.line(trunkStart[0], trunkStart[1], trunkEnd[0], trunkEnd[1]);

        if (this.params.drawWithLines) {
            let branchAngle = Math.PI / 2;
            this.branchLine(trunkEnd, weight, length, branchAngle);
            return;
        }
        const baseStart = {
            x1: trunkEnd[0] - weight / 2,
            y1: trunkEnd[1],
            x2: trunkEnd[0] + weight / 2,
            y2: trunkEnd[1],
        };
        const middlePoint = {
            x: baseStart.x1 + (baseStart.x2 - baseStart.x1) / 2,
            y: baseStart.y1 + (baseStart.y2 - baseStart.y1) / 2,
        };
        this.branchTrapezoid(baseStart, middlePoint, weight, length, Math.PI / 2);
    }

    /** Draw branch as trapezoid to prevent "steps" beetween branches with different widths */
    branchTrapezoid(baseBottom, middlePoint, weight, length, angle) {
        this.count++;
        if (this.count > MAX_BRANCHES) {
            console.log('Too many branches', this.count);
            return;
        }

        // find mid point of trapezoid top base
        const middleEnd = {
            x: middlePoint.x + length * Math.cos(angle),
            y: middlePoint.y - length * Math.sin(angle),
        };

        // Find coordinates of trapezoid's top base which will be bottom base of the next trapezoid.
        // Bases of a trapezoid have 90° angle to the trapezoid's height.
        const half = weight / 2;
        const c = Math.cos(Math.PI / 2 - angle);
        const s = Math.sin(Math.PI / 2 - angle);
        const baseTop = {
            x1: middleEnd.x - half * c,
            y1: middleEnd.y - half * s,
            x2: middleEnd.x + half * c,
            y2: middleEnd.y + half * s,
        };
        this.context.beginPath();
        this.context.moveTo(baseBottom.x1, baseBottom.y1);
        this.context.lineTo(baseTop.x1, baseTop.y1);
        this.context.lineTo(baseTop.x2, baseTop.y2);
        this.context.lineTo(baseBottom.x2, baseBottom.y2);
        this.context.fill();
        this.context.closePath();

        const { angle1, angle2 } = this.calcNextAngles(angle);

        let newWeight = randomBetween(weight * this.params.minWeightReduction, weight * this.params.maxWeightReduction);
        let newLength = randomBetween(length * this.params.minLenReduction, length * this.params.maxLenReduction);

        if (newLength < this.params.finalLength) {
            return;
        }

        this.branchTrapezoid(baseTop, middleEnd, newWeight, newLength, angle1);
        this.branchTrapezoid(baseTop, middleEnd, newWeight, newLength, angle2);
    }

    branchLine(startPoint, weight, length, angle) {
        this.count++;
        if (this.count > MAX_BRANCHES) {
            console.log('Too many branches', this.count);
            return;
        }
        // 𝑥1=𝑥+𝑛cos𝜃
        // 𝑦1=𝑦+𝑛sin𝜃
        let x1 = startPoint[0] + length * Math.cos(angle);
        let y1 = startPoint[1] - length * Math.sin(angle);
        let endpoint = [x1, y1];

        this.context.lineWidth = weight;
        this.line(startPoint[0], startPoint[1], endpoint[0], endpoint[1]);

        const { angle1, angle2 } = this.calcNextAngles(angle);

        let newWeight = randomBetween(weight * this.params.minWeightReduction, weight * this.params.maxWeightReduction);
        let newLength = randomBetween(length * this.params.minLenReduction, length * this.params.maxLenReduction);

        if (newLength < this.params.finalLength) {
            return;
        }

        this.branchLine(endpoint, newWeight, newLength, angle1);
        this.branchLine(endpoint, newWeight, newLength, angle2);
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
