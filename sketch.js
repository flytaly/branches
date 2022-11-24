/*
 * Based on
 * https://justinpoliachik.com/posts/2021-09-13-generativetrees01/ */

import canvasSketch from 'canvas-sketch';
import * as dat from 'dat.gui';
import debounce from 'lodash.debounce';

const gui = new dat.GUI();

const _params = {
    finalLength: 10,
    minLenReduction: 0.7,
    maxLenReduction: 0.9,
    minWeightReduction: 0.6,
    maxWeightReduction: 0.8,
};

// dcanvas-sketch manager
let manager;

const renderDebounced = debounce(async () => {
    if (!manager) return;
    (await manager).render();
}, 300);

const params = new Proxy(_params, {
    get: function (target, prop) {
        return Reflect.get(target, prop);
    },
    set: function (target, prop, value) {
        renderDebounced();
        return Reflect.set(target, prop, value);
    },
});

gui.add(params, 'finalLength', 3, 40);
gui.add(params, 'minLenReduction', 0.3, 0.9);
gui.add(params, 'maxLenReduction', 0.3, 0.95);
gui.add(params, 'minWeightReduction', 0.2, 1.0);
gui.add(params, 'maxWeightReduction', 0.2, 1.0);

const settings = {
    dimensions: [1024, 1024],
    animate: false,
    duration: 3, // Set loop duration to 3 seconds
    fps: 30, // Optionally specify an export frame rate, defaults to 30
};

/**
 * @param {Object} opts
 * @param {CanvasRenderingContext2D} opts.context
 */
const sketch = ({ context, width, height }) => {
    let count = 0;
    function line(x0, y0, x1, y1) {
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.stroke();
    }

    function branch(startPoint, weight, length, angle) {
        count++;
        if (count > 500_000) {
            console.log('Too many branches', count);
            return;
        }
        // 𝑥1=𝑥+𝑛cos𝜃
        // 𝑦1=𝑦+𝑛sin𝜃
        let x1 = startPoint[0] + length * Math.cos(angle);
        let y1 = startPoint[1] - length * Math.sin(angle);
        let endpoint = [x1, y1];

        context.lineWidth = weight;
        line(startPoint[0], startPoint[1], endpoint[0], endpoint[1]);

        const { angle1, angle2, angle3 } = calcNextAngles(angle);

        let newWeight = randomBetween(weight * params.minWeightReduction, weight * params.maxWeightReduction);
        let newLength = randomBetween(length * params.minLenReduction, length * params.maxLenReduction);

        if (newLength < params.finalLength) {
            return;
        }

        branch(endpoint, newWeight, newLength, angle1);
        branch(endpoint, newWeight, newLength, angle2);
    }

    function drawTree() {
        let startPoint = [width / 2, height];
        let endpoint = [width / 2, height - 50];
        let length = randomBetween(90, 120);
        let weight = randomBetween(20, 35);
        context.lineWidth = weight;
        context.strokeStyle = '#1e1e1e';
        line(startPoint[0], startPoint[1], endpoint[0], endpoint[1]);
        let branchAngle = Math.PI / 2;
        branch(endpoint, weight, length, branchAngle);
    }

    return ({ context, width, height }) => {
        count = 0;
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
        context.fillStyle = 'black';
        drawTree();
    };
};

function calcNextAngles(angle) {
    let angleMax = angle + Math.PI / 4;
    let angleMin = angle - Math.PI / 4;
    let angleDiff = randomBetween(0, angleMax - angleMin - Math.PI / 16);
    let angle1 = angleMax - angleDiff / 2;
    let angle2 = angleMin + angleDiff / 2;
    let angle3 = angleMin + angleDiff / 4;
    return { angle1, angle2, angle3 };
}

function randomBetween(low, high) {
    return Math.random() * (high - low) + low;
}

manager = canvasSketch(sketch, settings);
