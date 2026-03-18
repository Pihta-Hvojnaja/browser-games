'use strict';

// ============================================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И НАСТРОЙКИ СЦЕНЫ
// ============================================================================

// Размер игрового поля (в пикселях)
const stage = {
  w: 1280,
  h: 720
};

// Получаем элемент canvas и его контекст
var _pexcanvas = document.querySelector('.arena');
var canvas = document.querySelector('.arena');
_pexcanvas.width = stage.w;
_pexcanvas.height = stage.h;
var ctx = _pexcanvas.getContext('2d');

// Координаты указателя (мыши / касания)
var pointer = {
  x: 0,
  y: 0
};

// Переменные для адаптации canvas под размер окна
var scale = 1;          // текущий масштаб
var portrait = true;    // флаг портретной ориентации
var loffset = 0;        // отступ слева (для центрирования)
var toffset = 0;        // отступ сверху
var mxpos = 0;          // вспомогательные переменные для положения мыши
var mypos = 0;

// ============================================================================
// ФУНКЦИЯ ОТРИСОВКИ СТРЕЛКИ
// ============================================================================

/**
 * Рисует стрелку от точки (fromx, fromy) до (tox, toy)
 * @param {number} fromx - начальная X
 * @param {number} fromy - начальная Y
 * @param {number} tox   - конечная X
 * @param {number} toy   - конечная Y
 * @param {number} lw    - толщина линии
 * @param {number} hlen  - длина наконечника
 * @param {string} color - цвет
 */
