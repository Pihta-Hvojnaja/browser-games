import { canvasContext } from './common.const';
import { Play } from './common.store';
import { View } from './game.view';

export const Arena = {
  WIDTH: 12,
  HEIGHT: 20,
  SCALE: 20,

  /**
   * Масштабируем контекст:
   * один блок будет размером SCALE на SCALE пикселей
   */
  scaleCanvas() {
    canvasContext.scale(this.SCALE, this.SCALE);
  },

  /**
   * Создание двумерного массива (матрицы) заданного размера
   *  [
   *    [0,0,0 ...],
   *    [0,0,0 ...]
   *    ...
   *  ]
   */
  create() {
    const matrix = [];

    for (let i = 0; i < this.HEIGHT; i++) {
      matrix.push(new Array(this.WIDTH).fill(0));
    }

    Play.arenaMatrix = matrix;
  },

  clear() {
    Play.arenaMatrix.forEach(row => row.fill(0));
  },

  /**
   * Поглощение матрицы фигуры ареной
   */
  mergeFigure() {
    const {arenaMatrix, figureMatrix, figurePosition} = Play;

    figureMatrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arenaMatrix[
            y + figurePosition.y
          ][
            x + figurePosition.x
          ] = value;
        }
      });
    });
  },

  /**
   * Очистка заполненных линий
   */
  sweep() {
    const {arenaMatrix} = Play;

    let rowCount = 1;

    /**
     * Идем снизу вверх построчно, ищем заполненные строки
     * Если строка не заполнена - переходим к следующей
     */
    rowLoop: for (let y = arenaMatrix.length - 1; y >= 0; y--) {
      for (let x = 0; x < arenaMatrix[y].length; x++) {
        if (arenaMatrix[y][x] === 0) {
          // в строке есть пустая клетка → переходим к следующей строке
          continue rowLoop;
        }
      }

      // удаляем заполненную строку
      const fullRow = arenaMatrix.splice(y, 1)[0];
      // вставляем пустую строку сверху
      arenaMatrix.unshift(fullRow.fill(0));

      // проверяем ту же позицию снова (так как индексы сместились)
      y++;

      // начисляем очки
      Play.score += rowCount * 10;
      View.updateScore();

      // удваиваем множитель для следующей линии
      rowCount *= 2;
    }
  }
};
