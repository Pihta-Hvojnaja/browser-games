// ============================================================
// СОЗДАЕТ ИГРОВОЙ РАУНД
// ============================================================

import {Store} from './common.store';
import {EMOJIS, EMOJIS_LIMIT, emojiButtons} from './common.const';
import {appearanceEmojis, initializeGameInfo, changePairCounter, showHintButton, getRandomInt, shuffleArray} from './common.utils';

const MIN = 0;
const MAX = EMOJIS.length - 1;

/**
 * Генерируем:
 * - 15 уникальных эмодзи,
 * - 1 дубликат
 */
const fillEmojiButtons = () => {
  const randomEmojis = [];

  for (let i = 0; i < EMOJIS_LIMIT - 1; i++) {
    let randomEmoji;

    do {
      randomEmoji = EMOJIS[Math.floor(getRandomInt(MIN, MAX))];
    } while (randomEmojis.includes(randomEmoji));

    randomEmojis.push(randomEmoji);
  }

  const duplicateEmoji = randomEmojis[randomEmojis.length - 1];
  const randomEmojisSet = shuffleArray([...randomEmojis, duplicateEmoji]);

  emojiButtons.forEach((emojiButton, i) => {
    emojiButton.classList.remove('match', 'highlight');
    emojiButton.textContent = randomEmojisSet[i];
  });

  Store.duplicateEmoji = duplicateEmoji;
};

export const createGameRound = ({isFirstRound} = {}) => {
  if (isFirstRound) {
    Store.initializeState();
    initializeGameInfo();
  } else {
    showHintButton(Store.delayHint);
    changePairCounter(Store.numberOfMatches);
  }

  Store.initializeRound();

  fillEmojiButtons();
  appearanceEmojis();
};
