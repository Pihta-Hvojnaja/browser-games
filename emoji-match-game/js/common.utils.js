import {animate} from 'animejs';
import {
  GAME_TIME_LIMIT, EMOJIS_LIMIT,
  emojiButtons, timer, timePlus, pairCounter,
  hintButton, gameOverScreen, gameOverPairCounter
} from './common.const';

// ============================================================
// УТИЛИТАРНЫЕ ФУНКЦИИ
// ============================================================

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};

export const getRandomInt = (min, max) => min + (max - min) * Math.random();

export const formatTime = (time) => {
  const sec = Math.floor(time / 1000);
  const mil = Math.floor((time % 1000) / 10);
  return `${sec < 10 ? `0${sec}` : sec}:${mil < 10 ? `0${mil}` : mil}`;
};


// ============================================================
// АНИМАЦИЯ ПОЯВЛЕНИЯ ЭМОДЖИ
// ============================================================

const GRID = 4;
const CENTRE_X = 1.5;
const CENTRE_Y = 1.5;

const BUTTON_APPEARANCE_DELAYS = Array.from({length: EMOJIS_LIMIT}).map((_, i) => {
  const row = Math.floor(i / GRID);
  const col = i % GRID;
  const dist = Math.sqrt((row - CENTRE_Y) ** 2 + (col - CENTRE_X) ** 2);
  return dist * 200; // ms
});

export const appearanceEmojis = () => (
  animate(emojiButtons, {
    opacity: [0, 1],
    scale: [0, 1],
    rotate: ['-15deg', '0deg'],
    duration: 600,
    delay: (el, i) => BUTTON_APPEARANCE_DELAYS[i],
    easing: 'easeOutElastic(1, .5)'
  })
);

// ============================================================
// АНИМАЦИЯ КЛИКА НА ЭМОДЖИ
// ============================================================

export const animateClick = (lastButton, currButton) => {
  lastButton?.classList.remove('highlight');
  currButton.classList.add('highlight');

  animate(currButton, {
    keyframes: [
      { scale: 0.9, duration: 50 }, // сжатие за 50ms
      { scale: 1, duration: 50 } // возврат за 50ms
    ],
    easing: 'easeOutQuad' // плавное начало/замедление в конце (аналогично CSS ease)
  });
};

// ============================================================
// АНИМАЦИЯ УСПЕХА
// ============================================================

export const animateMatch = (lastButton, currButton) => {
  lastButton.classList.add('match');
  currButton.classList.add('match');

  animate([currButton, lastButton], {
    keyframes: [
      { scale: 0.8, rotate: '1deg', offset: 0 }, // t=0
      { scale: 1, rotate: 0, offset: 150 / 900 }, // t=150ms
      { scale: 0.8, rotate: '1deg', offset: 300 / 900 }, // t=300ms
      { scale: 1, rotate: 0, offset: 600 / 900 }, // t=600ms
      { scale: 1, rotate: 0, offset: 1 } // t=900ms
    ],
    duration: 900, // общая длительность анимации (последний переход 300ms)
    easing: 'cubicBezier(0.175, 0.885, 0.32, 1.275)' // оригинальная функция
  });
};

// ============================================================
// АНИМАЦИЯ ТАЙМЕРА
// ============================================================

export const highlightTimer = () => {
  animate(timer, {
    scale: 1.5,
    color: '#FF4444',
    duration: 300,
    easing: 'easeOutQuad'
  });
};

export const resetTimerHighlight = () => {
  animate(timer, {
    scale: 1,
    color: '#262626',
    duration: 300,
    easing: 'easeOutQuad'
  });
};

// ============================================================
// АНИМАЦИЯ ДОПОЛНИТЕЛЬНОГО ВРЕМЕНИ
// ============================================================

export const animateTimePlus = () => (
  animate(timePlus, {
    opacity: [0, 1], // от 0 → 1, потом обратно
    scale: [0, 1],
    duration: (_, prop) => prop === 'opacity' ? 100 : 300, // разная длит.
    alternate: true, // после завершения элемент вернётся в исходное состояние (opacity 0, scale 0)
    loop: 1, // ровно два прохода (туда + обратно)
    loopDelay: 2000, // пауза между проходами (время показа)
    easing: 'easeOutQuad' // можно выбрать любой
  })
);

// ============================================================
// СЧЕТЧИК ПАР
// ============================================================

export const changePairCounter = (number) => {
  const text = `Найдено пар: ${number}`;

  pairCounter.textContent = text;
  gameOverPairCounter.textContent = text;
};

// ============================================================
// ПОЯВЛЕНИЕ ПОДСКАЗКИ
// ============================================================

let timeoutId = null;

export const resetHintButton = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  hintButton.textContent = 'Подсказка';
  hintButton.style.fontSize = '';

  hintButton.style.opacity = '';
  hintButton.style.transform = '';
};

export const showHintButton = (delay) => {
  if (timeoutId) {
    resetHintButton();
  }

  timeoutId = setTimeout(() => {
    animate(hintButton, {
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 300,
      easing: 'easeOutQuad'
    });
  }, delay);
};


// ============================================================
// ПОЯВЛЕНИЕ / СКРЫТИЕ ЭКРАНА GAME OVER
// ============================================================

export const showGameOver = (numberOfMatches) => {
  resetTimerHighlight();
  changePairCounter(numberOfMatches);

  gameOverScreen.style.visibility = 'visible';
  gameOverScreen.style.pointerEvents = 'auto';

  animate(gameOverScreen, {
    scale: [0.5, 1],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutQuad'
  });
};

export const hideGameOver = () => {
  animate(gameOverScreen, {
    scale: [1, 0.5],
    opacity: [1, 0],
    duration: 600,
    easing: 'easeInQuad',
    complete: () => {
      gameOverScreen.style.visibility = 'hidden';
      gameOverScreen.style.pointerEvents = 'none';
    }
  });
};

// ============================================================
// ОТКАТ ТАЙМЕРА, СЧЕТЧИКА ПАР И КНОПКИ-ПОДСКАЗКИ К НАЧАЛУ
// ============================================================

export const initializeGameInfo = () => {
  timer.textContent = formatTime(GAME_TIME_LIMIT);
  pairCounter.textContent = 'Найдите пару';

  resetHintButton();
};
