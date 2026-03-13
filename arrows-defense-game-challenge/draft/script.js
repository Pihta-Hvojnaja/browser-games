"use strict";

// ================================ КОНСТАНТЫ И НАСТРОЙКИ ================================
const STAGE_WIDTH = 1280;
const STAGE_HEIGHT = 720;
const CENTER_X = STAGE_WIDTH / 2;
const CENTER_Y = STAGE_HEIGHT; // нижний центр

const ENEMY_SPEED = 3;
const BULLET_SPEED = 20;
const SHOT_INTERVAL = 8;        // стреляем каждые 8 кадров
const AI_TIMEOUT = 3000;        // 3 секунды бездействия мыши – включить ИИ
const SHAKE_DURATION = 20;       // длительность тряски экрана при попадании врага в центр

const COLORS = [
    '#1abc9c','#1abc9c','#3498db','#9b59b6','#34495e','#16a085','#27ae60','#2980b9',
    '#8e44ad','#2c3e50','#f1c40f','#e67e22','#e74c3c','#95a5a6','#f39c12','#d35400',
    '#c0392b','#bdc3c7','#7f8c8d'
];

// ================================ ИНИЦИАЛИЗАЦИЯ CANVAS ================================
const canvas = document.getElementById('canvas');
canvas.width = STAGE_WIDTH;
canvas.height = STAGE_HEIGHT;
const ctx = canvas.getContext('2d');

// ================================ ГЛОБАЛЬНОЕ СОСТОЯНИЕ ИГРЫ ================================
// Положение указателя (мышь/тач)
const pointer = { x: 0, y: 0 };

// Переменные для адаптации canvas под размер окна
let scale = 1;
let portrait = true;
let leftOffset = 0;
let topOffset = 0;

// Игровые объекты
let bullets = [];                // массив пуль
let enemies = [];                // массив врагов
let explosions = [];             // массив взрывов

// Управление прицелом
let aimAngle = 0;                // текущий угол наклона пушки (в радианах)
let aiEnabled = true;            // включён ли автоприцел
let lastMouseMoveTime = 0;       // время последнего движения мыши (для отключения ИИ)

// Счётчик для стрельбы (выстрел происходит каждые SHOT_INTERVAL кадров)
let shotCounter = 0;

// Тряска экрана
let shakeActive = false;
let shakeFrame = 0;
let shakeOffsetX = 0, shakeOffsetY = 0;

// Массив для сортировки врагов при ИИ
let cold = [];

// ================================ ИЗОБРАЖЕНИЯ ДЛЯ ВЗРЫВОВ И ФОНА ================================
// Эти изображения генерируются путём рисования на canvas и сохранения через toDataURL.
// Логика полностью сохранена.

// Взрыв типа 1 (красные стрелы, от центра в стороны)
let explodeImage = new Image();
(function generateExplodeImage() {
    ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    for (let i = 0; i < 200; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = Math.random() * 250 + 50;
        const fromX = 360 + Math.sin(angle) * length;
        const fromY = 360 - Math.cos(angle) * length;
        drawArrow(
            fromX, fromY,
            fromX + length / 6 * Math.sin(angle),
            fromY - length / 6 * Math.cos(angle),
            length / 30, length / 30,
            '#c0392b'
        );
    }
    explodeImage.src = canvas.toDataURL('image/png');
})();

// Взрыв типа 2 (синие стрелы, из нижнего центра вверх)
let explodeBlueImage = new Image();
(function generateExplodeBlueImage() {
    ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    for (let i = 0; i < 200; i++) {
        const angle = Math.random() * Math.PI - Math.PI / 2; // от -90° до +90°
        const length = Math.random() * 480 + 50;
        const fromX = CENTER_X + Math.sin(angle) * length;
        const fromY = CENTER_Y - Math.cos(angle) * length;
        drawArrow(
            fromX, fromY,
            fromX + length / 6 * Math.sin(angle),
            fromY - length / 6 * Math.cos(angle),
            length / 30, length / 30,
            '#2c3e50'
        );
    }
    explodeBlueImage.src = canvas.toDataURL('image/png');
})();

