import { Play } from './common.store';
import { Figure } from './game.figure';
import { View } from './game.view';

export const GameLoop = {
  DROP_INTERVAL: 1000,
  lastTime: 0,

  /**
   * Игровой тик
   * Тик привязан к requestAnimationFrame, т. е. происходит перед каждой отрисовкой кадра
   *
   * @param {number} time - время, которое прошло с момента отрисовки страницы
   */
  tick(time = 0) {
    /**
     * dropCounter - время, которое прошло после падения предыдущей фигуры
     * time - this.lastTime - время, которое прошло между кадрами
     */
    Play.dropCounter += (time - this.lastTime);

    /**
     * Мы должны двигать фигуру вниз спустя каждый dropInterval,
     * но частота кадров может быть разной.
     *
     * Если из-за низкой частоты кадров прошло, например, 1050 мс вместо 1000,
     * то после падения останется 50 мс, и следующий шаг произойдёт уже через 950 мс,
     * восстанавливая синхронизацию.
     *
     * Если пользователь переключится на другую вкладку, вызов requestAnimationFrame прекратится, но time будет расти.
     * Это приведет к тому, что после возвращения на вкладку с тетрисом, циклу, возможно,
     * придется обработать большое количество перемещений фигуры. Кадр подвиснет.
     * Ограничим число перемещений 10. Остальное будет обработано в других кадрах.
     */
    let steps = 0;

    while (Play.dropCounter > this.DROP_INTERVAL && steps < 10) {
      steps++;

      Figure.drop({isAutoDrop: true});
      Play.dropCounter -= this.DROP_INTERVAL;
    }

    View.drawFrame();

    this.lastTime = time;
    requestAnimationFrame(this.tick.bind(this));
  },

  launch() {
    Figure.spawnFigure();
    View.updateScore();

    this.tick();
  }
};
