import { canvas, canvasContext, score } from './common.const';
import { Play } from './common.store';

export const View = {
  COLORS: [
    null,
    '#FF0D72', // I
    '#0DC2FF', // L
    '#0DFF72', // J
    '#F538FF', // O
    '#FF8E0D', // Z
    '#FFE138', // S
    '#3877FF' // T
  ],
  RECT_SIZE: 1,
  BACKGROUND: '#FFF',

  /**
   * Отрисовка фигуры на канвасе
   *
   * @param {number[][]} matrix
   * @param {{x: number, y: number}} offset
   */
  drawMatrix(matrix, offset) {
    /**
     * у - вертикальная позиция ячейки внутри матрицы
     * x - горизонтальная позиция ячейки внутри матрицы
     *
     * Позиция y и x относительно арены:
     * Y матрицы + offset.y
     * X матрицы + offset.x
     */
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          canvasContext.fillStyle = this.COLORS[value];

          canvasContext.fillRect(
            x + offset.x,
            y + offset.y,
            this.RECT_SIZE, this.RECT_SIZE
          );
        }
      });
    });
  },

  /**
   * Отрисовка полного кадра
   */
  drawFrame() {
    const {arenaMatrix, figureMatrix, figurePosition} = Play;

    canvasContext.fillStyle = this.BACKGROUND;
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем арену
    this.drawMatrix(arenaMatrix, {x: 0, y: 0});
    // Рисуем фигуру
    this.drawMatrix(figureMatrix, figurePosition);
  },

  /**
   * Обновляем счет игры
   */
  updateScore() {
    score.innerText = Play.score;
  }
};