// Фоновое изображение (случайные стрелы)
let backgroundImage = new Image();
(function generateBackgroundImage() {
    ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    ctx.fillStyle = 'rgba(236,240,241,1)';
    ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    for (let i = 0; i < 200; i++) {
        const angle = Math.random() * Math.PI; // 0..180°
        const length = Math.random() * 250 + 50;
        const fromX = Math.random() * STAGE_WIDTH;
        const fromY = Math.random() * STAGE_HEIGHT;
        drawArrow(
            fromX, fromY,
            fromX + length / 6 * Math.sin(angle),
            fromY - length / 6 * Math.cos(angle),
            length / 30, length / 30,
            COLORS[Math.floor(Math.random() * COLORS.length)]
        );
    }
    // Полупрозрачная заливка поверх, чтобы сделать фон бледнее
    ctx.fillStyle = 'rgba(236,240,241,0.9)';
    ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    backgroundImage.src = canvas.toDataURL('image/png');
})();

// ================================ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ================================

/**
 * Рисует стрелку от точки (fromX, fromY) до (toX, toY).
 * @param {number} fromX 
 * @param {number} fromY 
 * @param {number} toX 
 * @param {number} toY 
 * @param {number} lineWidth   толщина линии
 * @param {number} headLength  длина наконечника
 * @param {string} color       цвет
 */
function drawArrow(fromX, fromY, toX, toY, lineWidth, headLength, color) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineWidth = lineWidth;

    // Линия
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Наконечник
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toX - headLength * Math.cos(angle) / 2,
        toY - headLength * Math.sin(angle) / 2
    );
    ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

/**
 * Создаёт нового врага со случайным направлением и начальным положением за экраном.
 * @returns {Enemy}
 */
function createEnemy() {
    // Угол направления к центру (от -72° до +72° примерно)
    const angle = Math.random() * Math.PI / 1.25 - Math.PI / 2.5;  // эквивалент original: Math.PI/(2.5/2)-Math.PI/2.5
    const distance = Math.random() * 1280 + 720; // от 720 до 2000 пикселей от центра
    return {
        x: CENTER_X - Math.sin(angle) * distance,
        y: CENTER_Y - Math.cos(angle) * distance,
        angle: angle
    };
}

/**
 * Создаёт пулю, вылетающую из позиции пушки по текущему углу aimAngle.
 * @returns {Bullet}
 */
function createBullet() {
    return {
        x: CENTER_X - Math.sin(aimAngle) * 150,
        y: CENTER_Y - Math.cos(aimAngle) * 150,
        angle: aimAngle
    };
}

/**
 * Создаёт взрыв.
 * @param {number} x 
 * @param {number} y 
 * @param {number} type  1 - красный (от пули), 2 - синий (от врага в центре)
 * @returns {Explosion}
 */
function createExplosion(x, y, type) {
    return {
        x: x,
        y: y,
        size: 30,        // начальный размер
        type: type
    };
}

// ================================ ИНИЦИАЛИЗАЦИЯ ВРАГОВ ================================
for (let i = 0; i < 10; i++) {
    const enemy = createEnemy();
    // Дополнительное смещение (как в оригинале)
    enemy.x += Math.sin(enemy.angle) * 300;
    enemy.y += Math.cos(enemy.angle) * 300;
    enemies.push(enemy);
}

// ================================ ИГРОВОЙ ЦИКЛ ================================

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        // Движение
        b.x -= Math.sin(b.angle) * BULLET_SPEED;
        b.y -= Math.cos(b.angle) * BULLET_SPEED;

        // Отрисовка
        drawArrow(
            b.x + Math.sin(b.angle) * 50,
            b.y + Math.cos(b.angle) * 50,
            b.x, b.y,
            8, 8,
            '#2980b9'
        );

        // Удаление за границами
        if (b.x < -100 || b.x > STAGE_WIDTH + 100 || b.y < -100 || b.y > STAGE_HEIGHT + 100) {
            bullets.splice(i, 1);
        }
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        // Движение к центру
        e.x += Math.sin(e.angle) * ENEMY_SPEED;
        e.y += Math.cos(e.angle) * ENEMY_SPEED;

        // Отрисовка
        drawArrow(
            e.x - Math.sin(e.angle) * 100,
            e.y - Math.cos(e.angle) * 100,
            e.x, e.y,
            15, 15,
            '#c0392b'
        );

        // Проверка, достиг ли враг центра (низа экрана)
        if (e.y > STAGE_HEIGHT) {
            explosions.push(createExplosion(CENTER_X, CENTER_Y, 2));
            shakeActive = true;
            shakeFrame = 0;
            // Замена врага новым
            enemies[i] = createEnemy();
            enemies[i].x += Math.sin(enemies[i].angle) * 300;
            enemies[i].y += Math.cos(enemies[i].angle) * 300;
        }
    }
}

