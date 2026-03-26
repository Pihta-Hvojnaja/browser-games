import { canvas, canvasContext } from "./common.const";

// canvas.style.width = '100vw';
// canvas.style.width = '100vh';

// canvasContext.imageSmoothingEnabled = false;
canvasContext.scale(1, 1);
canvasContext.translate(0.5, 0.5);


// canvasContext.fillStyle = 'green';
canvasContext.strokeStyle = '#e0e0e0';
// canvasContext.lineCap = 'round';
canvasContext.lineWidth = 0.5;

canvasContext.moveTo(0, 0);
canvasContext.lineTo(0, 500);
canvasContext.stroke();

canvasContext.moveTo(10, 0);
canvasContext.lineTo(10, 500);
canvasContext.stroke();

canvasContext.moveTo(0, 0);
canvasContext.lineTo(500, 0);
canvasContext.stroke();

const drawLine = ({fromX, fromY, toX, toY}) => {
  canvasContext.moveTo(fromX, fromY);
  canvasContext.lineTo(toX, toY);
  canvasContext.stroke();
};

const arenaMatrix = Array.from({length: 500}).map((_el, i) => Array.from({length: 500}).map((_el, i) => i));

arenaMatrix[0].forEach((x) => {
  const a = x % 10;

  if (a === 0) {
    drawLine({fromX: x, fromY: 0, toX: x, toY: 500});
    drawLine({fromX: 0, fromY: x, toX: 500, toY: x});
  }
});



