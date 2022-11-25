/*
 * Based on
 * https://justinpoliachik.com/posts/2021-09-13-generativetrees01/ */

import canvasSketch from 'canvas-sketch';
import { Tree } from './tree';

// dcanvas-sketch manager
let manager;

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
const sketch = ({ context }) => {
    const tree = new Tree({
        onParamsChange: async () => {
            (await manager).render();
        },
        context: context,
        withGui: true,
    });

    return ({ context, width, height }) => {
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
        tree.drawTree([width / 2, height]);
    };
};

manager = canvasSketch(sketch, settings);
