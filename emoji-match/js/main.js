import {buttonArea, hintButton, replayButton} from './common.const';
import {createGameRound} from './game.create-round';
import {handleStartGame, handleGameAction, handleHint, replay} from './game.game-action';

// ============================================================
// СТАРТ ИГРЫ
// ============================================================

createGameRound({isFirstRound: true});

// ============================================================
// ОБРАБОТЧИКИ
// ============================================================

// ----- Выбор пары эмоджи -----
buttonArea.addEventListener('click', handleStartGame, {once: true});
buttonArea.addEventListener('click', handleGameAction);

// ----- Подсказка -----
hintButton.addEventListener('click', handleHint);
// ----- Кнопка повтора -----
replayButton.addEventListener('click', replay);