function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            const dx = e.x - b.x;
            const dy = e.y - b.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 20 * 20) {
                // Попадание
                explosions.push(createExplosion(e.x, e.y, 1));
                // Замена врага новым
                enemies[i] = createEnemy();
                enemies[i].x += Math.sin(enemies[i].angle) * 300;
                enemies[i].y += Math.cos(enemies[i].angle) * 300;
                bullets.splice(j, 1);
                break; // враг уничтожен, выходим из внутреннего цикла
            }
        }
    }
}

function updateAim() {
    // Управление ИИ
    if (aiEnabled) {
        // Вычисляем расстояния от каждого врага до центра
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            const dx = e.x - CENTER_X;
            const dy = e.y - CENTER_Y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            // Формируем строку для сортировки: сначала расстояние, потом индекс
            // (добавляем 100000, чтобы расстояние было ведущим, как в оригинале)
            cold[i] = (100000 + distance) + 'x' + (1000 + i);
        }
        cold.sort();
        // Извлекаем индекс ближайшего врага
        const nearestIndex = parseInt(cold[0].slice(8, 11));
        const nearestEnemy = enemies[nearestIndex];
        const distanceToCenter = parseInt(cold[0].slice(1, 6));
        
        // Плавно поворачиваем пушку к врагу, если он достаточно близко (<800?)
        if (distanceToCenter < 800) {
            aimAngle += (nearestEnemy.angle - aimAngle) / 8;
        }
    } else {
        // Ручное управление: угол следует за указателем
        const dx = pointer.x - CENTER_X;
        const dy = pointer.y - CENTER_Y;
        aimAngle = Math.atan2(dx, dy); // atan2(dx, dy) даёт угол относительно вертикали
    }
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        const img = (exp.type === 1) ? explodeImage : explodeBlueImage;
        const alpha = 1 - (exp.size / STAGE_HEIGHT); // прозрачность увеличивается со временем
        ctx.globalAlpha = alpha;

        if (exp.type === 1) {
            // Красный взрыв расширяется от центра
            ctx.drawImage(
                img,
                exp.x - exp.size / 2,
                exp.y - exp.size / 2,
                exp.size * STAGE_WIDTH / STAGE_HEIGHT,
                exp.size
            );
        } else {
            // Синий взрыв (в центре снизу) – рисуется иначе (как в оригинале)
            ctx.drawImage(
                img,
                exp.x - exp.size * STAGE_WIDTH / STAGE_HEIGHT / 2,
                STAGE_HEIGHT - exp.size,
                exp.size * STAGE_WIDTH / STAGE_HEIGHT,
                exp.size
            );
        }

        ctx.globalAlpha = 1.0;

        // Увеличиваем размер и удаляем, когда станет слишком большим
        exp.size += 20;
        if (exp.size > STAGE_HEIGHT) {
            explosions.splice(i, 1);
        }
    }
}

// Основная функция, вызываемая каждый кадр
function engineStep() {
    // 1. Рисуем фон
    ctx.drawImage(backgroundImage, 0, 0);

    // 2. Управление ИИ: если мышь не двигалась более AI_TIMEOUT, включаем автоприцел
    if (!aiEnabled && lastMouseMoveTime < Date.now() - AI_TIMEOUT) {
        aiEnabled = true;
    }

    // 3. Стрельба с интервалом
    shotCounter++;
    if (shotCounter >= SHOT_INTERVAL) {
        shotCounter = 0;
        bullets.push(createBullet());
    }

    // 4. Обновление пуль
    updateBullets();

    // 5. Обновление врагов
    updateEnemies();

    // 6. Проверка столкновений пуль с врагами
    checkCollisions();

    // 7. Наведение прицела (ИИ или мышь)
    updateAim();

    // 8. Отрисовка пушки (большая стрела в нижнем центре)
    drawArrow(
        CENTER_X, CENTER_Y,
        CENTER_X - Math.sin(aimAngle) * 150,
        CENTER_Y - Math.cos(aimAngle) * 150,
        30, 20,
        '#2c3e50'
    );

    // 9. Обработка взрывов
    updateExplosions();
}

// ================================ ОБРАБОТЧИКИ СОБЫТИЙ ================================

