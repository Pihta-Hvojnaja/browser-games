
export const GameLoop = {
  DROP_INTERVAL: 1000,
  lastTime: 0,

  /**
   * Игровой тик
   * Тик привязан к requestAnimationFrame, т. е. происходит перед каждой отрисовкой кадра
   */
  tick() {
    // Если активна тряска, смещаем контекст
    if (shake) {
      var trax = Math.random() * 60 - 30;
      var tray = Math.random() * 60 - 30;
      ctx.translate(trax, tray);
    }

    // Выполняем один шаг игры
    enginestep();

    // Возвращаем контекст обратно и обновляем счётчик тряски
    if (shake) {
      ctx.translate(-trax, -tray);
      shaket++;
      if (shaket > 20) {
        shaket = 0;
        shake = false;
      }
    }

    requestAnimationFrame(this.tick.bind(this));
  },

  launch() {

    this.tick();
  }
};
