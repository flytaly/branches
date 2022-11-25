/*
 * Based on
 * https://justinpoliachik.com/posts/2021-09-13-generativetrees01/ */

import canvasSketch from 'canvas-sketch';
import { randomBetween, Tree } from './tree';

// dcanvas-sketch manager
let manager;

const settings = {
    dimensions: [1024, 1024],
    animate: false,
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
        withGui: false,
        params: {
            /* deltaMin: Math.PI / 4, */
            /* deltaMax: Math.PI / 6, */
        },
    });

    return ({ context, width, height }) => {
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);

        /* const treeLeft = new Tree({ */
        /*     context, */
        /*     params: { */
        /*         deltaMin: Math.PI / 6, */
        /*         deltaMax: Math.PI / 4, */
        /*     }, */
        /* }); */
        /* treeLeft.drawTree([width / 2 - 60, height]); */

        tree.drawTree([width / 2, height]);
    };
};

manager = canvasSketch(sketch, settings);
