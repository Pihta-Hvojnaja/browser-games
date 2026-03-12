import { Play } from './common.store';
import { Arena } from './game.arena';
import { View } from './game.view';

export const Figure = {
  FIGURES: 'TJLOSZI',

  /**
   * Создание двумерного массива (матрицы) фигуры
   *
   * Размер массива учитывает поворот фигуры
   * Числа обозначают цвета
   *
   * @param {'I' | 'L' | 'J' | 'O' | 'Z' | 'S' | 'T'} type
   * @returns {number[][]}
   */
  createFigure(type) {
    switch (type) {
    case 'I':
      return [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
      ];
    case 'L':
      return [
        [0, 2, 0],
        [0, 2, 0],
        [0, 2, 2]
      ];
    case 'J':
      return [
        [0, 3, 0],
        [0, 3, 0],
        [3, 3, 0]
      ];
    case 'O':
      return [
        [4, 4],
        [4, 4]
      ];
    case 'Z':
      return [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0]
      ];
    case 'S':
      return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0]
      ];
    case 'T':
      return [
        [0, 7, 0],
        [7, 7, 7],
        [0, 0, 0]
      ];
    default:
      return [];
    }
  },

  /**
   * Поворот матрицы (транспонирование + отражение)
   * @param {number[][]} matrix
   * @param {1 | -1} direction
   */
  rotateMatrix(matrix, direction) {
    /**
     * Транспонирование (меняем строки и столбцы местами):
      [
        [1, 2, 3],
        [4, 5, 6]
      ] ---> [
        [1, 4],
        [2, 5],
        [3, 6]
      ]
     *
     * 0d, 2d, 2d - диагональные элементы (y === x)
     * Мы должны поменять местами элементы, которые выше диагонали,
     * с элементами, которые ниже. Диагональ трогать не нужно
     * [
          [0d, 2, 0],
          [0, 2d, 0],
          [0, 2, 2d],
        ];
     */
    for (let y = 1; y < matrix.length; y++) {
      for (let x = 0; x < y; x++) {
        /**
         * Деструктурирующее присваивание:
         * позиция в матрице x/y, y/x = значение в матрице y/x, x/y
         */
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }

    // Если direction > 0 → поворот по часовой стрелке (отражаем строки)
    if (direction > 0) {
      matrix.forEach(row => row.reverse());
    }
    // Иначе (direction <= 0) → поворот против часовой (отражаем матрицу целиком)
    else {
      matrix.reverse();
    }
  },

  /**
   * Проверка столкновения фигуры с ареной
   */
  collide() {
    const {arenaMatrix, figureMatrix, figurePosition} = Play;

    /**
     * у - вертикальная позиция ячейки внутри матрицы
     * x - горизонтальная позиция ячейки внутри матрицы
     *
     * Позиция y и x относительно арены:
     * Y матрицы + figurePosition.y
     * X матрицы + figurePosition.x
     */
    for (let y = 0; y < figureMatrix.length; y++) {
      const figureRow = figureMatrix[y];
      const arenaRow = arenaMatrix[y + figurePosition.y];

      for (let x = 0; x < figureRow.length; x++) {
        if (figureRow[x] !== 0) {
          const arenaX = x + figurePosition.x;

          // Проверка выхода за вертикальные границы
          if (!arenaRow) return true;

          // Проверка выхода за левую или правую границу
          if (arenaX < 0 || arenaX >= arenaRow.length) return true;

          // Проверка занятости клетки на арене
          if (arenaRow[arenaX] !== 0) return true;
        }
      }
    }

    return false;
  },

  /**
   * Поворот фигуры с учетом столкновений
   * @param @param {1 | -1} direction
   */
  rotate(direction) {
    const {figureMatrix, figurePosition} = Play;

    let offset = 1;
    const initialPositionX = figurePosition.x;

    this.rotateMatrix(figureMatrix, direction);

    /**
     * Пока фигура после поворота пересекается с ареной или границами,
     * пытаемся сдвинуть её влево или вправо
     */
    while (this.collide()) {
      figurePosition.x += offset;

      /**
       * Перемещаем offset вправо, влево
       *
       * 0 0 0 0 0 0 |>1 0 0 0 0 0 || offset = 1
       * 0 0 0 0 0 1<| 0 0 0 0 0 0 || offset = -(1 + 1) = -2
       * 0 0 0 0 0 0 |>0>1 0 0 0 0 || offset = -(-2 + (-1)) = -(-3) = 3
       * 0 0 0 0 1<0<| 0 0 0 0 0 0 || offset = -(3 + 1) = -4
       * 0 0 0 0 0 0 |>0>0>1 0 0 0 || offset = -(-4 + (-1)) = 5
       * 0 0 0 1<0<0<| 0 0 0 0 0 0 || offset = -(5 + (1)) = -6
       */
      offset = -(offset + (offset > 0 ? 1 : -1));

      if (offset > figureMatrix[0].length) {
        /**
         * Если не удалось найти место, отменяем поворот,
         * возвращаем исходную позицию
         */
        figurePosition.x = initialPositionX;
        this.rotateMatrix(figureMatrix, -direction);

        return;
      }
    }
  },

  /**
   * Перемещение фигуры по горизонтали
   * @param {number} offset
   */
  moveX(offset) {
    const {figurePosition} = Play;

    figurePosition.x += offset;

    if (this.collide()) {
      // откатываем, если произошло столкновение
      figurePosition.x -= offset;
    }
  },

  /**
   * Появление новой фигуры
   */
  spawnFigure() {
    Play.figureMatrix = this.createFigure(this.FIGURES[Math.floor(Math.random() * this.FIGURES.length)]);

    Play.figurePosition = {
      y: 0,
      x: Math.floor(Play.arenaMatrix[0].length / 2) - Math.floor(Play.figureMatrix[0].length / 2)
    };

    /**
     * Если сразу после появления фигуры есть коллизия → игра окончена
     * (очищаем арену и сбрасываем счёт)
     */
    if (this.collide()) {
      Arena.clear();

      Play.score = 0;
      View.updateScore();
    }
  },

  /**
   * Падение фигуры
   * @param {{isAutoDrop: boolean}} {isAutoDrop}
   */
  drop({isAutoDrop} = {}) {
    Play.figurePosition.y++;

    if (this.collide()) {
      Play.figurePosition.y--;

      Arena.mergeFigure();
      Arena.sweep();

      this.spawnFigure();
    }

    if (!isAutoDrop) {
      Play.dropCounter = 0;
    }
  }
};
