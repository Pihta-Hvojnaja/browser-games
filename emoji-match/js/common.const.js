// ============================================================
// CONST
// ============================================================

export const GAME_TIME_LIMIT = 30000;

export const EMOJIS_LIMIT = 16;

export const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '🤠', '😡', '😠', '😴', '🤐',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐸',
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🎳', '🎯', '🎮', '🎲', '♟️',
  '🚗', '🚕', '🚙', '🚌', '🚲', '✈️', '🚀', '🌞', '🌈', '🔥'
];

// ============================================================
// GAME SCREEN
// ============================================================

export const gameScreen = document.querySelector('.game-screen');

export const timer = gameScreen.querySelector('.timer');
export const timePlus = gameScreen.querySelector('.time-plus');

export const pairCounter = gameScreen.querySelector('.pair-counter');
export const buttonArea = gameScreen.querySelector('.button-area');
export const emojiButtons = buttonArea.querySelectorAll('.emoji-button');

export const hintButton = gameScreen.querySelector('.hint-button');

// ============================================================
// GAME OVER SCREEN
// ============================================================

export const gameOverScreen = document.querySelector('.game-over-screen');

export const gameOverPairCounter = gameOverScreen.querySelector('.pair-counter');
export const replayButton = gameOverScreen.querySelector('.replay-button');
