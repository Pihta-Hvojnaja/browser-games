import {Store} from './common.store';
import {timer, buttonArea, hintButton} from './common.const';
import {animateClick, animateMatch, highlightTimer, animateTimePlus, showHintButton, showGameOver, hideGameOver, formatTime} from './common.utils';

import {createGameRound} from './game.create-round';

// ============================================================
// ИГРОВОЙ ТАЙМЕР
// ============================================================

const updateTimer = () => {
  const {timeLeft} = Store;

  if (timeLeft > 0) {
    const time = timeLeft - 10;

    if (time < 5000) {
      highlightTimer();
    }

    Store.timeLeft = time;
    timer.textContent = formatTime(time);

    return;
  }

  // GAME OVER
  Store.resetTimer();
  showGameOver(Store.numberOfMatches);
};

// ============================================================
// СТАРТ ИГРЫ
// ============================================================

export const handleStartGame = () => {
  Store.startTimer(updateTimer);

  showHintButton(Store.delayHint);
};

// ============================================================
// ВЫБОР ЭМОДЖИ ИГРОКОМ
// ============================================================

export const handleGameAction = ({target: currButton}) => {
  const {lastButton, isMatch} = Store;

  if (lastButton === currButton || isMatch) {
    return;
  }

  animateClick(lastButton, currButton);

  if (lastButton && lastButton.textContent === currButton.textContent) {
    Store.initializeMatch();

    animateTimePlus();
    animateMatch(lastButton, currButton);

    setTimeout(() => createGameRound(), 800);

    return;
  }

  Store.lastButton = currButton;
};

// ============================================================
// ПОДСКАЗКА
// ============================================================

export const handleHint = () => {
  hintButton.style.fontSize = '35px';
  hintButton.textContent = Store.duplicateEmoji;
};

// ============================================================
// НОВАЯ ИГРА
// ============================================================

export const replay = () => {
  hideGameOver();

  createGameRound({isFirstRound: true});

  buttonArea.addEventListener('click', handleStartGame, {once: true});
};