function drawArrow(fromx, fromy, tox, toy, lw, hlen, color) {
  /**
   * Вычисляем катеты
   * Зная катеты, мы можем вычислить гипотенузу, которая будет равна длине стрелки
   */
  var dx = tox - fromx;
  var dy = toy - fromy;

  /**
   * Вычисляем катеты
   */
  var angle = Math.atan2(dy, dx);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = lw;
  // Линия
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.stroke();
  // Наконечник (перо)
  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - hlen * Math.cos(angle - Math.PI / 6), toy - hlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(tox - hlen * Math.cos(angle) / 2, toy - hlen * Math.sin(angle) / 2);
  ctx.lineTo(tox - hlen * Math.cos(angle + Math.PI / 6), toy - hlen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

// Палитра цветов для фоновых стрел
var colors = ['#1abc9c','#1abc9c','#3498db','#9b59b6','#34495e','#16a085','#27ae60','#2980b9','#8e44ad','#2c3e50','#f1c40f','#e67e22','#e74c3c','#95a5a6','#f39c12','#d35400','#c0392b','#bdc3c7','#7f8c8d'];

// ============================================================================
// ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ ДЛЯ ВЗРЫВОВ И ФОНА
// ============================================================================

// --- Взрыв типа 1 (красные стрелы, от центра в стороны) ---
ctx.clearRect(0, 0, stage.w, stage.h);
for (var i = 0; i < 200; i++) {
  var angle = Math.random() * Math.PI * 2;
  var length = Math.random() * 250 + 50;
  var myx = 360 + Math.sin(angle) * length;
  var myy = 360 - Math.cos(angle) * length;
  drawArrow(myx, myy, myx + length / 6 * Math.sin(angle), myy - length / 6 * Math.cos(angle), length / 30, length / 30, '#c0392b');
}
var explode = new Image();
explode.src = canvas.toDataURL('image/png');

// --- Взрыв типа 2 (синие стрелы, из нижнего центра вверх) ---
ctx.clearRect(0, 0, stage.w, stage.h);
for (var i = 0; i < 200; i++) {
  var angle = Math.random() * Math.PI - Math.PI / 2;
  var length = Math.random() * 480 + 50;
  var myx = stage.w / 2 + Math.sin(angle) * length;
  var myy = stage.h - Math.cos(angle) * length;
  drawArrow(myx, myy, myx + length / 6 * Math.sin(angle), myy - length / 6 * Math.cos(angle), length / 30, length / 30, '#2c3e50');
}
var explodeb = new Image();
explodeb.src = canvas.toDataURL('image/png');

// --- Фоновое изображение (случайные стрелы) ---
ctx.clearRect(0, 0, stage.w, stage.h);
ctx.fillStyle = 'rgba(236,240,241,1)';
ctx.fillRect(0, 0, stage.w, stage.h);
for (var i = 0; i < 200; i++) {
  var angle = Math.random() * Math.PI; // от 0 до 180 градусов
  var length = Math.random() * 250 + 50;
  var myx = Math.random() * stage.w;
  var myy = Math.random() * stage.h;
  drawArrow(myx, myy, myx + length / 6 * Math.sin(angle), myy - length / 6 * Math.cos(angle), length / 30, length / 30, colors[Math.floor(Math.random() * colors.length)]);
}
ctx.fillStyle = 'rgba(236,240,241,0.9)';
ctx.fillRect(0, 0, stage.w, stage.h);
var back = new Image();
back.src = canvas.toDataURL('image/png');

// ============================================================================
// ИГРОВЫЕ ПЕРЕМЕННЫЕ И ОБЪЕКТЫ
// ============================================================================

var angle = 0;               // текущий угол наклона пушки
var ai = true;               // флаг автоприцеливания (true – включен)
var ait = 0;                 // время последнего движения мыши (для отключения ИИ)
var btm = 0;                 // счётчик кадров для стрельбы
var bullets = [];            // массив пуль

// Конструктор пули
function Bullet() {
  this.x = stage.w / 2 - Math.sin(angle) * 150;
  this.y = stage.h - Math.cos(angle) * 150;
  this.r = angle;           // направление пули
}

var enemies = [];             // массив врагов

// Конструктор врага
function Enemy() {
  // Угол направления к центру (диапазон примерно от -72° до +72°)
  this.r = Math.random() * Math.PI / (2.5 / 2) - Math.PI / 2.5;
  this.dis = Math.random() * 1280 + 720; // расстояние от центра
  this.x = stage.w / 2 - Math.sin(this.r) * this.dis;
  this.y = stage.h - Math.cos(this.r) * this.dis;
}

// Создаём 10 врагов со смещением (чтобы они появлялись не сразу на границе)
for (var i = 0; i < 10; i++) {
  enemies.push(new Enemy());
  enemies[i].x += Math.sin(enemies[i].r) * 300;
  enemies[i].y += Math.cos(enemies[i].r) * 300;
}

// Массив взрывов
var explosions = [];

// Конструктор взрыва
function Explosion(x, y, ty) {
  this.x = x;
  this.y = y;
  this.t = 30;      // начальный размер
  this.ty = ty;     // тип (1 – красный, 2 – синий)
}

var eturn = 0;        // индекс ближайшего врага для ИИ
var cold = [];        // вспомогательный массив для сортировки врагов по расстоянию

// ============================================================================
// ОСНОВНОЙ ИГРОВОЙ ЦИКЛ
// ============================================================================

function enginestep() {
  // Рисуем фон
  ctx.drawImage(back, 0, 0);

  // Если ИИ был выключен и прошло более 3 секунд без движения мыши – включаем его
  if (!ai && ait < Date.now() - 3000) {
    ai = true;
  }

  // Стрельба с интервалом (каждые 8 кадров)
  btm++;
  if (btm > 8) {
    btm = 0;
    bullets.push(new Bullet());
  }

  // Обновление и отрисовка пуль
  for (var i = 0; i < bullets.length; i++) {
    bullets[i].x -= Math.sin(bullets[i].r) * 20;
    bullets[i].y -= Math.cos(bullets[i].r) * 20;
    drawArrow(bullets[i].x + Math.sin(bullets[i].r) * 50, bullets[i].y + Math.cos(bullets[i].r) * 50, bullets[i].x, bullets[i].y, 8, 8, '#2980b9');
    // Удаление пули, если она улетела за границы
    if (bullets[i].x < -100 || bullets[i].x > stage.w + 100 || bullets[i].y < -100 || bullets[i].y > stage.h + 100) {
      bullets.splice(i, 1);
      i--; // после удаления сдвигаем индекс
    }
  }

  // Обновление и отрисовка врагов
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].x += Math.sin(enemies[i].r) * 3;
    enemies[i].y += Math.cos(enemies[i].r) * 3;
    drawArrow(enemies[i].x - Math.sin(enemies[i].r) * 100, enemies[i].y - Math.cos(enemies[i].r) * 100, enemies[i].x, enemies[i].y, 15, 15, '#c0392b');

    // Проверка, достиг ли враг нижнего края (центра)
    if (enemies[i].y > stage.h) {
      enemies[i] = new Enemy();                 // замена новым врагом
      explosions.push(new Explosion(stage.w / 2, stage.h, 2)); // синий взрыв в центре
      shake = true;                             // включаем тряску экрана
      shaket = 0;
    }

    // Проверка столкновений пуль с врагами
    for (var b = 0; b < bullets.length; b++) {
      var dx = enemies[i].x - bullets[b].x;
      var dy = enemies[i].y - bullets[b].y;
      var dis = dx * dx + dy * dy;
      if (dis < 20 * 20) {   // если расстояние меньше 20 пикселей
        explosions.push(new Explosion(enemies[i].x, enemies[i].y, 1)); // красный взрыв
        enemies[i] = new Enemy();   // заменяем врага
        enemies[i].x += Math.sin(enemies[i].r) * 300;
        enemies[i].y += Math.cos(enemies[i].r) * 300;
        bullets.splice(b, 1);       // удаляем пулю
        break;                       // выходим из внутреннего цикла
      }
    }
  }

  // --- Автоматическое наведение (ИИ) ---
  if (ai) {
    // Для каждого врага вычисляем расстояние до центра и формируем строку для сортировки
    for (var l = 0; l < enemies.length; l++) {
      var dx = enemies[l].x - stage.w / 2;
      var dy = enemies[l].y - stage.h;
      var dis = Math.floor(Math.sqrt(dx * dx + dy * dy));
      var val1 = 100000 + dis;   // добавляем большое число, чтобы расстояние было ведущим
      var val2 = 1000 + l;        // индекс врага с добавкой для уникальности
      cold[l] = val1 + 'x' + val2;
    }

    cold.sort(); // сортируем по расстоянию (чем меньше расстояние, тем раньше в массиве)

    // Извлекаем индекс ближайшего врага (он находится в конце строки после 'x')
    eturn = parseInt(cold[0].slice(8, 11)); // 8..11 – позиция индекса (1000+индекс)
    // Если расстояние до центра меньше 800, плавно поворачиваем пушку в сторону врага
    if (parseInt(cold[0].slice(1, 6)) < 800) {
      angle += (enemies[eturn].r - angle) / 8;
    }
  } else {
    // Ручное управление: угол рассчитывается по положению указателя
    var dx = pointer.x - stage.w / 2;
    var dy = pointer.y - stage.h;
    angle = Math.atan(dx / dy);
  }

  // Отрисовка пушки (большая стрела в нижнем центре)
  drawArrow(stage.w / 2, stage.h, stage.w / 2 - Math.sin(angle) * 150, stage.h - Math.cos(angle) * 150, 30, 20, '#2c3e50');

  // --- Обработка взрывов ---
  for (var e = 0; e < explosions.length; e++) {
    var myimg = (explosions[e].ty == 1) ? explode : explodeb;
    ctx.globalAlpha = 1 - (explosions[e].t / stage.h); // прозрачность растёт с размером

    if (explosions[e].ty == 1) {
      // Красный взрыв – расширяется от центра
      ctx.drawImage(myimg, explosions[e].x - explosions[e].t / 2, explosions[e].y - explosions[e].t / 2, explosions[e].t * stage.w / stage.h, explosions[e].t);
    } else {
      // Синий взрыв (в центре снизу) – рисуется иначе
      ctx.drawImage(myimg, explosions[e].x - explosions[e].t * stage.w / stage.h / 2, stage.h - explosions[e].t, explosions[e].t * stage.w / stage.h, explosions[e].t);
    }

    ctx.globalAlpha = 1;
    explosions[e].t += 20; // увеличиваем размер

    // Удаляем взрыв, когда он станет слишком большим
    if (explosions[e].t > stage.h) {
      explosions.splice(e, 1);
      e--;
    }
  }
}

