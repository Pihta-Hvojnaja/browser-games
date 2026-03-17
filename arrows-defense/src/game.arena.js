import { canvasContext } from './common.const';

export const Arena = {

  calcTranslate() {
    /**
     * range - диапазон чисел (если 30, то ф-ция вернет от -30 до 29)
     */
    const range = 30;
    return Math.random() * range * 2 - range;
  },

  shake() {
    canvasContext.translate(
      this.calcTranslate(),
      this.calcTranslate()
    );
  },
};
