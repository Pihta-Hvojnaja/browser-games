import {GAME_TIME_LIMIT} from './common.const';

const getInitialState = () => ({
  isMatch: false,
  timeLeft: 0,
  delayHint: 0,
  duplicateEmoji: null,
  lastButton: null,
  numberOfMatches: 0,
  timerId: null
});

export const Store = {
  _state: getInitialState(),

  get isMatch() {
    return this._state.isMatch;
  },

  set isMatch(value) {
    this._state.isMatch = value;
  },

  get timeLeft() {
    return this._state.timeLeft;
  },

  set timeLeft(value) {
    this._state.timeLeft = value;
  },

  get delayHint() {
    return this._state.timeLeft / 6;
  },

  get duplicateEmoji() {
    return this._state.duplicateEmoji;
  },

  set duplicateEmoji(value) {
    this._state.duplicateEmoji = value;
  },

  get lastButton() {
    return this._state.lastButton;
  },

  set lastButton(value) {
    this._state.lastButton = value;
  },

  get numberOfMatches() {
    return this._state.numberOfMatches;
  },

  set numberOfMatches(value) {
    this._state.numberOfMatches = value;
  },

  get timerId() {
    return this._state.timerId;
  },

  set timerId(value) {
    this._state.timerId = value;
  },

  startTimer(updateTimer) {
    this._state.timeLeft = GAME_TIME_LIMIT;
    this._state.timerId = setInterval(updateTimer, 10);
  },

  initializeState() {
    this._state = getInitialState();
  },

  initializeMatch() {
    this._state.isMatch = true;
    this._state.timeLeft += 3000;
    this._state.numberOfMatches++;
  },

  initializeRound() {
    this._state.isMatch = false;
    this._state.lastButton = null;
  },

  resetTimer() {
    clearInterval(this._state.timerId);
    this._state.timerId = null;
  }
};
