// import { Play } from './common.store';
// import { Arena } from './game.arena';

type Play = { shake: boolean };
type Arena = { shake: () => void, stopShake: () => void };

export class GameLoop {
  constructor(
    private play: Play,
    private arena: Arena,
  ) {}

  /**
   * Игровой тик
   * Тик привязан к requestAnimationFrame,
   * т. е. происходит перед каждой отрисовкой кадра
   */
  tick() {
    if (this.play.shake) {
      this.arena.shake();
    }

    // step

    if (this.play.shake) {
      this.arena.stopShake();
    }

    requestAnimationFrame(this.tick.bind(this));
  }

  launch() {
    this.tick();
  }
};