// ============================================================================
// ОБРАБОТЧИКИ СОБЫТИЙ МЫШИ / ТАЧА
// ============================================================================

// Переключение полноэкранного режима (не используется в игре, но оставлено)
function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  } else {
    cancelFullScreen.call(doc);
  }
}

// Сохранение позиции указателя при начале касания/нажатия
function motchstart(e) {
  mxpos = (e.pageX - loffset) * scale;
  mypos = (e.pageY - toffset) * scale;
}

// Обновление позиции при движении – выключаем ИИ и запоминаем время
function motchmove(e) {
  mxpos = (e.pageX - loffset) * scale;
  mypos = (e.pageY - toffset) * scale;
  pointer.x = mxpos;
  pointer.y = mypos;
  ai = false;
  ait = Date.now();
}

function motchend(e) {
  // Ничего не делаем
}

// Подключаем события мыши
window.addEventListener('mousedown', motchstart);
window.addEventListener('mousemove', motchmove);
window.addEventListener('mouseup', motchend);

// Подключаем события касания (с предотвращением прокрутки)
window.addEventListener('touchstart', function(e) {
  e.preventDefault();
  motchstart(e.touches[0]);
});
window.addEventListener('touchmove', function(e) {
  e.preventDefault();
  motchmove(e.touches[0]);
});
window.addEventListener('touchend', function(e) {
  e.preventDefault();
  motchend(e.touches[0]);
});