// Обновление координат указателя
function handlePointerStart(e) {
    // Ничего не делаем, просто запоминаем позицию (в оригинале была функция motchstart)
    updatePointerPosition(e);
}

function handlePointerMove(e) {
    updatePointerPosition(e);
    aiEnabled = false;
    lastMouseMoveTime = Date.now();
}

function handlePointerEnd(e) {
    // Ничего не делаем (в оригинале motchend пустая)
}

function updatePointerPosition(e) {
    const clientX = e.clientX !== undefined ? e.clientX : e.pageX;
    const clientY = e.clientY !== undefined ? e.clientY : e.pageY;
    pointer.x = (clientX - leftOffset) * scale;
    pointer.y = (clientY - topOffset) * scale;
}

// Мышь
window.addEventListener('mousedown', handlePointerStart);
window.addEventListener('mousemove', handlePointerMove);
window.addEventListener('mouseup', handlePointerEnd);

// Тач
window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handlePointerStart(e.touches[0]);
});
window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handlePointerMove(e.touches[0]);
});
window.addEventListener('touchend', (e) => {
    e.preventDefault();
    handlePointerEnd(e.touches[0]);
});

// ================================ АДАПТАЦИЯ РАЗМЕРА CANVAS ================================
function resizeCanvas() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const stageRatio = STAGE_WIDTH / STAGE_HEIGHT;

    if (windowWidth <= windowHeight * stageRatio) {
        // Портретная ориентация или узкое окно – ширина подстраивается под ширину окна
        portrait = true;
        scale = STAGE_WIDTH / windowWidth;
        leftOffset = 0;
        topOffset = Math.floor((windowHeight - windowWidth / stageRatio) / 2);
        canvas.style.width = windowWidth + 'px';
        canvas.style.height = Math.floor(windowWidth / stageRatio) + 'px';
    } else {
        // Ландшафтная – высота подстраивается под высоту окна
        scale = STAGE_HEIGHT / windowHeight;
        portrait = false;
        leftOffset = Math.floor((windowWidth - windowHeight * stageRatio) / 2);
        topOffset = 0;
        canvas.style.height = windowHeight + 'px';
        canvas.style.width = Math.floor(windowHeight * stageRatio) + 'px';
    }
    canvas.style.marginLeft = leftOffset + 'px';
    canvas.style.marginTop = topOffset + 'px';
}

// Следим за изменением размера окна
window.addEventListener('resize', resizeCanvas);

// ================================ АНИМАЦИОННЫЙ ЦИКЛ ================================
// Полифилл для requestAnimationFrame
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(callback) { window.setTimeout(callback, 1000 / 60); };
})();

function animate() {
    requestAnimFrame(animate);

    // Тряска экрана
    if (shakeActive) {
        shakeOffsetX = (Math.random() * 60) - 30;
        shakeOffsetY = (Math.random() * 60) - 30;
        ctx.translate(shakeOffsetX, shakeOffsetY);
    }

    // Основной шаг игры
    engineStep();

    // Возврат после тряски
    if (shakeActive) {
        ctx.translate(-shakeOffsetX, -shakeOffsetY);
        shakeFrame++;
        if (shakeFrame > SHAKE_DURATION) {
            shakeActive = false;
            shakeFrame = 0;
        }
    }
}

// Запуск
resizeCanvas();
animate();

// ================================ НЕИСПОЛЬЗУЕМЫЕ ФУНКЦИИ (СОХРАНЕНЫ ДЛЯ ИСТОРИИ) ================================
/*
function toggleFullScreen() {
    // Полноэкранный режим (не используется в игре)
    const doc = window.document;
    const docEl = doc.documentElement;
    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    } else {
        cancelFullScreen.call(doc);
    }
}

// Счётчик FPS (закомментирован, оставлен для возможного использования)
let lastCalledTime;
let frameCount = 0;
let fpsSum = 0;
let smoothFps = 60;
let currentFps = 60;

function updateFPS() {
    frameCount++;
    if (!lastCalledTime) {
        lastCalledTime = Date.now();
        return;
    }
    const delta = (Date.now() - lastCalledTime) / 1000;
    lastCalledTime = Date.now();
    const fps = 1 / delta;
    fpsSum += fps;
    if (frameCount >= 30) {
        currentFps = Math.floor((fpsSum / frameCount) * 10) / 10;
        frameCount = 0;
        fpsSum = 0;
    }
    // Здесь можно было бы отрисовывать FPS, но в игре это закомментировано
}
*/