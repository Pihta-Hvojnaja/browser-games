import { canvasContext } from './common.const';
// import { Play } from './common.store';

type Play = { shakingCounter: number; resetShake: () => void };

export class Arena {
  /**
   * если 30, то ф-ция вернет от -30 до 29
   */
  private readonly SHAKING_RANGE = 30;
  private translateX = 0;
  private translateY = 0;


  constructor(
    private play: Play,
  ) {}

  calcTranslate() {
    return Math.random() * this.SHAKING_RANGE * 2 - this.SHAKING_RANGE;
  }

  shake() {
    this.translateX = this.calcTranslate();
    this.translateY = this.calcTranslate();

    canvasContext.translate(this.translateX, this.translateY);
  }

  stopShake() {
    this.play.shakingCounter++;

    if (this.play.shakingCounter > 20) {
      this.play.resetShake();
    }

    canvasContext.translate(-this.translateX, -this.translateY);
  }
};