// ============================================================================
// ФУНКЦИЯ АДАПТАЦИИ CANVAS ПОД РАЗМЕР ОКНА
// ============================================================================

function _pexresize() {
  var cw = window.innerWidth;
  var ch = window.innerHeight;
  if (cw <= ch * stage.w / stage.h) {
    portrait = true;
    scale = stage.w / cw;
    loffset = 0;
    toffset = Math.floor(ch - (cw * stage.h / stage.w)) / 2;
    _pexcanvas.style.width = cw + 'px';
    _pexcanvas.style.height = Math.floor(cw * stage.h / stage.w) + 'px';
    _pexcanvas.style.marginLeft = loffset + 'px';
    _pexcanvas.style.marginTop = toffset + 'px';
  } else {
    scale = stage.h / ch;
    portrait = false;
    loffset = Math.floor(cw - (ch * stage.w / stage.h)) / 2;
    toffset = 0;
    _pexcanvas.style.height = ch + 'px';
    _pexcanvas.style.width = Math.floor(ch * stage.w / stage.h) + 'px';
    _pexcanvas.style.marginLeft = loffset + 'px';
    _pexcanvas.style.marginTop = toffset + 'px';
  }
}

// ============================================================================
// АНИМАЦИОННЫЙ ЦИКЛ
// ============================================================================

// Тряска экрана
var shake = false;
var shaket = 0;

function animated() {
  requestAnimationFrame(animated);

  // Если активна тряска, смещаем контекст
  if (shake) {
    var trax = Math.random() * 60 - 30;
    var tray = Math.random() * 60 - 30;
    ctx.translate(trax, tray);
  }

  // Выполняем один шаг игры
  enginestep();

  // Возвращаем контекст обратно и обновляем счётчик тряски
  if (shake) {
    ctx.translate(-trax, -tray);
    shaket++;
    if (shaket > 20) {
      shaket = 0;
      shake = false;
    }
  }
}

// ============================================================================
// ЗАПУСК
// ============================================================================

// Подключаем обработчик ресайза и вызываем его сразу для установки размера
window.addEventListener('resize', _pexresize);
_pexresize();

// Запускаем анимацию
animated();
