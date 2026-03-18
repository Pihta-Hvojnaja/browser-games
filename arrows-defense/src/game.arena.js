import { canvasContext } from './common.const';
import { Play } from './common.store';

export const Arena = {
  /**
    * если 30, то ф-ция вернет от -30 до 29
    */
  SHAKING_RANGE: 30,
  translateX: 0,
  translateY: 0,

  calcTranslate() {
    return Math.random() * this.SHAKING_RANGE * 2 - this.SHAKING_RANGE;
  },

  shake() {
    this.translateX = this.calcTranslate();
    this.translateY = this.calcTranslate();

    canvasContext.translate(this.translateX, this.translateY);
  },

  stopShake() {
    Play.shakingCounter++;

    if (Play.shakingCounter > 20) {
      Play.resetShake();
    }

    canvasContext.translate(-this.translateX, -this.translateY);
  },
};
