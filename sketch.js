import canvasSketch from 'canvas-sketch';

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
const sketch = () => {
    return ({ context, width, height }) => {
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
        context.fillStyle = 'black';
        context.beginPath();
        context.arc(width / 2, height, 100, 0, Math.PI * 2);
        context.fill();
    };
};

canvasSketch(sketch, settings);
