import { Play } from './common.store';
import { Arena } from './game.arena';

export const GameLoop = {
  /**
   * Игровой тик
   * Тик привязан к requestAnimationFrame, т. е. происходит перед каждой отрисовкой кадра
   */
  tick() {
    if (Play.shake) {
      Arena.shake();
    }

    // Выполняем один шаг игры
    enginestep();

    if (Play.shake) {
      Arena.stopShake();
    }

    requestAnimationFrame(this.tick.bind(this));
  },

  launch() {
    this.tick();
  }
};
