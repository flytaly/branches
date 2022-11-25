import canvasSketch from 'canvas-sketch';
import { Tree } from './tree_animation';

// dcanvas-sketch manager
let manager;

const settings = {
    dimensions: [1024, 1024],
    animate: true,
    fps: 60, // Optionally specify an export frame rate, defaults to 30
};

/**
 * @param {Object} opts
 * @param {CanvasRenderingContext2D} opts.context
 */
const sketch = ({ context, width, height }) => {
    const tree = new Tree({
        onParamsChange: async () => {
            (await manager).render();
        },
        context: context,
        withGui: false,
        params: {},
        startPoint: [width / 2, height],
    });

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    return ({ context, pause }) => {
        const drawn = tree.draw();
    };
};

manager = canvasSketch(sketch, settings);
