import { Arena } from './game.arena';
import { Figure } from './game.figure';
import { GameLoop } from './game.game-loop';

// ============================================================
// ИГРОВАЯ АРЕНА
// ============================================================

Arena.scaleCanvas();
Arena.create();

// ============================================================
// ИНИЦИЛИЗАЦИЯ ИГРЫ
// ============================================================

GameLoop.launch();

// ============================================================
// ОБРАБОТЧИКИ ДЕЙСТВИЙ
// ============================================================

document.addEventListener('keydown', event => {
  /**
   * Предотвращаем прокрутку страницы для нужных клавиш
   */
  if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key) || event.code === 'KeyW') {
    event.preventDefault();
  }

  if (event.key === 'ArrowLeft') {
    Figure.moveX(-1);
  } else if (event.key === 'ArrowRight') {
    Figure.moveX(1);
  } else if (event.key === 'ArrowDown') {
    Figure.drop(); // быстрое падение вниз
  } else if (event.key === 'ArrowUp') {
    Figure.rotate(-1); // поворот против часовой
  }
  // Для клавиши W используем event.code, чтобы не зависеть от раскладки
  else if (event.code === 'KeyW') {
    Figure.rotate(1); // поворот по часовой
  }
});
