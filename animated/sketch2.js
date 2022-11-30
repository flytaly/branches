import canvasSketch from 'canvas-sketch';
import { Tree } from './tree_animation';

// dcanvas-sketch manager
let manager;

const settings = {
    dimensions: [1024, 1024],
    animate: true,
    fps: 24,
    playbackRate: 'throttle',
};

/**
 * @param {Object} opts
 * @param {CanvasRenderingContext2D} opts.context
 */
const sketch = ({ context, width, height }) => {
    const bgColor = '#F7FBFF';
    let tree = new Tree({
        context: context,
        params: {
            colorRoot: bgColor,
            colorHSLTo: [217, 31, 80],
            colorHSLFrom: [217, 31, 20],
        },
        startPoint: [width / 2, height - 40],
    });

    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    return () => {
        if (!tree.drawNext()) {
            /* tree = new Tree({ */
            /*     context: context, */
            /*     params: {}, */
            /*     startPoint: [width / 2 + Math.random() * 300 - 150, height], */
            /* }); */
            console.log('finished');
        }
    };
};

manager = canvasSketch(sketch, settings);
