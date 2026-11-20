/* ХЛОПУШКА — тема, звук, каталог, рекорды и 29 игр */
'use strict';
const $ = s => document.querySelector(s);
const mk = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e };
const rnd = n => Math.floor(Math.random() * n);
/* Иконки Bootstrap Icons: <i class="bi bi-..."> */
const ic = n => `<i class="bi bi-${n}"></i>`;
const mark = p => ic(p === 'X' ? 'x-lg' : 'circle');
const root = document.documentElement;

/* Хранилище (localStorage) */
let PRE = (() => { try { const s = localStorage.getItem('hl-session'); return s ? 'hl:u:' + s + ':' : 'hl:' } catch (e) { return 'hl:' } })(); /* у каждого аккаунта свои настройки и рекорды */
const store = {
  get(k, d) { try { const v = localStorage.getItem(PRE + k); return v === null ? d : JSON.parse(v) } catch (e) { return d } },
  set(k, v) { try { localStorage.setItem(PRE + k, JSON.stringify(v)) } catch (e) {} }
};

/* Фото для карточек: вставьте ПРЯМЫЕ ссылки на изображения (images.pexels.com / images.unsplash.com).
   Пока поле пустое, карточка показывает цветную плитку с иконкой. */
const PHOTOS = { ttt: '', snake: '', mines: '', g2048: '', memory: '', react: '', rps: '', whack: '', simon: '', guess: '', math: '', four: '', slide: '', hang: '', lights: '', stroop: '', brk: '' };

/* ---------- Тема ---------- */
let theme = store.get('theme', 'light');
const setTheme = t => { root.dataset.theme = theme = t; store.set('theme', t) };
setTheme(theme);
$('#theme').onclick = () => setTheme(theme === 'light' ? 'dark' : 'light');

/* Цветовые схемы: [id, название, 4 цвета для образца] */
const ACC = [['', 'Молочная', ['#f2917b', '#94d1b6', '#f7cf6e', '#a8bdf2']], ['rasp', 'Малина', ['#e0527d', '#f4a9c0', '#ffd1a8', '#c9a8e8']], ['gold', 'Золото', ['#c98a1a', '#a8b26a', '#f3d36b', '#e4c99a']],
  ['silver', 'Моно-серебро', ['#8a8e96', '#b7bac0', '#d4d6da', '#a1a5ad']], ['mint', 'Мята', ['#4fb286', '#8fd9b6', '#e8e19a', '#8fc8d9']], ['lav', 'Лаванда', ['#9a7de0', '#c3b1f0', '#f0c9e8', '#8fa5ee']], ['sea', 'Море', ['#2f8fb8', '#67c8bd', '#f4d58a', '#8fb8f0']],
  ['peach', 'Персик', ['#f08a5d', '#f7b58f', '#ffd9a0', '#f2a6a0']], ['cherry', 'Вишня', ['#c9283f', '#e8798a', '#f4b69b', '#a46a9f']], ['forest', 'Лес', ['#3f8f55', '#8cc085', '#e0d58a', '#7fb0a8']],
  ['coffee', 'Кофе', ['#a8693c', '#c9a27a', '#e3c88e', '#8d9a7a']], ['sunset', 'Закат', ['#e8603c', '#f4a259', '#ffd166', '#b5679b']], ['candy', 'Конфета', ['#f06bb0', '#8fd8e8', '#ffe27a', '#a99cf2']]];
let accent = store.get('accent', '');
function setAccent(a) {
  accent = a; if (a) root.dataset.accent = a; else delete root.dataset.accent; store.set('accent', a);
  const p = $('#pals'); p.innerHTML = '';
  ACC.forEach(([id, n, cs]) => { const k = mk('button', 'pl' + (id === accent ? ' on' : ''), `<i style="background:linear-gradient(90deg,${cs.map((c, i) => `${c} ${i * 25}% ${i * 25 + 25}%`).join(',')})"></i>${n}`); k.onclick = () => setAccent(id); p.append(k) });
}
setAccent(accent);

/* ---------- Звук ---------- */
let sound = store.get('sound', true), ac;
const syncSnd = () => { $('#snd').innerHTML = ic(sound ? 'volume-up-fill' : 'volume-mute-fill') };
$('#snd').onclick = () => { sound = !sound; store.set('sound', sound); syncSnd(); beep(660) };
/* Тембр каждой игры: [форма волны, множитель высоты] */
const VOICE = { ttt: ['triangle', 1], snake: ['square', 1.15], mines: ['sawtooth', .75], g2048: ['sine', 1.5], memory: ['triangle', 1.3], react: ['square', .9], rps: ['sawtooth', 1], whack: ['square', 1.6], simon: ['sine', 1], guess: ['triangle', .8], math: ['sine', 1.2], four: ['triangle', 1.1], slide: ['sine', 1.1], hang: ['square', .8], lights: ['triangle', 1.4], stroop: ['square', 1.3], brk: ['square', 1] };
Object.assign(VOICE, { schulte: ['triangle', 1.2], digits: ['sine', 1.3], aim: ['square', 1.4], caps: ['triangle', 1], ana: ['sine', 1.1], bj: ['triangle', .9] });
Object.assign(VOICE, { tetris: ['square', 1], flap: ['sine', 1.1], flood: ['sine', 1.2], maze: ['triangle', 1.3], hanoi: ['triangle', .8], pong: ['square', .9] });
function beep(f = 440, d = .09, type = 'sine', slide = 0, vol = .12) {
  if (!sound) return;
  try {
    ac = ac || new AudioContext();
    const v = cur && !$('#stage').hidden && VOICE[cur.id];
    if (v && type !== 'sawtooth') { type = v[0]; f *= v[1]; if (slide) slide *= v[1] }
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g).connect(ac.destination); o.start(); o.stop(t + d);
  } catch (e) {}
}
/* шум: хлопок, взрыв, барабан */
function noise(d = .3, f0 = 4000, f1 = 400, vol = .3, delay = 0) {
  if (!sound) return;
  try {
    ac = ac || new AudioContext();
    const n = ac.sampleRate * d | 0, buf = ac.createBuffer(1, n, ac.sampleRate), a = buf.getChannelData(0);
    for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3;
    const s = ac.createBufferSource(), g = ac.createGain(), fl = ac.createBiquadFilter(), t = ac.currentTime + delay;
    fl.type = 'lowpass'; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + d);
    g.gain.value = vol; s.buffer = buf; s.connect(fl).connect(g).connect(ac.destination); s.start(t);
  } catch (e) {}
}
const bang = () => { noise(.35, 6000, 300, .6); beep(170, .22, 'sine', 40, .4); noise(.7, 9000, 2500, .12, .1) }; /* хлопок + шорох конфетти */
const jingle = () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .2, 'triangle', 0, .1), i * 90));
/* Инструменты Саймона: [название, волна, атака, длина, срез фильтра, вибрато] */
const INST = [['Гитара', 'sawtooth', .005, .8, 1600, 0], ['Саксофон', 'sawtooth', .07, .6, 1100, 6], ['Пианино', 'triangle', .005, 1, 3500, 0], ['Труба', 'square', .04, .5, 2000, 0], ['Флейта', 'sine', .09, .6, 3000, 5], ['Барабан'], ['Колокольчик', 'sine', .003, 1.1, 6000, 0], ['Бас', 'square', .01, .6, 500, 0]];
function play(k, f) {
  if (!sound) return;
  if (k === 5) { noise(.18, 3500, 250, .6); return beep(150, .16, 'sine', 50, .35) }
  try {
    ac = ac || new AudioContext(); const [, ty, at, d, cut, vib] = INST[k], t = ac.currentTime;
    if (k === 6) f *= 2; if (k === 7) f /= 2;
    const o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter();
    o.type = ty; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = cut;
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = vib; lg.gain.value = f * .02; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + d) }
    g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.22, t + at); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(fl).connect(g).connect(ac.destination); o.start(t); o.stop(t + d);
  } catch (e) {}
}

/* ---------- Конфетти по вывеске ---------- */
const burst = e => {
  const cols = ['--coral', '--mint', '--sun', '--sky'];
  for (let i = 0; i < 28; i++) {
    const p = mk('i', 'cf'), a = Math.random() * 6.28, r = 60 + Math.random() * 160;
    p.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;background:var(${cols[i % 4]});--x:${Math.cos(a) * r}px;--y:${Math.sin(a) * r + 60}px;--rot:${rnd(720)}deg`;
    document.body.append(p); setTimeout(() => p.remove(), 1000);
  }
  if (!e.q) bang();
};
$('#logo').onclick = e => { burst(e); cheer() };
$('#pop').onclick = () => { const r = $('#pop').getBoundingClientRect(); burst({ clientX: r.left + r.width * .6, clientY: r.top + r.height * .35 }); parade() };
/* после клика кнопка теряет фокус — никаких рамок и линий */
document.addEventListener('click', e => { const b = e.target.closest('button'); if (b) b.blur() });

/* Болельщики выглядывают из боков экрана, когда хлопаешь по вывеске */
/* Болельщики: подробные человечки с лицом, причёской, одеждой и машущими руками */
const INK = 'var(--ink)';
const HAIR = c => `<path d="M21.5 27q-1.5-16 13.5-16t13.5 16q-3-6-5-7-5 3-8.5 3t-8.5-3q-2 1-5 7z" fill="${c}"/>`;
const FIG0 = o => {
  const { skin = '#f3cfae', top, bot = '#4c5d82', back = '', front = '', beard = '', acc = '', deco = '' } = o;
  const arm = (x1, y1, x2, y2, k, d) => `<g class="arm" style="--k:${k};transform-origin:${x1}px ${y1}px;animation-delay:${d}s"><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${INK}" stroke-width="11.5" fill="none"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${top}" stroke-width="6.5" fill="none"/><circle cx="${x2 + (x2 - x1) * .1}" cy="${y2 + (y2 - y1) * .1}" r="5.2" fill="${skin}"/><ellipse cx="${x2 + (x2 - x1) * .1 + (x1 < x2 ? -4 : 4)}" cy="${y2 + (y2 - y1) * .1 + 2}" rx="1.7" ry="2.8" fill="${skin}" stroke-width="1.4"/></g>`;
  return `<svg viewBox="0 0 70 108" width="92" height="142"><g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">`
    + `<rect x="19" y="64" width="13" height="33" rx="5" fill="${bot}"/><rect x="38" y="64" width="13" height="33" rx="5" fill="${bot}"/>`
    + `<rect x="14" y="94" width="20" height="10" rx="5" fill="#fff"/><rect x="36" y="94" width="20" height="10" rx="5" fill="#fff"/>`
    + arm(21, 55, 7, 30, 1, 0) + arm(49, 55, 63, 30, -1, .17)
    + `<path d="M17 60q0-12 9-13h18q9 1 9 13v11q0 4-4 4H21q-4 0-4-4z" fill="${top}"/>${deco}`
    + `<rect x="31" y="38" width="8" height="11" rx="2" fill="${skin}"/><circle cx="22" cy="29" r="3.2" fill="${skin}"/><circle cx="48" cy="29" r="3.2" fill="${skin}"/>`
    + `${back}<ellipse cx="35" cy="28" rx="13" ry="14.5" fill="${skin}"/>${beard}`
    + `<g stroke="none"><ellipse cx="29.5" cy="29" rx="3.2" ry="3.1" fill="#fff"/><ellipse cx="40.5" cy="29" rx="3.2" ry="3.1" fill="#fff"/><circle cx="30" cy="29.5" r="1.9" fill="#2b2620"/><circle cx="40" cy="29.5" r="1.9" fill="#2b2620"/><circle cx="30.6" cy="28.7" r=".75" fill="#fff"/><circle cx="40.6" cy="28.7" r=".75" fill="#fff"/><circle cx="25.5" cy="34" r="2.6" fill="#f2917b" opacity=".5"/><circle cx="44.5" cy="34" r="2.6" fill="#f2917b" opacity=".5"/></g>`
    + `<path d="M26 24.6q3.5-2.2 7 0M37 24.6q3.5-2.2 7 0" fill="none" stroke-width="1.8"/><path d="M35.2 31.4q-1.8 2.8.6 3" fill="none" stroke-width="1.4" opacity=".6"/>`
    + `<path d="M29 35q6 7 12 0z" fill="#8a2f2f" stroke-width="1.8"/><ellipse cx="35" cy="37" rx="2.8" ry="1.2" fill="#f08a8a" stroke="none"/>`
    + `${front}${acc}</g></svg>`;
};
const EXTRA = '<g fill="none" stroke-width="1" opacity=".55"><path d="M20 96.5l5 2M25 96l-5 2.5M45 96.5l5 2M50 96l-5 2.5M15 101.5h18M37 101.5h18"/><path d="M25.5 78v15M44.5 78v15"/><path d="M21 28.5q1.6 1 0 3M49 28.5q-1.6 1-0 3"/><path d="M26.4 28.6l-1.8-.8M26.8 27l-1.4-1.2M43.6 28.6l1.8-.8M43.2 27l1.4-1.2" opacity="1"/></g><path d="M44 49q9 1 9 12v11q0 3-4 3h-5z" fill="#000" opacity=".09" stroke="none"/><path d="M30.5 36.2h9" stroke="#fff" stroke-width="1.5" opacity=".9"/>';
const FIG = o => FIG0(o).replace('</g></svg>', EXTRA + '</g></svg>');
const CROWD = [
  /* бабушка в очках */
  [FIG({
    skin: '#f1cdb0', top: 'var(--coral)', bot: '#6b5b7a',
    back: '<circle cx="35" cy="9" r="7" fill="#d9d5cc"/><path d="M32 8q3-3 6 0" fill="none" stroke-width="1.4"/>',
    front: HAIR('#d9d5cc'),
    acc: '<g fill="rgba(200,230,255,.35)" stroke-width="1.6"><circle cx="29.5" cy="29" r="5"/><circle cx="40.5" cy="29" r="5"/><path d="M34.5 28.5h1M24.5 27.5l-3-1M45.5 27.5l3-1" fill="none"/></g>',
    deco: '<path d="M29 47l6 8 6-8" fill="#fff" stroke-width="1.8"/><path d="M35 55v20" fill="none" stroke-width="1.8"/><circle cx="31.5" cy="61" r="1.4" fill="#3d3329" stroke="none"/><circle cx="31.5" cy="69" r="1.4" fill="#3d3329" stroke="none"/><circle cx="42" cy="57" r="2.6" fill="var(--sun)" stroke-width="1.5"/>'
  }), 'Ура!'],
  /* болельщик в кепке и шарфе */
  [FIG({
    skin: '#e3b48f', top: '#4a6fb5', bot: '#2f3b5a',
    front: '<path d="M21.5 26q-1.5-16 13.5-16t13.5 16z" fill="#c9453a"/><path d="M44 25q10-2.5 14 2.5-9 2.5-15 .5z" fill="#a8332a"/><circle cx="35" cy="10.5" r="1.7" fill="#a8332a" stroke-width="1.2"/>',
    deco: '<text x="35" y="70" text-anchor="middle" font-family="Unbounded,sans-serif" font-weight="900" font-size="12" fill="#fff" stroke="none">7</text><path d="M26 47h18l1 7H25z" fill="#fff" stroke-width="1.8"/><path d="M29.5 47.5v6M35 47.5v6M40.5 47.5v6" fill="none" stroke="#c9453a" stroke-width="2"/>'
  }), 'Так держать!'],
  /* повар с усами */
  [FIG({
    skin: '#f3cfae', top: '#fff', bot: '#3d3d46',
    front: '<path d="M25 19c-9 0-10-10-3-12 2-7 10-7 13-2 3-5 11-5 13 2 7 2 6 12-3 12z" fill="#fff"/><rect x="24" y="16" width="22" height="7" rx="2" fill="#fff"/>',
    acc: '<path d="M28.5 34q3.2-3.6 6.5-.6q3.3-3 6.5.6q-3.3 3.6-6.5 1q-3.2 2.6-6.5-1z" fill="#4a3b30" stroke-width="1.4"/>',
    deco: '<path d="M35 52v22" fill="none" stroke-width="1.6"/><circle cx="30" cy="58" r="1.5" fill="#3d3329" stroke="none"/><circle cx="30" cy="66" r="1.5" fill="#3d3329" stroke="none"/><path d="M29 47h12l-6 7z" fill="var(--coral)" stroke-width="1.6"/>'
  }), 'Браво!'],
  /* девочка с хвостиками и бантами */
  [FIG({
    skin: '#f6d6b8', top: 'var(--sun)', bot: '#f6d6b8',
    back: '<path d="M23 22q-13 3-13 20 0 6 4 6 3-6 6-12z" fill="#6b3f26"/><path d="M47 22q13 3 13 20 0 6-4 6-3-6-6-12z" fill="#6b3f26"/>',
    front: HAIR('#6b3f26'),
    acc: '<path d="M14 17l7 5-7 5zM28 17l-7 5 7 5zM42 17l7 5-7 5zM56 17l-7 5 7 5z" fill="var(--coral)" stroke-width="1.6"/>',
    deco: '<path d="M18 68h34l6 12H12z" fill="var(--sun)"/><circle cx="22" cy="74" r="1.7" fill="#fff" stroke="none"/><circle cx="35" cy="76" r="1.7" fill="#fff" stroke="none"/><circle cx="48" cy="74" r="1.7" fill="#fff" stroke="none"/><path d="M29 47l6 6 6-6" fill="#fff" stroke-width="1.8"/>'
  }), 'Хлоп-хлоп!'],
  /* бородач в шапке и худи */
  [FIG({
    skin: '#c58c64', top: 'var(--mint)', bot: '#3c4a40',
    beard: '<path d="M22.5 31q0 15 12.5 15t12.5-15q-2 8-12.5 8.5t-12.5-8.5z" fill="#4a3226" stroke-width="1.8"/>',
    front: '<path d="M21 26q-1-15 14-15t14 15z" fill="#d9604c"/><rect x="20" y="22" width="30" height="6" rx="3" fill="#b94a39"/><circle cx="35" cy="8" r="4.5" fill="#f2b8a8"/>',
    deco: '<path d="M30 47q0 8 1 12M40 47q0 8-1 12" fill="none" stroke-width="1.6"/><path d="M24 66h22l-2 8H26z" fill="none" stroke-width="1.6"/>'
  }), 'Ого!'],
  /* именинник в праздничном колпаке */
  [FIG({
    skin: '#a8714b', top: 'var(--sky)', bot: '#7a4f8f',
    front: HAIR('#2b2118'),
    acc: '<path d="M27 17L35 1l8 16z" fill="var(--coral)"/><path d="M29.4 12.5h11.2M32 7h6" fill="none" stroke="#fff" stroke-width="2"/><circle cx="35" cy="2" r="3" fill="var(--sun)" stroke-width="1.8"/>',
    deco: '<path d="M35 50l-6-3v6zM35 50l6-3v6z" fill="var(--coral)" stroke-width="1.6"/><circle cx="25" cy="62" r="1.6" fill="var(--coral)" stroke="none"/><circle cx="44" cy="58" r="1.6" fill="var(--sun)" stroke="none"/><circle cx="29" cy="70" r="1.6" fill="var(--mint)" stroke="none"/><circle cx="42" cy="68" r="1.6" fill="#fff" stroke="none"/>'
  }), 'Круто!']
];
const SCRIPTS = [
  [[0, 'Привет! А когда у тебя день рождения?'], [1, 'Пятнадцатого мая! А у тебя?'], [0, 'Первого января: подарки и праздник сразу!'], [1, 'Тогда хлопнем за нас обоих!']],
  [[0, 'Постой, у тебя сегодня день рождения?'], [1, 'Да! Мне исполнилось тридцать!'], [0, 'Поздравляю! Что загадал?'], [1, 'Не скажу, а то не сбудется. Хлопай ещё!']],
  [[0, 'Какой твой любимый праздник?'], [1, 'Новый год! Ёлка, мандарины и хлопушки.'], [0, 'А я люблю Нооруз: весна, угощения и музыка.'], [1, 'Значит, праздник у нас весь год!']],
  [[0, 'Скоро праздник! Как будешь отмечать?'], [1, 'Испеку торт и позову гостей. А ты?'], [0, 'Принесу шарики и конфетти.'], [1, 'Отлично! Без хлопка праздник не праздник.']],
  [[0, 'С каким праздником тебя поздравить?'], [1, 'Сегодня никакого. Давай придумаем!'], [0, 'Тогда пусть будет День хлопушки!'], [1, 'Принято! Ура!']],
  [[0, 'Что тебе подарили на день рождения?'], [1, 'Торт со свечками и билет в лавку игр!'], [0, 'Вот это подарок! Дашь сыграть?'], [1, 'Конечно, только сначала хлопнем!']]
];
/* Парад по хлопку на хлопушку: 6 человечков из боков, кошка, курьер, такси «Яндекс Go» или фура «Кульков» */
const CAT = '<svg viewBox="0 0 70 44" width="84" height="53"><g fill="#e9a35f" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M14 30q-10-2-10-14" fill="none"/><ellipse cx="32" cy="28" rx="20" ry="10"/><path d="M20 38v4M30 38v4M42 38v4M50 38v4" fill="none"/><circle cx="54" cy="18" r="10"/><path d="M46 11l1-9 6 5zM62 11l-1-9-6 5z"/></g><circle cx="51" cy="17" r="1.8" fill="var(--ink)"/><circle cx="58" cy="17" r="1.8" fill="var(--ink)"/><path d="M52 22h5M54.5 20v2" stroke="var(--ink)" stroke-width="1.6" fill="none"/></svg>';
function parade() {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  [...CROWD].sort(() => Math.random() - .5).slice(0, 6).forEach(([svg, w], i) => { /* 3 ряда слева и справа */
    const el = mk('div', 'fig' + (i % 2 ? ' r' : ''), `<b>${w}</b><span>${svg}</span>`);
    el.style.cssText = `bottom:${3 + (i >> 1) * 22 + rnd(6)}%;animation-delay:${i * 140}ms`;
    document.body.append(el); setTimeout(() => el.remove(), 3700);
  });
  const go = (tag, html, cls, t, bottom, delay) => {
    const el = mk('div', 'veh ' + cls + (rnd(2) ? ' rev' : ''), `<b class="tag">${tag}</b><span>${html}</span>`);
    el.style.cssText = `bottom:${bottom}%;animation-duration:${t}s;animation-delay:${delay}ms`; document.body.append(el); setTimeout(() => el.remove(), t * 1000 + delay + 300);
  };
  go('Мяу!', CAT, 'cat', 3.8, 1, 300);
  go('Курьер', COURIER, 'courier', 5.2, 4, 0);
  rnd(2) ? go('Яндекс Go', TAXI_SVG(), 'taxi', 4.6, 1, 600) : go('Кульков', TRUCK, 'truck', 6, 1, 600);
  beep(600, .1, 'triangle'); setTimeout(() => beep(800, .12, 'triangle'), 120);
}
let talking = false;
function cheer() {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches || talking) return;
  talking = true;
  const [A, B] = [...CROWD].sort(() => Math.random() - .5), sc = SCRIPTS[rnd(SCRIPTS.length)];
  const wrap = mk('div', 'talk', `<div class="who"><p class="say"></p>${A[0]}</div><div class="who r"><p class="say"></p>${B[0]}</div>`);
  document.body.append(wrap);
  const who = [...wrap.children], say = who.map(w => w.firstChild);
  sc.forEach(([i, t], n) => setTimeout(() => {
    who.forEach((w, j) => { w.classList.toggle('on', j === i); say[j].classList.toggle('on', j === i) });
    say[i].textContent = t; beep(i ? 560 : 440, .06, 'triangle');
  }, 700 + n * 2400));
  setTimeout(() => { who.forEach(w => w.classList.remove('on')); wrap.classList.add('out'); setTimeout(() => { wrap.remove(); talking = false }, 600) }, 700 + sc.length * 2400 + 600);
}

/* ---------- Рекорды и игровой стол ---------- */
let cur = null, clean = null;
const bkey = g => g.id + (g.noLvl ? '' : '-' + store.get('lvl:' + g.id, 1)); /* рекорд хранится отдельно для каждого уровня */
const best = g => store.get('best:' + bkey(g), null);
const fmt = (g, v) => v == null ? '—' : v + (g.unit || '');
const H = {
  get lvl() { return cur.noLvl ? 1 : store.get('lvl:' + cur.id, 1) },
  score(v) { $('#sc').textContent = v },
  showBest() { $('#bs').textContent = fmt(cur, best(cur)) },
  /* сохраняет результат, если он лучше рекорда (q — без звука) */
  rec(v, q) {
    const b = best(cur);
    if (b == null || (cur.low ? v < b : v > b)) { store.set('best:' + bkey(cur), v); this.showBest(); if (!q) { jingle(); burst({ clientX: innerWidth / 2, clientY: innerHeight / 3, q: 1 }) } return true }
    return false;
  }
};
function startGame() {
  if (clean) clean(); clean = null;
  const box = $('#box'); box.innerHTML = '';
  H.score(0); H.showBest();
  clean = cur.run(box, H);
}
function lvBar() {
  const lv = $('#lv'); lv.hidden = !!cur.noLvl; lv.innerHTML = '';
  ['Легко', 'Средне', 'Сложно'].forEach((n, i) => { const k = mk('button', H.lvl === i ? 'on' : '', n); k.onclick = () => { store.set('lvl:' + cur.id, i); lvBar(); startGame() }; lv.append(k) });
}
function openGame(g) { cur = g; $('#stage').hidden = false; document.body.style.overflow = 'hidden'; $('#gt').innerHTML = ic(g.icon) + ' ' + g.name; $('#how').innerHTML = ic('info-circle-fill') + ' ' + g.how + (g.noLvl ? '' : ' Сложность — кнопки сверху.'); lvBar(); beep(600, .1, 'triangle'); startGame() }
$('#re').onclick = startGame;
$('#back').onclick = () => { if (clean) clean(); clean = null; $('#stage').hidden = true; document.body.style.overflow = ''; render() };

/* ============ ИГРА 1: Крестики-нолики ============ */
function runTTT(box, H) {
  const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const res = b => { for (const [a, c, d] of L) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.includes('') ? null : '=' };
  /* minimax: компьютер играет за O */
  const mm = (b, p) => {
    const r = res(b); if (r) return r === 'O' ? 1 : r === 'X' ? -1 : 0;
    let s = p === 'O' ? -9 : 9;
    b.forEach((v, i) => { if (v) return; b[i] = p; const x = mm(b, p === 'O' ? 'X' : 'O'); b[i] = ''; s = p === 'O' ? Math.max(s, x) : Math.min(s, x) });
    return s;
  };
  let mode = 'hard', b, turn, over, wins = 0, t;
  const bar = mk('div', 'row'), msg = mk('div', 'msg'), g = mk('div', 'g');
  g.style.cssText = 'grid-template-columns:repeat(3,auto);--s:min(92px,26vw)';
  [['pvp', '2 игрока'], ['easy', 'Легко'], ['mid', 'Средне'], ['hard', 'Сложно']].forEach(([m, n]) => {
    const k = mk('button', '', n); k.dataset.m = m;
    k.onclick = () => { mode = m; wins = 0; H.score(0); reset() }; bar.append(k);
  });
  const cells = [...Array(9)].map((_, i) => { const c = mk('button', 'c'); c.onclick = () => click(i); g.append(c); return c });
  const paint = () => {
    cells.forEach((c, i) => c.innerHTML = b[i] ? mark(b[i]) : '');
    [...bar.children].forEach(k => k.classList.toggle('on', k.dataset.m === mode));
  };
  function reset() { clearTimeout(t); b = Array(9).fill(''); turn = 'X'; over = false; msg.innerHTML = 'Ходит ' + mark('X'); paint() }
  function click(i) { if (over || b[i] || (mode !== 'pvp' && turn === 'O')) return; put(i) }
  function put(i) {
    b[i] = turn; beep(turn === 'X' ? 500 : 380);
    const r = res(b); paint(); if (r) return fin(r);
    turn = turn === 'X' ? 'O' : 'X'; msg.innerHTML = 'Ходит ' + mark(turn);
    if (mode !== 'pvp' && turn === 'O') t = setTimeout(ai, 350);
  }
  function ai() {
    const e = b.map((v, i) => v ? -1 : i).filter(i => i >= 0); let m;
    if (mode === 'easy' || (mode === 'mid' && Math.random() < .5)) m = e[rnd(e.length)];
    else {
      let bs = -9, pool = [];
      e.forEach(i => { b[i] = 'O'; const s = mm(b, 'X'); b[i] = ''; if (s > bs) { bs = s; pool = [i] } else if (s === bs) pool.push(i) });
      m = pool[rnd(pool.length)];
    }
    put(m);
  }
  function fin(r) {
    over = true;
    if (r === '=') { msg.textContent = 'Ничья!'; return }
    msg.innerHTML = 'Победили ' + mark(r) + '!';
    if (mode !== 'pvp' && r === 'X') { H.score(++wins); H.rec(wins) } else beep(r === 'X' ? 700 : 180, .25);
  }
  box.append(bar, msg, g); reset();
  return () => clearTimeout(t);
}

/* ============ ИГРА 2: Змейка ============ */
function runSnake(box, H) {
  const N = 20; let S = Math.max(240, Math.min(460, innerWidth - 32, innerHeight - 400)); S -= S % N;
  const u = S / N, wrap = mk('div', 'snake'), cv = mk('canvas'), x = cv.getContext('2d');
  const bt = mk('button', ''), msg = mk('div', 'msg'), pad = mk('div', 'dpad');
  cv.width = cv.height = S;
  let sn = [[10, 10], [9, 10], [8, 10]], dir = [1, 0], q = [], sc = 0, tm, state = 'idle', food;
  const css = v => getComputedStyle(root).getPropertyValue(v);
  const nf = () => { let f; do f = [rnd(N), rnd(N)]; while (sn.some(p => p[0] === f[0] && p[1] === f[1])); return f };
  food = nf();
  function draw() {
    x.fillStyle = css('--paper'); x.fillRect(0, 0, S, S);
    x.fillStyle = css('--line'); for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) if ((i + k) % 2) x.fillRect(i * u, k * u, u, u);
    x.fillStyle = css('--coral'); x.beginPath(); x.arc((food[0] + .5) * u, (food[1] + .5) * u, u * .38, 0, 7); x.fill();
    sn.forEach((p, i) => { x.fillStyle = css(i ? '--mint' : '--ink'); x.beginPath(); x.roundRect(p[0] * u + 1, p[1] * u + 1, u - 2, u - 2, u * .3); x.fill() });
    const h = sn[0]; x.fillStyle = css('--paper'); /* глаза смотрят по ходу движения */
    [1, -1].forEach(s => { x.beginPath(); x.arc((h[0] + .5) * u + dir[0] * u * .15 - dir[1] * s * u * .2, (h[1] + .5) * u + dir[1] * u * .15 + dir[0] * s * u * .2, u * .09, 0, 7); x.fill() });
  }
  const texts = { idle: 'Нажми стрелку, свайп или «Старт»', run: 'Поехали!', pause: 'Пауза. Нажми «Продолжить» или стрелку' };
  function setState(s) {
    state = s; bt.disabled = s === 'over';
    bt.innerHTML = s === 'run' ? ic('pause-fill') + ' Пауза' : s === 'pause' ? ic('play-fill') + ' Продолжить' : ic('play-fill') + ' Старт';
    msg.textContent = s === 'over' ? 'Конец! Счёт: ' + sc + '. Нажми «Заново»' : texts[s];
  }
  const loop = () => { clearInterval(tm); tm = setInterval(step, Math.max([110, 70, 45][H.lvl], [230, 180, 130][H.lvl] - sc * 5)) }; /* скорость растёт */
  function toggle() { if (state === 'run') { clearInterval(tm); setState('pause') } else if (state !== 'over') { setState('run'); loop() } }
  function turn(dx, dy) { /* очередь поворотов: быстрые нажатия не теряются */
    if (state === 'over') return;
    const l = q.length ? q[q.length - 1] : dir;
    if (state !== 'run') toggle(); /* первое нажатие запускает игру, на паузе — продолжает */
    if (q.length < 3 && (dx + l[0] || dy + l[1]) && (dx !== l[0] || dy !== l[1])) q.push([dx, dy]);
  }
  function step() {
    if (q.length) dir = q.shift();
    const h = [sn[0][0] + dir[0], sn[0][1] + dir[1]];
    if (h[0] < 0 || h[1] < 0 || h[0] >= N || h[1] >= N || sn.some(p => p[0] === h[0] && p[1] === h[1])) return over();
    sn.unshift(h);
    if (h[0] === food[0] && h[1] === food[1]) { H.score(++sc); beep(500, .09, 'square', 900); food = nf(); loop() } else sn.pop();
    draw();
  }
  function over() { clearInterval(tm); beep(150, .4, 'sawtooth'); if (sc) H.rec(sc); setState('over'); cv.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], 260) }
  bt.onclick = toggle;
  [['u', 'chevron-up', 0, -1], ['l', 'chevron-left', -1, 0], ['d', 'chevron-down', 0, 1], ['r', 'chevron-right', 1, 0]].forEach(([n, i, dx, dy]) => {
    const k = mk('button', 'c ' + n, ic(i)); k.onpointerdown = e => { e.preventDefault(); turn(dx, dy) }; pad.append(k);
  });
  const keys = { ArrowUp: [0,-1], w: [0,-1], 'ц': [0,-1], ArrowDown: [0,1], s: [0,1], 'ы': [0,1], ArrowLeft: [-1,0], a: [-1,0], 'ф': [-1,0], ArrowRight: [1,0], d: [1,0], 'в': [1,0] };
  const kd = e => { if (e.key === ' ' || e.key === 'p' || e.key === 'з') { e.preventDefault(); toggle(); return } const k = keys[e.key]; if (k) { e.preventDefault(); turn(...k) } };
  addEventListener('keydown', kd);
  let t0; wrap.ontouchstart = e => { t0 = e.touches[0] };
  wrap.ontouchend = e => { const t = e.changedTouches[0], dx = t.clientX - t0.clientX, dy = t.clientY - t0.clientY; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; Math.abs(dx) > Math.abs(dy) ? turn(Math.sign(dx), 0) : turn(0, Math.sign(dy)) };
  wrap.append(bt, cv, msg, pad); box.append(wrap); setState('idle'); draw();
  return () => { clearInterval(tm); removeEventListener('keydown', kd) };
}

/* ============ ИГРА 3: Сапёр (9×9, 10 мин) ============ */
function runMines(box, H) {
  const W = [8, 9, 12][H.lvl], M = [6, 10, 24][H.lvl]; let cells, first, over, flagMode = false, t0, tm, left;
  const fb = mk('button', '', ic('flag-fill') + ' Флажок: выкл'), msg = mk('div', 'msg'), g = mk('div', 'g');
  g.style.cssText = `grid-template-columns:repeat(${W},auto);gap:3px;--s:min(38px,${(88 / W).toFixed(1)}vw)`;
  const nb = i => { const r = i / W | 0, c = i % W, o = []; for (let a = -1; a < 2; a++) for (let b = -1; b < 2; b++) { const y = r + a, x = c + b; if ((a || b) && y >= 0 && x >= 0 && y < W && x < W) o.push(y * W + x) } return o };
  fb.onclick = () => { flagMode = !flagMode; fb.innerHTML = ic('flag-fill') + ' Флажок: ' + (flagMode ? 'вкл' : 'выкл'); fb.classList.toggle('on', flagMode) };
  const els = [...Array(W * W)].map((_, i) => {
    const e = mk('button', 'c'); e.style.fontSize = '1rem';
    e.onclick = () => click(i); e.oncontextmenu = ev => { ev.preventDefault(); flag(i) };
    g.append(e); return e;
  });
  function reset() {
    cells = Array.from({ length: W * W }, () => ({ m: 0, o: 0, f: 0, n: 0 }));
    first = true; over = false; left = M; clearInterval(tm); H.score(0);
    msg.textContent = 'Мин: ' + M + ' · ПКМ или кнопка — флажок';
    els.forEach(e => { e.textContent = ''; e.style.background = '' });
  }
  function flag(i) { const c = cells[i]; if (over || c.o) return; c.f ^= 1; left += c.f ? -1 : 1; els[i].innerHTML = c.f ? ic('flag-fill') : ''; msg.textContent = 'Мин: ' + left; beep(300, .04) }
  function reveal(i) {
    const c = cells[i]; if (c.o || c.f) return; c.o = 1;
    const e = els[i]; e.style.background = 'var(--line)'; e.textContent = c.n || '';
    e.style.color = ['', '#5b7fd6', '#4aa37f', '#d9604c', '#7a5bd6'][Math.min(c.n, 4)];
    if (!c.n) nb(i).forEach(reveal);
  }
  function click(i) {
    if (over) return; if (flagMode) return flag(i);
    const c = cells[i]; if (c.f || c.o) return;
    if (first) { /* мины расставляются после первого клика — он всегда безопасен */
      first = false; const ban = [i, ...nb(i)]; let k = 0;
      while (k < M) { const j = rnd(W * W); if (!cells[j].m && !ban.includes(j)) { cells[j].m = 1; k++ } }
      cells.forEach((q, j) => q.n = nb(j).filter(y => cells[y].m).length);
      t0 = Date.now(); tm = setInterval(() => H.score((Date.now() - t0) / 1000 | 0), 250);
    }
    if (c.m) return end(false, i);
    reveal(i); beep(420, .04);
    if (cells.filter(q => q.o).length === W * W - M) end(true);
  }
  function end(win, i) {
    over = true; clearInterval(tm); const s = Math.round((Date.now() - t0) / 1000);
    if (win) { H.score(s); H.rec(s); msg.textContent = 'Победа за ' + s + ' с!' }
    else { cells.forEach((c, j) => { if (c.m) els[j].innerHTML = ic('brightness-high-fill') }); els[i].style.background = 'var(--coral)'; msg.textContent = 'Бум! Нажми «Заново»'; noise(.6, 3000, 80, .7); beep(90, .4, 'sine', 30, .4) }
  }
  box.append(fb, msg, g); reset();
  return () => clearInterval(tm);
}

/* ============ ИГРА 4: 2048 (плитки скользят, новые появляются, слитые «пульсируют») ============ */
function run2048(box, H) {
  const N = [5, 4, 3][H.lvl], GAP = 6, cs = Math.min(N === 3 ? 104 : N === 4 ? 84 : 70, ((Math.min(innerWidth, 460) - 56) / N - GAP) | 0);
  const bd = mk('div', 'board'), msg = mk('div', 'msg', 'Стрелки, WASD или свайп'); let b = Array(N * N).fill(null), sc = 0;
  bd.style.cssText = `width:${N * cs + (N + 1) * GAP}px;height:${N * cs + (N + 1) * GAP}px`;
  const pos = i => `translate(${GAP + (i % N) * (cs + GAP)}px,${GAP + (i / N | 0) * (cs + GAP)}px)`;
  for (let i = 0; i < N * N; i++) { const c = mk('div', 'bgc'); c.style.cssText = `width:${cs}px;height:${cs}px;transform:${pos(i)}`; bd.append(c) }
  const dk = () => root.dataset.theme === 'dark';
  function look(t) { const v = t.v; t.in.textContent = v; t.in.style.background = `hsl(${(Math.log2(v) * 38 + 10) % 360} ${dk() ? 35 : 70}% ${dk() ? 45 : 72}%)`; t.in.style.fontSize = (v > 999 ? .9 : v > 99 ? 1.15 : 1.5) * cs / 70 + 'rem' }
  function tile(v) { const el = mk('div', 'tl'), inn = mk('div', 'tn'); el.append(inn); el.style.cssText = `width:${cs}px;height:${cs}px`; bd.append(el); const t = { v, el, in: inn }; look(t); return t }
  const put = (t, i) => { t.el.style.transform = pos(i) };
  function add() {
    const e = b.map((t, i) => t ? -1 : i).filter(i => i >= 0); if (!e.length) return;
    const i = e[rnd(e.length)], t = tile(Math.random() < .9 ? 2 : 4); b[i] = t; put(t, i);
    t.in.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 200, easing: 'ease-out' });
  }
  function move(d) { /* 0 влево, 1 вверх, 2 вправо, 3 вниз */
    let moved = false, merged = 0; const gone = [];
    for (let k = 0; k < N; k++) {
      const idx = [...Array(N)].map((_, j) => d === 0 ? k * N + j : d === 2 ? k * N + N - 1 - j : d === 1 ? j * N + k : (N - 1 - j) * N + k);
      const line = idx.map(i => b[i]).filter(Boolean), out = [];
      for (let j = 0; j < line.length; j++) {
        const t = line[j], n = line[j + 1];
        if (n && n.v === t.v) { t.v *= 2; t.m = 1; sc += t.v; merged++; gone.push([n, t]); out.push(t); j++ } else out.push(t);
      }
      idx.forEach((i, p) => { const t = out[p] || null; if (b[i] !== t) moved = true; b[i] = t; if (t) put(t, i) });
    }
    if (!moved) return;
    gone.forEach(([o, t]) => { put(o, b.indexOf(t)); setTimeout(() => o.el.remove(), 140) });
    b.forEach(t => { if (t && t.m) { t.m = 0; look(t); t.el.style.zIndex = 2; t.in.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 220, delay: 90 }) } });
    add(); H.score(sc); H.rec(sc, 1); beep(merged ? 520 : 260, .06, 'sine', merged ? 780 : 200);
    if (b.some(t => t && t.v === 2048)) msg.textContent = 'Получилось 2048! Играй дальше';
    else if (!b.includes(null) && !b.some((t, i) => (i % N < N - 1 && b[i + 1].v === t.v) || (i < N * N - N && b[i + N].v === t.v))) { msg.textContent = 'Ходов нет! Нажми «Заново»'; beep(150, .4, 'sawtooth') }
  }
  const km = { ArrowLeft: 0, a: 0, 'ф': 0, ArrowUp: 1, w: 1, 'ц': 1, ArrowRight: 2, d: 2, 'в': 2, ArrowDown: 3, s: 3, 'ы': 3 };
  const kd = e => { if (e.key in km) { e.preventDefault(); move(km[e.key]) } };
  addEventListener('keydown', kd);
  let t0; bd.ontouchstart = e => { t0 = e.touches[0] };
  bd.ontouchend = e => { const t = e.changedTouches[0], dx = t.clientX - t0.clientX, dy = t.clientY - t0.clientY; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; move(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 0 : 2) : (dy < 0 ? 1 : 3)) };
  add(); add(); box.append(bd, msg);
  return () => removeEventListener('keydown', kd);
}

/* ============ ИГРА 5: Memory ============ */
function runMemory(box, H) {
  const E = ['heart-fill', 'star-fill', 'moon-fill', 'cloud-fill', 'lightning-fill', 'flower1', 'gem', 'bell-fill', 'umbrella-fill', 'key-fill'];
  const P = [6, 8, 10][H.lvl], d = [...E.slice(0, P), ...E.slice(0, P)].sort(() => Math.random() - .5);
  const g = mk('div', 'g'), msg = mk('div', 'msg', 'Найди все пары за минимум ходов');
  g.style.cssText = `grid-template-columns:repeat(${[4, 4, 5][H.lvl]},auto);--s:min(78px,${[4, 4, 5][H.lvl] === 5 ? 16 : 20}vw)`;
  let sel = [], moves = 0, found = 0, lock = false;
  const els = d.map((_, i) => { const e = mk('button', 'c'); e.style.fontSize = '2rem'; e.onclick = () => flip(i); g.append(e); return e });
  function flip(i) {
    const e = els[i]; if (lock || e.dataset.up) return;
    e.innerHTML = ic(d[i]); e.dataset.up = 1; e.style.background = 'var(--sun)'; sel.push(i); beep(500, .05);
    if (sel.length < 2) return;
    H.score(++moves); const [a, b] = sel; sel = [];
    if (d[a] === d[b]) {
      found++; [a, b].forEach(k => els[k].style.background = 'var(--mint)'); beep(760, .1);
      if (found === P) { msg.textContent = 'Все пары за ' + moves + ' ходов!'; H.rec(moves) }
    } else {
      lock = true;
      setTimeout(() => { [a, b].forEach(k => { els[k].textContent = ''; els[k].style.background = ''; delete els[k].dataset.up }); lock = false }, 800);
    }
  }
  box.append(g, msg);
}

/* Жители фона для Reaction Test: ходят и бегают, чтобы отвлекать */
const DOG = '<svg viewBox="0 0 64 40" width="70" height="44"><g fill="var(--sun)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M18 26v10M26 26v10M40 26v10M48 26v10" fill="none"/><ellipse cx="32" cy="22" rx="19" ry="9"/><circle cx="53" cy="13" r="8"/><path d="M57 6l6-3-1 9z"/><path d="M13 18q-8-8-8-14" fill="none"/></g><circle cx="56" cy="12" r="1.6" fill="var(--ink)"/></svg>';
const GRANNY = '<svg viewBox="0 0 40 64" width="46" height="74"><g stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><circle cx="14" cy="3" r="4" fill="#b9b4aa"/><circle cx="20" cy="10" r="7" fill="var(--paper)"/><path d="M20 17l-10 29h20z" fill="var(--coral)"/><path d="M15 46l-2 14M25 46l2 14M31 26l5 34" fill="none"/></g></svg>';
const car = () => `<svg viewBox="0 0 100 44" width="104" height="46"><g stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"><path d="M5 32V24Q5 19 10 18L22 16L32 6H66L78 16L92 18Q96 19 96 24V32Z" fill="${['var(--coral)', 'var(--sky)', 'var(--mint)', 'var(--sun)', '#e8e3d6'][rnd(5)]}"/><path d="M35 9H48V16H29ZM52 9H64L72 16H52Z" fill="#cfe6f2"/><circle cx="26" cy="33" r="7" fill="var(--ink)"/><circle cx="74" cy="33" r="7" fill="var(--ink)"/></g></svg>`;
const COURIER = `<i class="cour">${ic('bicycle')}<i class="box"></i></i>`; /* велосипедист-курьер с коробкой */
const TAXI_SVG = () => car().replace(/(<path d="M5 32V24[^>]*? fill=")[^"]*(")/, '$1#ffd23f$2');
const TAXI = () => '<b class="tag">Яндекс Go</b>' + TAXI_SVG();
const TRUCK = '<svg viewBox="0 0 150 54" width="170" height="61"><g stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"><rect x="4" y="4" width="100" height="36" rx="5" fill="var(--sky)"/><path d="M106 14h22l14 14v12h-36z" fill="var(--coral)"/><path d="M112 18h12l8 9h-20z" fill="#cfe6f2"/><circle cx="26" cy="42" r="8" fill="var(--ink)"/><circle cx="60" cy="42" r="8" fill="var(--ink)"/><circle cx="124" cy="42" r="8" fill="var(--ink)"/></g></svg>';
const ACTORS = [
  { cls: 'granny', html: GRANNY, t: 18 }, { cls: 'dog', html: DOG, t: 4.5 }, { cls: 'bike', html: () => '<b class="tag">Курьер</b>' + COURIER, t: 8 },
  { cls: 'car', html: TAXI, t: 5 }, { cls: 'car', html: TAXI, t: 4 }, { cls: 'car', html: car, t: 6 }, { cls: 'car', html: () => '<b class="tag">Кульков</b>' + TRUCK, t: 7 }, { cls: 'plane', html: ic('airplane-fill'), t: 14 }
];

/* ---------- Город для Reaction Test: дома с окнами, деревья, фонари, облака ---------- */
const BCOL = ['--coral', '--sky', '--mint', '--sun'];
function bld(w, h, far) {
  const T = 34, H = h + T, cx = w / 2, col = `var(${BCOL[rnd(4)]})`;
  const dark = `color-mix(in srgb,${col} 55%,var(--ink))`, lite = `color-mix(in srgb,${col} 62%,#fff)`;
  const cols = Math.max(1, (w - 14) / 19 | 0), rows = Math.max(1, (h - 70) / 25 | 0), ox = (w - cols * 19 + 8) / 2;
  const roof = [
    `<path d="M${cx} ${T}V6" fill="none"/><circle cx="${cx}" cy="6" r="2.6" fill="var(--coral)"/>`,
    `<path d="M${cx - 11} ${T}l3-9M${cx + 11} ${T}l-3-9" fill="none"/><rect x="${cx - 14}" y="${T - 25}" width="28" height="16" rx="3" fill="#c9a77c"/><path d="M${cx - 16} ${T - 25}L${cx} ${T - 33}L${cx + 16} ${T - 25}z" fill="#a98660"/>`,
    `<rect x="${(w * .66).toFixed(1)}" y="${T - 16}" width="8" height="18" fill="${dark}"/><path d="M-1 ${T + 1}L${cx} 5L${w + 1} ${T + 1}z" fill="${dark}"/>`,
    `<rect x="${(w * .22).toFixed(1)}" y="${T - 14}" width="${(w * .56).toFixed(1)}" height="16" rx="2" fill="${col}"/>`
  ][rnd(4)];
  let win = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = ox + c * 19, y = T + 14 + r * 25, l = Math.random();
    win += `<rect class="w${l < .22 ? ' a' : l < .6 ? ' b' : ''}" x="${x}" y="${y}" width="11" height="16" rx="2" stroke-width="1.6"/>`;
    if (!far) win += `<path d="M${x + 5.5} ${y}v16M${x} ${y + 8}h11" fill="none" stroke-width="1" opacity=".45"/>`;
  }
  const door = `<path d="M${cx - 17} ${H - 31}h34l3 9h-40z" fill="var(--coral)"/><rect x="${cx - 8}" y="${H - 23}" width="16" height="21.5" rx="2" fill="${dark}"/><circle cx="${cx + 4}" cy="${H - 12}" r="1.4" fill="var(--sun)" stroke="none"/>`;
  return `<svg class="bld" viewBox="0 0 ${w} ${H}" width="${w}" height="${H}"><g stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${roof}<rect x="1.25" y="${T}" width="${w - 2.5}" height="${h}" fill="${col}"/><rect x="-1" y="${T}" width="${w + 2}" height="6" rx="1.5" fill="${lite}"/>${win}${door}</g></svg>`;
}
function skyline(far, k) {
  let t = 0, s = '';
  while (t < innerWidth + 300) {
    const w = (far ? 50 : 70) + rnd(far ? 40 : 60), h = Math.max(100, Math.round(((far ? 70 : 100) + rnd(far ? 90 : 150)) * k));
    s += bld(w, h, far); t += w + 6;
  }
  return `<div class="city ${far ? 'far' : 'near'}">${s}</div>`;
}
const CROWN = '<circle cx="25" cy="29" r="20"/><circle cx="12" cy="40" r="11.5"/><circle cx="38" cy="40" r="11.5"/>';
const TREE = k => `<svg viewBox="0 0 50 82" width="${50 * k}" height="${82 * k}"><rect x="22" y="46" width="7" height="34" rx="2" fill="#a98660" stroke="var(--ink)" stroke-width="2.5"/><g fill="var(--mint)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round">${CROWN}</g><g fill="var(--mint)">${CROWN}</g><path d="M14 24q4-8 12-9" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/></svg>`;
const LAMP = k => `<svg viewBox="0 0 34 104" width="${34 * k}" height="${104 * k}"><circle class="gl" cx="26" cy="18" r="16" fill="var(--sun)"/><path d="M12 102V14q0-8 10-8h4" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><path d="M20 8h13l-3 10H23z" fill="var(--sun)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/><rect x="6" y="96" width="14" height="7" rx="2" fill="var(--ink)"/></svg>`;
const BUSH = k => { const c = '<circle cx="14" cy="18" r="11"/><circle cx="28" cy="13" r="13"/><circle cx="43" cy="18" r="11"/>'; return `<svg viewBox="0 0 56 31" width="${56 * k}" height="${31 * k}"><g fill="var(--mint)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round">${c}</g><g fill="var(--mint)">${c}</g></svg>` };
const BENCH = k => `<svg viewBox="0 0 60 36" width="${60 * k}" height="${36 * k}"><g stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M10 25v9M50 25v9M10 14v4M50 14v4" fill="none"/><rect x="4" y="5" width="52" height="8" rx="2" fill="#c9a77c"/><rect x="4" y="18" width="52" height="7" rx="2" fill="#a98660"/></g></svg>`;
const street = k => `<div class="street">${[...Array(Math.ceil(innerWidth / 150) + 2)].map((_, i) => i % 3 === 1 ? LAMP(k) : [TREE, TREE, BUSH, BENCH][rnd(4)](k)).join('')}</div>`;
const cloud = () => `<svg class="cloud" viewBox="0 0 96 50" style="left:${rnd(90)}%;top:${3 + rnd(22)}%;width:${70 + rnd(70)}px;animation-duration:${70 + rnd(80)}s;animation-delay:-${rnd(120)}s"><path d="M14 44a12 12 0 0 1 0-24a16 16 0 0 1 26-8a18 18 0 0 1 32 6a13 13 0 0 1 8 26z" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
const zebra = () => `<div class="zebra" style="left:${8 + rnd(72)}%"></div>`;

/* ============ ИГРА 6: Reaction Test (город; жми на солнце или луну) ============ */
function runReact(box, H) {
  const L = H.lvl, KEY = 'runs-react-' + L; let st = 'idle', t0, tm, sp, runs = store.get(KEY, []);
  const lum = () => theme === 'dark' ? 'луну' : 'солнце';
  const b = mk('button', 'rx', 'Нажми на ' + lum()), msg = mk('div', 'msg', 'Нажми на светило, чтобы начать'), tbl = mk('div', 'rtab');
  const kk = Math.min(1.15, Math.max(.6, innerHeight / 850));
  const scene = mk('div', 'scene', [...Array(5)].map(cloud).join('') + skyline(1, kk) + skyline(0, kk) + '<div class="walk"></div>' + street(kk) + '<div class="road"></div>' + zebra() + zebra());
  const say = ms => ms < 180 ? 'Ты вообще человек? Молния!' : ms < 250 ? 'Отлично! Реакция как у пилота' : ms < 320 ? 'Хорошо, нормальный здоровый результат' : ms < 450 ? 'Ну так себе… бабушка бы успела быстрее' : ms < 700 ? 'Ты что, не выспался?' : 'Ты там уснул? Моргни, если живой';
  const show = () => {
    const s = [...runs].sort((x, y) => x - y), li = a => a.length ? a.map((v, i) => `<li><span>${i + 1}.</span>${v} мс</li>`).join('') : '<li>пока пусто</li>';
    tbl.innerHTML = `<div><h4>Лучшие забеги</h4><ol>${li(s.slice(0, 5))}</ol></div><div><h4>Худшие забеги</h4><ol>${li(s.slice(-5).reverse())}</ol></div>`;
  };
  const set = (s, text) => { st = s; b.dataset.s = s; b.textContent = text };
  b.onclick = () => {
    if (st === 'wait') { clearTimeout(tm); set('idle', 'Рано! Нажми ещё раз'); msg.textContent = 'Светило ещё не готово. Терпение!'; beep(150, .3, 'sawtooth') }
    else if (st === 'go') {
      const ms = Math.round(performance.now() - t0); set('idle', ms + ' мс. Ещё?'); msg.textContent = say(ms);
      H.score(ms + ' мс'); H.rec(ms); runs.push(ms); if (runs.length > 200) runs.shift(); store.set(KEY, runs); show();
    } else {
      set('wait', 'Жди…'); msg.textContent = 'Жди, пока загорится зелёным';
      tm = setTimeout(() => { t0 = performance.now(); set('go', 'ЖМИ!'); msg.textContent = '' }, 1000 + rnd(3000));
    }
  };
  const spawn = () => {
    if (scene.querySelectorAll('.act').length < [3, 6, 10][L]) {
      const a = ACTORS[rnd(ACTORS.length)], road = a.cls === 'car' || a.cls === 'bike', lane = rnd(2);
      const el = mk('div', 'act ' + a.cls + (road ? ' l' + lane : '') + ((road ? lane : rnd(2)) ? ' rev' : ''), '<span>' + (typeof a.html === 'function' ? a.html() : a.html) + '</span>');
      if (a.cls === 'plane') el.style.top = (4 + rnd(18)) + '%';
      el.style.animationDuration = a.t * (.8 + Math.random() * .4) + 's';
      scene.append(el); setTimeout(() => el.remove(), a.t * 1300);
    }
    sp = setTimeout(spawn, [900, 500, 250][L] + rnd(1300));
  };
  b.dataset.s = 'idle'; show(); box.append(scene, b, msg, tbl);
  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) spawn();
  return () => { clearTimeout(tm); clearTimeout(sp) };
}

/* ============ ИГРА 7: Камень, ножницы, бумага ============ */
function runRPS(box, H) {
  const I = [['hexagon-fill', 'Камень'], ['scissors', 'Ножницы'], ['file-earmark-text-fill', 'Бумага']];
  let streak = 0, w = 0, l = 0, d = 0, busy = false, t, last = -1;
  const pl = mk('div', 'big', ic('question-circle')), cp = mk('div', 'big', ic('question-circle')), arena = mk('div', 'arena');
  const side = (n, el) => { const s = mk('div', 'side', `<small>${n}</small>`); s.append(el); return s };
  arena.append(side('Ты', pl), mk('b', 'vs', 'VS'), side('Компьютер', cp));
  const out = mk('div', 'verdict', 'Выбери свой ход'), tab = mk('div', 'msg'), row = mk('div', 'row');
  I.forEach(([s, n], i) => {
    const k = mk('button', 'pick', ic(s) + `<span>${n}</span>`);
    k.onclick = () => {
      if (busy) return; busy = true;
      let c = rnd(3); const L = H.lvl; /* Легко: компьютер поддаётся, Сложно: пытается угадать повтор */
      if (L === 0 && Math.random() < .3) c = (i + 1) % 3; else if (L === 2 && last >= 0 && Math.random() < .45) c = (last + 2) % 3;
      last = i; const r = (c - i + 3) % 3; /* 1 — победа, 2 — поражение */
      pl.innerHTML = ic(s); cp.innerHTML = ic('three-dots'); out.textContent = 'Компьютер выбирает…'; out.dataset.r = '';
      t = setTimeout(() => {
        cp.innerHTML = ic(I[c][0]);
        if (r === 1) { H.score(++streak); H.rec(streak, 1); w++ } else if (r === 2) { streak = 0; H.score(0); l++ } else d++;
        out.textContent = r === 1 ? 'Ты выиграл!' : r === 2 ? 'Выиграл компьютер' : 'Ничья';
        out.dataset.r = r; tab.textContent = `Победы ${w} · Ничьи ${d} · Поражения ${l}`;
        beep(r === 1 ? 800 : r === 2 ? 180 : 400, .12); busy = false;
      }, 450);
    };
    row.append(k);
  });
  box.append(arena, out, row, tab);
  return () => clearTimeout(t);
}

/* ============ ИГРА 8: Лови жука (30 секунд) ============ */
function runWhack(box, H) {
  let sc = 0, left = 30, cur = -1, tm, tk;
  const g = mk('div', 'g'), msg = mk('div', 'msg', 'Осталось: 30 с');
  g.style.cssText = 'grid-template-columns:repeat(3,auto);--s:min(96px,26vw)';
  const clear = () => { if (cur >= 0) { els[cur].innerHTML = ''; els[cur].style.background = '' } cur = -1 };
  const els = [...Array(9)].map((_, i) => { const e = mk('button', 'c'); e.onclick = () => { if (i !== cur || left <= 0) return; H.score(++sc); beep(900, .07, 'square', 300); clear() }; g.append(e); return e });
  const show = () => { clear(); cur = rnd(9); els[cur].innerHTML = ic('bug-fill'); els[cur].style.background = 'var(--sun)' };
  tm = setInterval(show, [900, 700, 480][H.lvl]);
  tk = setInterval(() => { left--; msg.textContent = 'Осталось: ' + left + ' с'; if (left <= 0) { clearInterval(tk); clearInterval(tm); clear(); msg.textContent = 'Время! Поймано: ' + sc; H.rec(sc) } }, 1000);
  box.append(msg, g); show();
  return () => { clearInterval(tm); clearInterval(tk) };
}

/* ============ ИГРА 9: Саймон (каждая кнопка — свой инструмент) ============ */
function runSimon(box, H) {
  const P = [4, 6, 8][H.lvl], NOTES = [262, 294, 330, 392, 440, 523, 587, 659], cols = P === 4 ? 2 : P === 6 ? 3 : 4, dk = root.dataset.theme === 'dark';
  let seq = [], pos = 0, lock = true, t = [];
  const msg = mk('div', 'msg'), g = mk('div', 'g'); g.style.cssText = `grid-template-columns:repeat(${cols},auto);--s:min(104px,${86 / cols | 0}vw)`;
  const els = [...Array(P)].map((_, i) => {
    const e = mk('button', 'c', `<small>${INST[i][0]}</small>`); e.style.background = `hsl(${i * 45 + 10} ${dk ? 35 : 65}% ${dk ? 48 : 72}%)`;
    e.onclick = () => press(i); g.append(e); return e;
  });
  const flash = i => { els[i].style.filter = 'brightness(1.3)'; els[i].style.transform = 'scale(.92)'; play(i, NOTES[i]); setTimeout(() => { els[i].style.filter = ''; els[i].style.transform = '' }, 300) };
  function next() {
    seq.push(rnd(P)); pos = 0; lock = true; msg.textContent = 'Слушай и запоминай…';
    seq.forEach((v, k) => t.push(setTimeout(() => flash(v), 700 + k * 600)));
    t.push(setTimeout(() => { lock = false; msg.textContent = 'Твой ход: повтори порядок' }, 700 + seq.length * 600));
  }
  function press(i) {
    if (lock) return; flash(i);
    if (i !== seq[pos]) { lock = true; beep(150, .4, 'sawtooth'); msg.textContent = 'Ошибка! Пройдено раундов: ' + (seq.length - 1) + '. Нажми «Заново»'; return }
    if (++pos === seq.length) { H.score(seq.length); H.rec(seq.length, 1); lock = true; msg.textContent = 'Верно!'; t.push(setTimeout(next, 800)) }
  }
  box.append(msg, g); next();
  return () => t.forEach(clearTimeout);
}

/* ============ ИГРА 10: Угадай число ============ */
function runGuess(box, H) {
  const R = [50, 100, 500][H.lvl], n = rnd(R) + 1; let tries = 0, done = false;
  const msg = mk('div', 'msg', `Я загадал число от 1 до ${R}`), inp = mk('input', 'num'), b = mk('button', '', 'Проверить'), hist = mk('div', 'row'), row = mk('div', 'row');
  inp.type = 'number'; inp.min = 1; inp.max = R; inp.placeholder = '1–' + R;
  const check = () => {
    if (done) return; const v = +inp.value; inp.value = '';
    if (!v || v < 1 || v > R) { msg.textContent = `Введи число от 1 до ${R}`; return }
    H.score(++tries); beep(500, .05);
    if (v === n) { done = true; msg.textContent = 'Угадал за ' + tries + ' попыток!'; H.rec(tries) }
    else { msg.textContent = v < n ? 'Загаданное число больше' : 'Загаданное число меньше'; hist.append(mk('span', 'chip', v + ' ' + ic(v < n ? 'arrow-up' : 'arrow-down'))) }
  };
  b.onclick = check; inp.onkeydown = e => { if (e.key === 'Enter') check() };
  row.append(inp, b); box.append(msg, row, hist);
}

/* ============ ИГРА 11: Быстрый счёт (30 секунд) ============ */
function runMath(box, H) {
  let sc = 0, left = 30, ans, tk;
  const q = mk('div', 'verdict'), row = mk('div', 'row'), msg = mk('div', 'msg', 'Осталось: 30 с');
  function ask() {
    const R = [9, 12, 20][H.lvl], a = rnd(R) + 2, b = rnd(R) + 2, op = ['+', '−', '×'][rnd(H.lvl ? 3 : 2)];
    ans = op === '+' ? a + b : op === '−' ? a - b : a * b; q.textContent = `${a} ${op} ${b} = ?`;
    const o = new Set([ans]); while (o.size < 4) o.add(ans + rnd(11) - 5);
    row.innerHTML = '';
    [...o].sort(() => Math.random() - .5).forEach(v => {
      const k = mk('button', 'pick', v);
      k.onclick = () => { if (left <= 0) return; if (v === ans) { H.score(++sc); beep(660, .05); setTimeout(() => beep(880, .07), 60) } else beep(150, .15, 'sawtooth'); ask() };
      row.append(k);
    });
  }
  tk = setInterval(() => { left--; msg.textContent = 'Осталось: ' + left + ' с'; if (left <= 0) { clearInterval(tk); row.innerHTML = ''; q.textContent = 'Время! Решено: ' + sc; H.rec(sc) } }, 1000);
  box.append(q, row, msg); ask();
  return () => clearInterval(tk);
}

/* ============ ИГРА 12: Четыре в ряд ============ */
function runFour(box, H) {
  const C = 7, R = 6, D = [1, 3, 5][H.lvl]; let b, over, wins = 0, t, busy;
  const msg = mk('div', 'msg'), g = mk('div', 'g');
  g.style.cssText = `grid-template-columns:repeat(${C},auto);--s:min(58px,11.5vw);gap:5px;padding:8px;background:var(--sky);border:3px solid var(--ink);border-radius:18px`;
  const els = [...Array(C * R)].map((_, i) => { const e = mk('button', 'c'); e.style.cssText = 'border-radius:50%;font-size:calc(var(--s)*.8)'; e.onclick = () => drop(i % C); g.append(e); return e });
  const lines = []; /* все возможные «четвёрки» на поле */
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { const y = r + dr * 3, x = c + dc * 3; if (y < R && x >= 0 && x < C) lines.push([0, 1, 2, 3].map(k => (r + dr * k) * C + c + dc * k)) }
  const win = (b, p) => lines.some(l => l.every(i => b[i] === p));
  const row = (b, c) => { for (let r = R - 1; r >= 0; r--) if (!b[r * C + c]) return r; return -1 };
  const ev = b => {
    let s = 0;
    for (const l of lines) { let o = 0, x = 0; l.forEach(i => { if (b[i] === 'O') o++; else if (b[i] === 'X') x++ }); if (o && x) continue; if (o) s += o === 3 ? 10 : o === 2 ? 3 : 0; else if (x) s -= x === 3 ? 12 : x === 2 ? 3 : 0 }
    for (let r = 0; r < R; r++) s += b[r * C + 3] === 'O' ? 2 : b[r * C + 3] === 'X' ? -2 : 0;
    return s;
  };
  /* minimax с отсечением: компьютер — «O» */
  const mm = (b, d, a, be, p) => {
    if (win(b, 'O')) return 1000 + d; if (win(b, 'X')) return -1000 - d;
    const cols = [3, 2, 4, 1, 5, 0, 6].filter(c => row(b, c) >= 0);
    if (!cols.length || !d) return ev(b);
    let best = p === 'O' ? -1e9 : 1e9;
    for (const c of cols) {
      const r = row(b, c); b[r * C + c] = p; const v = mm(b, d - 1, a, be, p === 'O' ? 'X' : 'O'); b[r * C + c] = '';
      if (p === 'O') { best = Math.max(best, v); a = Math.max(a, v) } else { best = Math.min(best, v); be = Math.min(be, v) }
      if (a >= be) break;
    }
    return best;
  };
  function ai() {
    const cols = [0, 1, 2, 3, 4, 5, 6].filter(c => row(b, c) >= 0);
    if (D === 1 && Math.random() < .35) return cols[rnd(cols.length)];
    let bs = -1e9, pool = [];
    cols.forEach(c => { const r = row(b, c); b[r * C + c] = 'O'; const v = mm(b, D - 1, -1e9, 1e9, 'X'); b[r * C + c] = ''; if (v > bs) { bs = v; pool = [c] } else if (v === bs) pool.push(c) });
    return pool[rnd(pool.length)];
  }
  const paint = () => els.forEach((e, i) => { const v = b[i]; e.innerHTML = v ? ic('circle-fill') : ''; e.style.color = v === 'X' ? 'var(--coral)' : 'var(--sun)' });
  function reset() { clearTimeout(t); b = Array(C * R).fill(''); over = false; busy = false; msg.innerHTML = 'Твой ход — выбери столбец'; paint() }
  function end(p) {
    over = true;
    if (p === 'X') { H.score(++wins); H.rec(wins); msg.textContent = 'Четыре в ряд! Ты выиграл' }
    else if (p === 'O') { wins = 0; H.score(0); msg.textContent = 'Выиграл компьютер'; beep(150, .3, 'sawtooth') }
    else msg.textContent = 'Ничья!';
    t = setTimeout(reset, 1900); return true;
  }
  function put(c, p) {
    b[row(b, c) * C + c] = p; beep(p === 'X' ? 520 : 400, .08); paint();
    if (win(b, p)) return end(p); if (!b.includes('')) return end('='); return false;
  }
  function drop(c) {
    if (over || busy || row(b, c) < 0) return;
    if (put(c, 'X')) return;
    busy = true; msg.textContent = 'Компьютер думает…';
    t = setTimeout(() => { busy = false; if (!put(ai(), 'O')) msg.textContent = 'Твой ход' }, 450);
  }
  box.append(msg, g); reset();
  return () => clearTimeout(t);
}

/* ============ ИГРА 13: Пятнашки ============ */
function runSlide(box, H) {
  const N = [3, 4, 5][H.lvl]; let b = [...Array(N * N).keys()].map(i => (i + 1) % (N * N)), moves = 0, done = false;
  const msg = mk('div', 'msg', 'Расставь числа по порядку. Стрелки тоже работают'), g = mk('div', 'g');
  g.style.cssText = `grid-template-columns:repeat(${N},auto);--s:min(${[96, 80, 64][H.lvl]}px,${[26, 19, 16][H.lvl]}vw)`;
  const els = b.map((_, i) => { const e = mk('button', 'c'); e.onclick = () => move(i); g.append(e); return e });
  const nbr = i => { const r = i / N | 0, c = i % N, o = []; if (r) o.push(i - N); if (r < N - 1) o.push(i + N); if (c) o.push(i - 1); if (c < N - 1) o.push(i + 1); return o };
  const paint = () => b.forEach((v, i) => { const e = els[i]; e.textContent = v || ''; e.style.visibility = v ? 'visible' : 'hidden'; e.style.background = v === i + 1 ? 'var(--mint)' : '' });
  /* перемешиваем случайными ходами — решение всегда существует */
  let z = N * N - 1, prev = -1;
  for (let k = 0; k < 60 * N * N; k++) { const o = nbr(z).filter(i => i !== prev), m = o[rnd(o.length)]; b[z] = b[m]; b[m] = 0; prev = z; z = m }
  const solved = () => b.every((v, i) => v === (i + 1) % (N * N));
  if (solved()) { b[N * N - 1] = b[N * N - 2]; b[N * N - 2] = 0 }
  function move(i) {
    if (done) return; const z = b.indexOf(0); if (!nbr(z).includes(i)) return;
    b[z] = b[i]; b[i] = 0; H.score(++moves); beep(380 + (b[z] % 7) * 40, .05); paint();
    if (solved()) { done = true; msg.textContent = 'Собрано за ' + moves + ' ходов!'; H.rec(moves) }
  }
  const km = { ArrowUp: N, ArrowDown: -N, ArrowLeft: 1, ArrowRight: -1, w: N, 'ц': N, s: -N, 'ы': -N, a: 1, 'ф': 1, d: -1, 'в': -1 };
  const kd = e => { if (!(e.key in km)) return; e.preventDefault(); move(b.indexOf(0) + km[e.key]) };
  addEventListener('keydown', kd);
  paint(); box.append(g, msg);
  return () => removeEventListener('keydown', kd);
}

/* ============ ИГРА 14: Виселица ============ */
function runHang(box, H) {
  const WORDS = [
    ['КОТ', 'ДОМ', 'ЛЕС', 'МОРЕ', 'ЛУНА', 'РЕКА', 'ГОРА', 'ЛИСА', 'СНЕГ', 'ДРУГ', 'ХЛЕБ', 'ОГОНЬ', 'ПТИЦА', 'ЗВЕЗДА', 'СОЛНЦЕ', 'ЦВЕТОК'],
    ['КОНФЕТИ', 'ХЛОПУШКА', 'ПОДАРОК', 'БАБОЧКА', 'КАРАНДАШ', 'ЯБЛОКО', 'ЛАСТОЧКА', 'ПЛАНЕТА', 'ГИТАРА', 'ШОКОЛАД', 'ПАРАШЮТ', 'РАДУГА', 'МОРОЖЕНОЕ', 'ВЕЛОСИПЕД'],
    ['ПУТЕШЕСТВИЕ', 'ПРИКЛЮЧЕНИЕ', 'ТЕЛЕСКОП', 'КРОССВОРД', 'СКАЗОЧНИК', 'ЧЕМПИОНАТ', 'ФОТОГРАФИЯ', 'ЛАБОРАТОРИЯ', 'ХУДОЖНИК', 'АКВАРИУМ', 'ШАХМАТИСТ', 'ПОДСОЛНУХ']
  ][H.lvl], LIVES = [8, 6, 5][H.lvl], ABC = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
  const P = ['<path d="M10 124h70"/>', '<path d="M30 124V12"/>', '<path d="M30 12h56M30 34l22-22"/>', '<path d="M86 12v18"/>', '<circle cx="86" cy="40" r="10" fill="var(--paper)"/>', '<path d="M86 50v36"/>', '<path d="M86 60l-16 14M86 60l16 14"/>', '<path d="M86 86l-14 24M86 86l14 24"/>'];
  let word = '', got, used, bad, streak = 0, over, t;
  const pic = mk('div'), wd = mk('div', 'msg'), msg = mk('div', 'msg'), kb = mk('div', 'row');
  wd.style.cssText = 'font-size:1.9rem;letter-spacing:.2em;min-height:1.6em';
  kb.style.cssText = 'max-width:470px;--s:min(40px,8.4vw)';
  const keys = {};
  [...ABC].forEach(ch => { const k = mk('button', 'c', ch); k.style.fontSize = '1rem'; k.onclick = () => guess(ch); keys[ch] = k; kb.append(k) });
  const paint = () => {
    const n = Math.ceil(bad * P.length / LIVES);
    pic.innerHTML = `<svg viewBox="0 0 120 130" width="150" height="162"><g fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${P.slice(0, n).join('')}</g></svg>`;
    wd.textContent = [...word].map(ch => got.has(ch) ? ch : '_').join('');
  };
  function next() {
    clearTimeout(t); let w; do w = WORDS[rnd(WORDS.length)]; while (w === word && WORDS.length > 1);
    word = w; got = new Set(); used = new Set(); bad = 0; over = false;
    Object.values(keys).forEach(k => { k.disabled = false; k.style.background = '' });
    msg.textContent = 'Ошибок: 0 из ' + LIVES; paint();
  }
  function guess(ch) {
    if (over || used.has(ch)) return; used.add(ch); keys[ch].disabled = true;
    if (word.includes(ch)) { got.add(ch); keys[ch].style.background = 'var(--mint)'; beep(660, .06) }
    else { bad++; keys[ch].style.background = 'var(--coral)'; beep(180, .12, 'sawtooth') }
    msg.textContent = 'Ошибок: ' + bad + ' из ' + LIVES; paint();
    if ([...word].every(c => got.has(c))) { over = true; H.score(++streak); H.rec(streak, 1); msg.textContent = 'Верно! Слово угадано'; t = setTimeout(next, 1500) }
    else if (bad >= LIVES) { over = true; streak = 0; H.score(0); wd.textContent = word; msg.textContent = 'Увы! Это было слово «' + word + '»'; beep(120, .4, 'sawtooth'); t = setTimeout(next, 2400) }
  }
  const kd = e => { const ch = e.key.toUpperCase(); if (ch.length === 1 && ABC.includes(ch)) guess(ch) };
  addEventListener('keydown', kd);
  box.append(pic, wd, msg, kb); next();
  return () => { clearTimeout(t); removeEventListener('keydown', kd) };
}

/* ============ ИГРА 15: Лампочки ============ */
function runLights(box, H) {
  const N = [3, 4, 5][H.lvl]; let b = Array(N * N).fill(0), moves = 0, done = false;
  const msg = mk('div', 'msg', 'Нажми на лампочку — переключатся она и соседи. Погаси все!'), g = mk('div', 'g');
  g.style.cssText = `grid-template-columns:repeat(${N},auto);--s:min(${[96, 80, 68][H.lvl]}px,${[26, 19, 16][H.lvl]}vw)`;
  const els = b.map((_, i) => { const e = mk('button', 'c'); e.style.fontSize = 'calc(var(--s)*.5)'; e.onclick = () => tap(i); g.append(e); return e });
  const nb = i => { const r = i / N | 0, c = i % N, o = [i]; if (r) o.push(i - N); if (r < N - 1) o.push(i + N); if (c) o.push(i - 1); if (c < N - 1) o.push(i + 1); return o };
  const paint = () => els.forEach((e, i) => { e.innerHTML = ic(b[i] ? 'lightbulb-fill' : 'lightbulb'); e.style.background = b[i] ? 'var(--sun)' : ''; e.style.color = b[i] ? '#2b2620' : '' });
  do { b.fill(0); for (let k = 0; k < N * N + 3; k++) nb(rnd(N * N)).forEach(j => b[j] ^= 1) } while (!b.some(v => v)); /* стартовое поле всегда решаемо */
  function tap(i) {
    if (done) return; nb(i).forEach(k => b[k] ^= 1); H.score(++moves); beep(b[i] ? 700 : 420, .06); paint();
    if (b.every(v => !v)) { done = true; msg.textContent = 'Свет погашен за ' + moves + ' ходов!'; H.rec(moves) }
  }
  paint(); box.append(g, msg);
}

/* ============ ИГРА 16: Цвет и слово (тест Струпа, 30 секунд) ============ */
function runStroop(box, H) {
  const CL = [['Красный', '#e0524a'], ['Синий', '#4a78d6'], ['Зелёный', '#3fa876'], ['Жёлтый', '#e0b020'], ['Фиолетовый', '#8a5bd6'], ['Оранжевый', '#ee8a3a']].slice(0, [4, 5, 6][H.lvl]);
  let sc = 0, left = 30, ink, tk;
  const q = mk('div', 'verdict'), row = mk('div', 'row'), msg = mk('div', 'msg', 'Нажимай на цвет букв, а не на само слово! Осталось: 30 с');
  q.style.cssText = 'font-size:clamp(2rem,9vw,3.6rem);min-width:min(420px,86vw);padding:.35em 1em;paint-order:stroke fill;-webkit-text-stroke:6px var(--ink)';
  function ask() {
    const w = rnd(CL.length); ink = Math.random() < .2 ? w : (w + 1 + rnd(CL.length - 1)) % CL.length;
    q.textContent = CL[w][0].toUpperCase(); q.style.color = CL[ink][1];
  }
  function answer(i) {
    if (left <= 0) return;
    if (i === ink) { H.score(++sc); beep(700, .05) } else { sc = Math.max(0, sc - 1); H.score(sc); beep(150, .15, 'sawtooth') }
    ask();
  }
  CL.forEach(([n, c], i) => { const k = mk('button', 'pick', `<span>${n}</span>`); k.style.cssText = `background:${c};color:#2b2620`; k.onclick = () => answer(i); row.append(k) });
  tk = setInterval(() => {
    left--; msg.textContent = 'Нажимай на цвет букв, а не на само слово! Осталось: ' + left + ' с';
    if (left <= 0) { clearInterval(tk); row.innerHTML = ''; q.style.cssText = ''; q.style.color = ''; q.textContent = 'Время! Очков: ' + sc; msg.textContent = ''; if (sc) H.rec(sc) }
  }, 1000);
  box.append(q, row, msg); ask();
  return () => clearInterval(tk);
}

/* ============ ИГРА 17: Арканоид ============ */
function runBrk(box, H) {
  const W = Math.min(400, innerWidth - 32), HH = Math.max(300, Math.min(W * 1.1, innerHeight - 300)) | 0;
  const cv = mk('canvas'), x = cv.getContext('2d'), msg = mk('div', 'msg', 'Мышь, палец или стрелки — двигать. Клик или пробел — запуск');
  cv.width = W; cv.height = HH;
  const rows = [4, 5, 6][H.lvl], cols = 8, bw = W / cols, bh = 20, top = 40, sp = [4.2, 5.4, 6.6][H.lvl] * W / 400, r = 7, pw = W * [.26, .2, .16][H.lvl], py = HH - 28, ph = 12;
  const COL = ['--coral', '--sun', '--mint', '--sky'], css = v => getComputedStyle(root).getPropertyValue(v).trim();
  const NT = [262, 294, 330, 392, 440, 523, 587, 659], bricks = [...Array(rows * cols)].map((_, i) => ({ k: ((i / cols | 0) * 3 + i % cols) % 8, n: i % cols, x: (i % cols) * bw, y: top + (i / cols | 0) * bh, c: COL[(i / cols | 0) % 4], a: 1 }));
  let px = W / 2, ball = { x: W / 2, y: py - r, vx: 0, vy: 0 }, st = 'ready', lives = 3, sc = 0, left = bricks.length, raf, last = 0, dir = 0, lab = store.get('brkLab', false);
  const held = new Set(), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const launch = () => { if (st !== 'ready') return; const a = (Math.random() - .5) * .9; ball.vx = sp * Math.sin(a); ball.vy = -sp * Math.cos(a); st = 'run'; msg.textContent = 'Лови мяч платформой!' };
  function step(dt) {
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.x < r) { ball.x = r; ball.vx = Math.abs(ball.vx) } else if (ball.x > W - r) { ball.x = W - r; ball.vx = -Math.abs(ball.vx) }
    if (ball.y < r) { ball.y = r; ball.vy = Math.abs(ball.vy) }
    if (ball.vy > 0 && ball.y + r >= py && ball.y + r <= py + ph + ball.vy * dt + 2 && Math.abs(ball.x - px) <= pw / 2 + r) {
      const a = clamp((ball.x - px) / (pw / 2), -1, 1) * 1.1; /* угол отскока зависит от места удара */
      ball.vx = sp * Math.sin(a); ball.vy = -sp * Math.cos(a); ball.y = py - r; beep(420, .05, 'triangle');
    }
    for (const b of bricks) {
      if (!b.a) continue;
      const cx = clamp(ball.x, b.x, b.x + bw), cy = clamp(ball.y, b.y, b.y + bh), dx = ball.x - cx, dy = ball.y - cy;
      if (dx * dx + dy * dy > r * r) continue;
      b.a = 0; left--; H.score(sc += 10); play(b.k, NT[b.n]); /* инструмент зависит от кирпичика, нота — от столбца */
      if (Math.abs(dx) > Math.abs(dy)) ball.vx = dx > 0 ? Math.abs(ball.vx) : -Math.abs(ball.vx); else ball.vy = dy > 0 ? Math.abs(ball.vy) : -Math.abs(ball.vy);
      break;
    }
    if (!left) { st = 'over'; msg.textContent = 'Всё разбито! Счёт: ' + sc; H.rec(sc) }
    else if (ball.y > HH + r) {
      beep(150, .3, 'sawtooth');
      if (--lives <= 0) { st = 'over'; msg.textContent = 'Конец! Счёт: ' + sc + '. Нажми «Заново»'; if (sc) H.rec(sc) }
      else { ball.vx = ball.vy = 0; st = 'ready'; msg.textContent = 'Осталось жизней: ' + lives }
    }
  }
  function draw() {
    const cc = {}, col = n => cc[n] || (cc[n] = css(n));
    x.fillStyle = col('--paper'); x.fillRect(0, 0, W, HH); x.strokeStyle = col('--ink'); x.lineWidth = 2;
    bricks.forEach(b => { if (!b.a) return; x.fillStyle = col(b.c); x.beginPath(); x.roundRect(b.x + 1.5, b.y + 1.5, bw - 3, bh - 3, 5); x.fill(); x.stroke(); if (lab) { x.fillStyle = col('--ink'); x.font = '700 9px Onest,sans-serif'; x.textAlign = 'center'; x.fillText(INST[b.k][0].slice(0, 4), b.x + bw / 2, b.y + bh / 2 + 3); x.textAlign = 'left' } });
    x.fillStyle = col('--ink'); x.beginPath(); x.roundRect(px - pw / 2, py, pw, ph, 6); x.fill();
    x.fillStyle = col('--coral'); x.beginPath(); x.arc(ball.x, ball.y, r, 0, 7); x.fill(); x.stroke();
    x.fillStyle = col('--ink'); x.font = '800 14px Onest,sans-serif'; x.fillText('Жизни: ' + lives, 10, 24);
  }
  function frame(ts) {
    const dt = Math.min(2.5, (ts - (last || ts)) / 16.67); last = ts;
    if (dir) px = clamp(px + dir * sp * 1.5 * dt, pw / 2, W - pw / 2);
    if (st === 'ready') { ball.x = px; ball.y = py - r } else if (st === 'run') step(dt);
    draw(); raf = requestAnimationFrame(frame);
  }
  cv.onpointermove = e => { const rc = cv.getBoundingClientRect(); px = clamp((e.clientX - rc.left) * W / rc.width, pw / 2, W - pw / 2) };
  cv.onpointerdown = e => { cv.onpointermove(e); launch() };
  const L = ['ArrowLeft', 'a', 'ф'], Rt = ['ArrowRight', 'd', 'в'];
  const sync = () => { dir = (held.has('L') ? -1 : 0) + (held.has('R') ? 1 : 0) };
  const kd = e => { if (e.key === ' ') { e.preventDefault(); launch() } else if (L.includes(e.key)) { e.preventDefault(); held.add('L'); sync() } else if (Rt.includes(e.key)) { e.preventDefault(); held.add('R'); sync() } };
  const ku = e => { if (L.includes(e.key)) held.delete('L'); else if (Rt.includes(e.key)) held.delete('R'); sync() };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  const lb = mk('button', ''), lbSet = () => { lb.innerHTML = ic(lab ? 'eye-fill' : 'eye-slash-fill') + ' Подписи инструментов: ' + (lab ? 'вкл' : 'выкл') };
  lb.onclick = () => { lab = !lab; store.set('brkLab', lab); lbSet() }; lbSet();
  box.append(cv, msg, lb); raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('keyup', ku) };
}

/* ============ ИГРА 18: Тетрис ============ */
function runTetris(box, H) {
  const C = 10, R = 20, cs = Math.max(14, Math.min(26, (innerHeight - 380) / R | 0, (innerWidth - 40) / C | 0));
  const cv = mk('canvas'), x = cv.getContext('2d'), msg = mk('div', 'msg', '←→ двигать, ↑ повернуть, ↓ ускорить, пробел — сбросить'), pad = mk('div', 'row');
  cv.width = C * cs; cv.height = R * cs;
  const SH = [[[-1,0],[0,0],[1,0],[2,0]], [[0,0],[1,0],[0,1],[1,1]], [[-1,0],[0,0],[1,0],[0,1]], [[0,0],[1,0],[-1,1],[0,1]], [[-1,0],[0,0],[0,1],[1,1]], [[-1,0],[0,0],[1,0],[-1,1]], [[-1,0],[0,0],[1,0],[1,1]]];
  let g = Array(C * R).fill(-1), p, sc = 0, lines = 0, tm, over = false;
  const dk = () => root.dataset.theme === 'dark', col = i => `hsl(${i * 51 + 8} ${dk() ? 38 : 68}% ${dk() ? 52 : 64}%)`;
  const ok = (s, px, py) => s.every(([a, b]) => { const X = px + a, Y = py + b; return X >= 0 && X < C && Y < R && (Y < 0 || g[Y * C + X] < 0) });
  function draw() {
    const st = getComputedStyle(root); x.fillStyle = st.getPropertyValue('--paper'); x.fillRect(0, 0, C * cs, R * cs); x.strokeStyle = st.getPropertyValue('--ink'); x.lineWidth = 2;
    const cell = (X, Y, c) => { x.fillStyle = col(c); x.fillRect(X * cs + 1, Y * cs + 1, cs - 2, cs - 2); x.strokeRect(X * cs + 1, Y * cs + 1, cs - 2, cs - 2) };
    g.forEach((v, i) => { if (v >= 0) cell(i % C, i / C | 0, v) });
    if (p && !over) p.s.forEach(([a, b]) => cell(p.x + a, p.y + b, p.c));
  }
  function end() { over = true; clearInterval(tm); beep(150, .4, 'sawtooth'); msg.textContent = 'Стакан полон! Счёт: ' + sc + '. Нажми «Заново»'; if (sc) H.rec(sc) }
  function spawn() { const i = rnd(7); p = { s: SH[i], x: 4, y: 0, c: i }; if (!ok(p.s, p.x, p.y)) end(); draw() }
  const loop = () => { clearInterval(tm); tm = setInterval(tick, Math.max(90, [650, 480, 320][H.lvl] - lines * 12)) }; /* с каждой линией быстрее */
  function mv(dx, dy) { if (over || !ok(p.s, p.x + dx, p.y + dy)) return false; p.x += dx; p.y += dy; draw(); return true }
  function rot() { if (over || p.c === 1) return; const s = p.s.map(([a, b]) => [-b, a]); for (const d of [0, -1, 1, -2, 2]) if (ok(s, p.x + d, p.y)) { p.s = s; p.x += d; beep(600, .04, 'square'); draw(); return } }
  function lock() {
    p.s.forEach(([a, b]) => { const Y = p.y + b; if (Y >= 0) g[Y * C + p.x + a] = p.c });
    let n = 0; for (let r = R - 1; r >= 0; r--) if (g.slice(r * C, r * C + C).every(v => v >= 0)) { g.splice(r * C, C); g.unshift(...Array(C).fill(-1)); n++; r++ }
    if (n) { lines += n; sc += [0, 100, 300, 500, 800][n]; H.score(sc); H.rec(sc, 1); beep(500 + n * 120, .15, 'triangle', 900 + n * 100); loop() } else beep(160, .05, 'square');
    spawn();
  }
  const tick = () => { if (!mv(0, 1)) lock() }, hard = () => { if (over) return; while (mv(0, 1)); lock() };
  const kd = e => { const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'ф') mv(-1, 0); else if (k === 'ArrowRight' || k === 'd' || k === 'в') mv(1, 0); else if (k === 'ArrowUp' || k === 'w' || k === 'ц') rot();
    else if (k === 'ArrowDown' || k === 's' || k === 'ы') tick(); else if (k === ' ') hard(); else return; e.preventDefault() };
  addEventListener('keydown', kd);
  [['arrow-left', () => mv(-1, 0)], ['arrow-clockwise', rot], ['arrow-right', () => mv(1, 0)], ['arrow-down', tick], ['chevron-double-down', hard]].forEach(([i, f]) => {
    const k = mk('button', 'c', ic(i)); k.style.cssText = '--s:50px;font-size:1.2rem'; k.onpointerdown = e => { e.preventDefault(); f() }; pad.append(k);
  });
  box.append(cv, msg, pad); spawn(); loop();
  return () => { clearInterval(tm); removeEventListener('keydown', kd) };
}

/* ============ ИГРА 19: Птичка ============ */
function runFlap(box, H) {
  const CW = Math.max(260, Math.min(380, innerWidth - 32)), CH = Math.max(320, Math.min(520, innerHeight - 290)) | 0;
  const cv = mk('canvas'), x = cv.getContext('2d'), msg = mk('div', 'msg', 'Нажми на поле или пробел — взмах'); cv.width = CW; cv.height = CH;
  const GAP = [150, 125, 105][H.lvl], SP = [2.2, 2.7, 3.2][H.lvl], css = v => getComputedStyle(root).getPropertyValue(v);
  let y = CH / 2, vy = 0, pipes = [], sc = 0, f = 0, go = false, dead = false, raf, acc = 0, last = 0;
  const flap = () => { if (dead) return; if (!go) { go = true; f = 0; msg.textContent = '' } vy = -6.3; beep(520, .08, 'sine', 800) };
  function die() { dead = true; beep(150, .4, 'sawtooth'); msg.textContent = 'Бум! Счёт: ' + sc + '. Нажми «Заново»'; if (sc) H.rec(sc) }
  function upd() {
    if (!go) { y = CH / 2 + Math.sin(f++ / 15) * 6; return }
    vy += .36; y += vy; if (f++ % 95 === 0) pipes.push({ x: CW, g: 60 + rnd(CH - GAP - 120), p: 0 });
    pipes.forEach(q => { q.x -= SP; if (!q.p && q.x + 52 < 70) { q.p = 1; H.score(++sc); beep(700, .06, 'triangle') } });
    pipes = pipes.filter(q => q.x > -60);
    if (y < 11 || y > CH - 11 || pipes.some(q => 80 > q.x && 60 < q.x + 52 && (y - 9 < q.g || y + 9 > q.g + GAP))) die();
  }
  function draw() {
    x.fillStyle = css('--paper'); x.fillRect(0, 0, CW, CH); x.strokeStyle = css('--ink'); x.lineWidth = 3; x.fillStyle = css('--mint');
    pipes.forEach(q => { x.fillRect(q.x, -4, 52, q.g + 4); x.strokeRect(q.x, -4, 52, q.g + 4); x.fillRect(q.x, q.g + GAP, 52, CH); x.strokeRect(q.x, q.g + GAP, 52, CH) });
    x.save(); x.translate(70, y); x.rotate(Math.max(-.5, Math.min(1, vy / 10)));
    x.fillStyle = css('--sun'); x.beginPath(); x.arc(0, 0, 11, 0, 7); x.fill(); x.stroke();
    x.fillStyle = css('--coral'); x.beginPath(); x.moveTo(9, -1); x.lineTo(19, 3); x.lineTo(9, 7); x.fill();
    x.fillStyle = css('--ink'); x.beginPath(); x.arc(4, -4, 2, 0, 7); x.fill(); x.restore();
    x.font = '900 28px Unbounded,sans-serif'; x.textAlign = 'center'; x.fillText(sc, CW / 2, 44);
  }
  function frame(ts) { acc += Math.min(50, ts - (last || ts)); last = ts; while (acc >= 16.67) { acc -= 16.67; if (!dead) upd() } draw(); raf = requestAnimationFrame(frame) }
  cv.onpointerdown = flap;
  const kd = e => { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'ц') { e.preventDefault(); flap() } };
  addEventListener('keydown', kd); box.append(cv, msg); raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); removeEventListener('keydown', kd) };
}

/* ============ ИГРА 20: Заливка ============ */
function runFlood(box, H) {
  const N = [9, 12, 14][H.lvl], LIM = [16, 22, 25][H.lvl], K = 6, dk = root.dataset.theme === 'dark';
  const col = i => `hsl(${[8, 45, 150, 200, 265, 320][i]} ${dk ? 40 : 70}% ${dk ? 50 : 62}%)`;
  let b = Array.from({ length: N * N }, () => rnd(K)), moves = 0, done = false;
  const g = mk('div', 'g'), msg = mk('div', 'msg', `Ходов: 0 из ${LIM}`), pal = mk('div', 'row');
  g.style.cssText = `grid-template-columns:repeat(${N},auto);gap:2px;--s:min(28px,${88 / N | 0}vw)`;
  const cells = b.map(() => { const e = mk('div', 'c'); e.style.borderRadius = '5px'; g.append(e); return e });
  const paint = () => cells.forEach((e, i) => e.style.background = col(b[i]));
  for (let i = 0; i < K; i++) { const k = mk('button', 'c'); k.style.cssText = `--s:44px;border-radius:50%;background:${col(i)}`; k.onclick = () => pick(i); pal.append(k) }
  function pick(ci) {
    if (done || ci === b[0]) return; const old = b[0], st = [0], seen = new Set([0]);
    while (st.length) { const i = st.pop(); b[i] = ci; for (const j of [i - N, i + N, i % N ? i - 1 : -1, (i + 1) % N ? i + 1 : -1]) if (j >= 0 && j < N * N && !seen.has(j) && b[j] === old) { seen.add(j); st.push(j) } }
    H.score(++moves); paint(); beep(300 + ci * 80, .07);
    if (b.every(v => v === b[0])) { done = true; msg.textContent = 'Победа за ' + moves + ' ходов!'; H.rec(moves) }
    else if (moves >= LIM) { done = true; msg.textContent = 'Ходы кончились. Нажми «Заново»'; beep(150, .4, 'sawtooth') }
    else msg.textContent = `Ходов: ${moves} из ${LIM}`;
  }
  box.append(g, pal, msg); paint();
}

/* ============ ИГРА 21: Лабиринт ============ */
function runMaze(box, H) {
  const N = [9, 13, 18][H.lvl], S = Math.max(240, Math.min(440, innerWidth - 32, innerHeight - 380)), cs = S / N;
  const cv = mk('canvas'), x = cv.getContext('2d'), msg = mk('div', 'msg', 'Доберись до флажка. Время пойдёт с первого шага'), pad = mk('div', 'dpad'); cv.width = cv.height = S;
  const D = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]], w = Array(N * N).fill(15), seen = new Set([0]), st = [0];
  while (st.length) { /* генерация: обход в глубину */
    const i = st[st.length - 1], nb = D.map(([dx, dy, a, b]) => [i % N + dx, (i / N | 0) + dy, a, b]).filter(([X, Y]) => X >= 0 && Y >= 0 && X < N && Y < N && !seen.has(Y * N + X));
    if (!nb.length) { st.pop(); continue }
    const [X, Y, a, b] = nb[rnd(nb.length)], j = Y * N + X; w[i] &= ~a; w[j] &= ~b; seen.add(j); st.push(j);
  }
  let p = 0, t0 = 0, tm, done = false; const trail = new Set([0]), css = v => getComputedStyle(root).getPropertyValue(v);
  function draw() {
    x.fillStyle = css('--paper'); x.fillRect(0, 0, S, S); x.fillStyle = css('--mint'); x.globalAlpha = .45; trail.forEach(i => x.fillRect((i % N) * cs, (i / N | 0) * cs, cs, cs)); x.globalAlpha = 1;
    const e = N * N - 1; x.fillStyle = css('--sun'); x.fillRect((e % N) * cs + 2, (e / N | 0) * cs + 2, cs - 4, cs - 4);
    x.strokeStyle = css('--ink'); x.lineWidth = 2.5; x.lineCap = 'round'; x.beginPath();
    w.forEach((v, i) => { const X = (i % N) * cs, Y = (i / N | 0) * cs; if (v & 1) { x.moveTo(X, Y); x.lineTo(X + cs, Y) } if (v & 2) { x.moveTo(X + cs, Y); x.lineTo(X + cs, Y + cs) } if (v & 4) { x.moveTo(X, Y + cs); x.lineTo(X + cs, Y + cs) } if (v & 8) { x.moveTo(X, Y); x.lineTo(X, Y + cs) } });
    x.stroke(); x.fillStyle = css('--coral'); x.beginPath(); x.arc((p % N + .5) * cs, ((p / N | 0) + .5) * cs, cs * .3, 0, 7); x.fill(); x.stroke();
  }
  function move(dx, dy) {
    const d = D.find(a => a[0] === dx && a[1] === dy); if (done || (w[p] & d[2])) return;
    if (!t0) { t0 = Date.now(); tm = setInterval(() => H.score((Date.now() - t0) / 1000 | 0), 250) }
    p += dy * N + dx; trail.add(p); beep(300 + trail.size % 12 * 25, .04); draw();
    if (p === N * N - 1) { done = true; clearInterval(tm); const s = Math.max(1, Math.round((Date.now() - t0) / 1000)); H.score(s); H.rec(s); msg.textContent = 'Выход найден за ' + s + ' с!' }
  }
  const keys = { ArrowUp: [0,-1], w: [0,-1], 'ц': [0,-1], ArrowDown: [0,1], s: [0,1], 'ы': [0,1], ArrowLeft: [-1,0], a: [-1,0], 'ф': [-1,0], ArrowRight: [1,0], d: [1,0], 'в': [1,0] };
  const kd = e => { const k = keys[e.key]; if (k) { e.preventDefault(); move(...k) } }; addEventListener('keydown', kd);
  [['u', 'chevron-up', 0, -1], ['l', 'chevron-left', -1, 0], ['d', 'chevron-down', 0, 1], ['r', 'chevron-right', 1, 0]].forEach(([n, i, dx, dy]) => { const k = mk('button', 'c ' + n, ic(i)); k.onpointerdown = e => { e.preventDefault(); move(dx, dy) }; pad.append(k) });
  let t1; cv.ontouchstart = e => { t1 = e.touches[0] };
  cv.ontouchend = e => { const t = e.changedTouches[0], dx = t.clientX - t1.clientX, dy = t.clientY - t1.clientY; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; Math.abs(dx) > Math.abs(dy) ? move(Math.sign(dx), 0) : move(0, Math.sign(dy)) };
  box.append(cv, msg, pad); draw();
  return () => { clearInterval(tm); removeEventListener('keydown', kd) };
}

/* ============ ИГРА 22: Ханойская башня ============ */
function runHanoi(box, H) {
  const N = [3, 4, 5][H.lvl]; let pegs = [[...Array(N).keys()].map(i => N - i), [], []], sel = -1, moves = 0, done = false;
  const row = mk('div', 'row'), msg = mk('div', 'msg', `Перенеси башню на правый стержень. Минимум ходов: ${2 ** N - 1}`);
  const els = [0, 1, 2].map(i => { const e = mk('button', 'peg'); e.onclick = () => tap(i); row.append(e); return e });
  const dk = root.dataset.theme === 'dark';
  const paint = () => els.forEach((e, i) => { e.innerHTML = '<span class="pole"></span>' + pegs[i].map(d => `<span class="dk" style="width:${26 + d * 14}%;background:hsl(${d * 55} ${dk ? 38 : 65}% ${dk ? 50 : 66}%)"></span>`).join(''); e.classList.toggle('on', i === sel) });
  function tap(i) {
    if (done) return;
    if (sel < 0) { if (pegs[i].length) sel = i; paint(); return }
    if (i !== sel) {
      const d = pegs[sel][pegs[sel].length - 1], t = pegs[i][pegs[i].length - 1];
      if (!t || d < t) { pegs[i].push(pegs[sel].pop()); H.score(++moves); beep(380 + d * 60, .08) } else beep(150, .15, 'sawtooth');
    }
    sel = -1; paint();
    if (pegs[2].length === N) { done = true; msg.textContent = `Башня перенесена за ${moves} ходов! Минимум — ${2 ** N - 1}`; H.rec(moves) }
  }
  box.append(row, msg); paint();
}

/* ============ ИГРА 23: Понг ============ */
function runPong(box, H) {
  const CW = Math.max(280, Math.min(480, innerWidth - 32)), CH = Math.round(CW * .64), k = CW / 480, L = H.lvl;
  const cv = mk('canvas'), x = cv.getContext('2d'), msg = mk('div', 'msg', 'Двигай платформу мышью, пальцем или ↑↓. Три пропуска — конец'); cv.width = CW; cv.height = CH;
  const PH = CH * [.3, .24, .19][L], S0 = [4.2, 5, 6][L] * k, AI = [2.3, 3.3, 4.6][L] * k, r = 7 * k + 2, css = v => getComputedStyle(root).getPropertyValue(v), clamp = (v, a, c) => Math.max(a, Math.min(c, v));
  let py = CH / 2, ay = CH / 2, b, sc = 0, lives = 3, wait = 50, raf, acc = 0, last = 0, dir = 0, over = false; const held = new Set();
  function serve(to) { const a = (Math.random() - .5) * .8; b = { x: CW / 2, y: CH / 2, vx: S0 * Math.cos(a) * to, vy: S0 * Math.sin(a) }; wait = 50 }
  function upd() {
    py = clamp(py + dir * 6 * k, PH / 2, CH - PH / 2); ay += clamp((b.vx > 0 ? b.y : CH / 2) - ay, -AI, AI);
    if (wait > 0) { wait--; return }
    b.x += b.vx; b.y += b.vy;
    if (b.y < r || b.y > CH - r) { b.vy = -b.vy; b.y = clamp(b.y, r, CH - r); beep(300, .03, 'square') }
    if (b.vx < 0 && b.x - r <= 26 && b.x > 8 && Math.abs(b.y - py) <= PH / 2 + r) { const t = (b.y - py) / (PH / 2), s = Math.min(Math.hypot(b.vx, b.vy) * 1.04, S0 * 2); b.vx = s * Math.cos(t * .9); b.vy = s * Math.sin(t * .9); b.x = 26 + r; beep(440, .05, 'triangle') }
    if (b.vx > 0 && b.x + r >= CW - 26 && b.x < CW - 8 && Math.abs(b.y - ay) <= PH / 2 + r) { const t = (b.y - ay) / (PH / 2), s = Math.hypot(b.vx, b.vy); b.vx = -s * Math.cos(t * .9); b.vy = s * Math.sin(t * .9); b.x = CW - 26 - r; beep(340, .05, 'triangle') }
    if (b.x < -r) { beep(150, .3, 'sawtooth'); if (--lives <= 0) { over = true; msg.textContent = 'Конец! Очки: ' + sc + '. Нажми «Заново»'; if (sc) H.rec(sc) } else serve(1) }
    else if (b.x > CW + r) { H.score(++sc); beep(800, .1, 'triangle'); serve(-1) }
  }
  function draw() {
    x.fillStyle = css('--paper'); x.fillRect(0, 0, CW, CH); x.strokeStyle = css('--ink'); x.lineWidth = 3; x.setLineDash([8, 10]); x.beginPath(); x.moveTo(CW / 2, 0); x.lineTo(CW / 2, CH); x.stroke(); x.setLineDash([]);
    x.fillStyle = css('--ink'); x.beginPath(); x.roundRect(14, py - PH / 2, 10, PH, 5); x.roundRect(CW - 24, ay - PH / 2, 10, PH, 5); x.fill();
    x.fillStyle = css('--coral'); x.beginPath(); x.arc(b.x, b.y, r, 0, 7); x.fill(); x.stroke();
    x.fillStyle = css('--ink'); x.font = '800 14px Onest,sans-serif'; x.fillText('Жизни: ' + lives + '   Очки: ' + sc, 10, 20);
  }
  function frame(ts) { acc += Math.min(50, ts - (last || ts)); last = ts; while (acc >= 16.67) { acc -= 16.67; if (!over) upd() } draw(); raf = requestAnimationFrame(frame) }
  cv.onpointermove = e => { const rc = cv.getBoundingClientRect(); py = clamp((e.clientY - rc.top) * CH / rc.height, PH / 2, CH - PH / 2) };
  const U = ['ArrowUp', 'w', 'ц'], Dn = ['ArrowDown', 's', 'ы'], sync = () => { dir = (held.has('D') ? 1 : 0) - (held.has('U') ? 1 : 0) };
  const kd = e => { if (U.includes(e.key)) { e.preventDefault(); held.add('U'); sync() } else if (Dn.includes(e.key)) { e.preventDefault(); held.add('D'); sync() } };
  const ku = e => { if (U.includes(e.key)) held.delete('U'); else if (Dn.includes(e.key)) held.delete('D'); sync() };
  addEventListener('keydown', kd); addEventListener('keyup', ku); serve(1); box.append(cv, msg); raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('keyup', ku) };
}

/* ============ ИГРА 24: Таблица Шульте ============ */
function runSchulte(box, H) {
  const N = [3, 4, 5][H.lvl], T = N * N; let nx = 1, t0 = 0, tk, done = false;
  const msg = mk('div', 'msg', 'Ищи: 1'), g = mk('div', 'g');
  g.style.cssText = `grid-template-columns:repeat(${N},auto);--s:min(${N > 4 ? 64 : 80}px,${Math.floor(86 / N)}vw)`;
  [...Array(T).keys()].map(i => i + 1).sort(() => Math.random() - .5).forEach(v => {
    const c = mk('button', 'c', v);
    c.onclick = () => {
      if (done) return; if (v !== nx) return beep(150, .12, 'sawtooth');
      if (nx === 1) { t0 = Date.now(); tk = setInterval(() => H.score(((Date.now() - t0) / 1000).toFixed(1)), 100) }
      c.classList.add('ok'); beep(400 + nx * 12, .05); nx++;
      if (nx > T) { done = true; clearInterval(tk); const s = +((Date.now() - t0) / 1000).toFixed(1); H.score(s); msg.textContent = `Готово за ${s} с!`; H.rec(s) } else msg.textContent = 'Ищи: ' + nx;
    };
    g.append(c);
  });
  box.append(msg, g); return () => clearInterval(tk);
}

/* ============ ИГРА 25: Запомни число ============ */
function runDigits(box, H) {
  let n = 3, ok = 0, num = '', t, over = false; const show = [900, 650, 450][H.lvl];
  const q = mk('div', 'verdict'), inp = mk('input', 'num'), b = mk('button', '', 'Ввести'), row = mk('div', 'row'), msg = mk('div', 'msg');
  inp.inputMode = 'numeric'; row.append(inp, b);
  function round() {
    num = ''; for (let i = 0; i < n; i++) num += rnd(10);
    q.textContent = num; row.hidden = true; msg.textContent = `Запомни ${n} цифр`;
    t = setTimeout(() => { q.textContent = '• '.repeat(n).trim(); row.hidden = false; inp.value = ''; inp.focus(); msg.textContent = 'Введи число' }, 700 + n * show);
  }
  const check = () => {
    if (over || row.hidden) return;
    if (inp.value.trim() === num) { ok = n; H.score(ok); beep(660, .06); setTimeout(() => beep(880, .08), 70); n++; round() }
    else { over = true; row.hidden = true; q.textContent = num; msg.textContent = `Не угадал. Твой рекорд в этой попытке: ${ok} цифр`; beep(150, .25, 'sawtooth'); if (ok) H.rec(ok) }
  };
  b.onclick = check; inp.onkeydown = e => { if (e.key === 'Enter') check() };
  box.append(q, row, msg); round(); return () => clearTimeout(t);
}

/* ============ ИГРА 26: Меткий глаз ============ */
function runAim(box, H) {
  const S = [64, 48, 34][H.lvl], T = 15; let hit = 0, t0 = 0, done = false;
  const msg = mk('div', 'msg', `Жми на мишень. Всего их ${T}, время пойдёт с первого попадания`), ar = mk('div', 'arena'), tg = mk('button', 'tgt');
  ar.style.cssText = 'position:relative;width:min(480px,92vw);height:min(320px,48vh);margin:0 auto;border:3px solid var(--ink);border-radius:18px;background:var(--paper);overflow:hidden';
  tg.style.cssText = `position:absolute;width:${S}px;height:${S}px;border-radius:50%;padding:0;border:3px solid var(--ink);background:radial-gradient(var(--sun) 0 22%,var(--coral) 24% 50%,var(--paper) 52% 74%,var(--coral) 76%)`;
  const place = () => { const r = ar.getBoundingClientRect(); tg.style.left = rnd(Math.max(1, r.width - S - 8)) + 'px'; tg.style.top = rnd(Math.max(1, r.height - S - 8)) + 'px' };
  tg.onclick = () => {
    if (done) return; if (!hit) t0 = Date.now(); H.score(++hit); beep(500 + hit * 25, .05);
    if (hit >= T) { done = true; tg.remove(); const s = +((Date.now() - t0) / 1000).toFixed(2); msg.textContent = `Все мишени за ${s} с!`; H.rec(s) } else place();
  };
  ar.append(tg); box.append(ar, msg); setTimeout(place, 0);
}

/* ============ ИГРА 27: Столицы ============ */
const CAPS = [['Кыргызстан', 'Бишкек'], ['Казахстан', 'Астана'], ['Узбекистан', 'Ташкент'], ['Таджикистан', 'Душанбе'], ['Туркменистан', 'Ашхабад'], ['Россия', 'Москва'], ['Франция', 'Париж'], ['Германия', 'Берлин'], ['Италия', 'Рим'], ['Испания', 'Мадрид'], ['Япония', 'Токио'], ['Китай', 'Пекин'], ['Индия', 'Дели'], ['Египет', 'Каир'], ['Турция', 'Анкара'], ['Канада', 'Оттава'], ['Бразилия', 'Бразилиа'], ['Австралия', 'Канберра'], ['Польша', 'Варшава'], ['Норвегия', 'Осло'], ['Греция', 'Афины'], ['Монголия', 'Улан-Батор']];
function runCaps(box, H) {
  const K = [3, 4, 6][H.lvl], Q = [...CAPS].sort(() => Math.random() - .5).slice(0, 10); let i = 0, sc = 0;
  const q = mk('div', 'verdict'), row = mk('div', 'row'), msg = mk('div', 'msg');
  function ask() {
    row.innerHTML = '';
    if (i >= Q.length) { q.textContent = `Верно: ${sc} из ${Q.length}`; msg.textContent = ''; return H.rec(sc) }
    const [c, a] = Q[i], o = new Set([a]); while (o.size < K) o.add(CAPS[rnd(CAPS.length)][1]);
    q.textContent = 'Столица: ' + c; msg.textContent = `Вопрос ${i + 1} из ${Q.length}`;
    [...o].sort(() => Math.random() - .5).forEach(v => {
      const k = mk('button', 'pick', v); k.style.fontSize = '1.1rem';
      k.onclick = () => { if (v === a) { H.score(++sc); beep(660, .05); setTimeout(() => beep(880, .07), 60) } else beep(150, .15, 'sawtooth'); i++; ask() };
      row.append(k);
    });
  }
  box.append(q, row, msg); ask();
}

/* ============ ИГРА 28: Слова из букв ============ */
const WORDS = ['хлопушка', 'конфетти', 'праздник', 'подарок', 'шарики', 'гирлянда', 'торт', 'свеча', 'музыка', 'танцы', 'сюрприз', 'карнавал', 'фейерверк', 'мандарин', 'ёлка', 'гости', 'улыбка', 'веселье'];
function runAna(box, H) {
  let sc = 0, left = [60, 45, 30][H.lvl], w = '', tk;
  const q = mk('div', 'verdict'), inp = mk('input', 'num'), ok = mk('button', '', 'Проверить'), sk = mk('button', '', 'Другое слово'), row = mk('div', 'row'), msg = mk('div', 'msg', `Осталось: ${left} с`);
  const norm = s => s.trim().toLowerCase().replace(/ё/g, 'е');
  const shuf = s => { let a; do a = [...s].sort(() => Math.random() - .5).join(''); while (a === s); return a };
  const next = () => { let n; do n = WORDS[rnd(WORDS.length)]; while (n === w); w = n; q.textContent = shuf(w).toUpperCase(); inp.value = ''; inp.focus() };
  const check = () => { if (left <= 0) return; if (norm(inp.value) === norm(w)) { H.score(++sc); beep(660, .06); setTimeout(() => beep(880, .08), 60); next() } else { beep(150, .12, 'sawtooth'); inp.select() } };
  ok.onclick = check; sk.onclick = () => { if (left > 0) next() }; inp.onkeydown = e => { if (e.key === 'Enter') check() };
  tk = setInterval(() => { left--; msg.textContent = `Осталось: ${left} с`; if (left <= 0) { clearInterval(tk); row.hidden = true; q.textContent = `Время! Слов: ${sc}`; H.rec(sc) } }, 1000);
  row.append(inp, ok, sk); box.append(q, row, msg); next(); return () => clearInterval(tk);
}

/* ============ ИГРА 29: 21 очко ============ */
function runBJ(box, H) {
  const R = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т'], S = ['♠', '♥', '♦', '♣'], lim = [15, 17, 18][H.lvl];
  let ph, dh, wins = 0, over;
  const val = h => { let s = 0, a = 0; h.forEach(c => { if (c.r === 'Т') { a++; s += 11 } else s += 'ВДК'.includes(c.r) ? 10 : +c.r }); while (s > 21 && a > 0) { s -= 10; a-- } return s };
  const draw = () => ({ r: R[rnd(13)], s: S[rnd(4)] });
  const card = c => `<span class="chip" style="font-size:1.3rem${'♥♦'.includes(c.s) ? ';color:var(--coral)' : ''}">${c.r}${c.s}</span>`;
  const dl = mk('div', 'row'), pl = mk('div', 'row'), msg = mk('div', 'msg'), row = mk('div', 'row'), hit = mk('button', '', 'Ещё'), stand = mk('button', '', 'Хватит'), again = mk('button', '', 'Новая раздача');
  const paint = rev => { dl.innerHTML = 'Дилер: ' + dh.map((c, i) => rev || !i ? card(c) : '<span class="chip">?</span>').join('') + (rev ? ` = ${val(dh)}` : ''); pl.innerHTML = 'Ты: ' + ph.map(card).join('') + ` = ${val(ph)}` };
  function end(m, w) {
    over = true; paint(true); msg.textContent = m; hit.hidden = stand.hidden = true; again.hidden = false;
    if (w > 0) { H.score(++wins); H.rec(wins); beep(700, .2) } else if (w < 0) { wins = 0; H.score(0); beep(150, .25, 'sawtooth') }
  }
  function deal() { ph = [draw(), draw()]; dh = [draw(), draw()]; over = false; hit.hidden = stand.hidden = false; again.hidden = true; msg.textContent = 'Набери 21 или ближе к нему, чем дилер. Счёт — серия побед'; paint(); if (val(ph) === 21) end('Блэкджек! Ты выиграл', 1) }
  hit.onclick = () => { if (over) return; ph.push(draw()); beep(500, .05); paint(); const v = val(ph); if (v > 21) end('Перебор — дилер выиграл', -1); else if (v === 21) stand.onclick() };
  stand.onclick = () => { if (over) return; while (val(dh) < lim) dh.push(draw()); const p = val(ph), d = val(dh); if (d > 21 || p > d) end('Ты выиграл!', 1); else if (p === d) end('Ничья', 0); else end('Дилер выиграл', -1) };
  again.onclick = deal; row.append(hit, stand, again); box.append(dl, pl, msg, row); deal();
}

/* ---------- Каталог ---------- */
const GAMES = [
  { id: 'ttt', noLvl: 1, name: 'Крестики-нолики', cat: 'Классика', diff: 'Выбираешь сам', icon: 'grid-3x3-gap-fill', tint: '--sky', unit: ' поб.', desc: 'Против друга или хитрого компьютера на трёх уровнях.', how: 'Выбери режим сверху и ставь знаки по очереди. Выигрывает тот, кто первым соберёт три в ряд.', run: runTTT },
  { id: 'snake', name: 'Змейка', cat: 'Аркада', diff: 'Средне', icon: 'bezier2', tint: '--mint', desc: 'Лови яблоки, расти и не врезайся. С каждым яблоком быстрее.', how: 'Нажми стрелку, WASD, свайп или кнопки под полем — игра начнётся. Пробел — пауза. Ешь яблоки, не врезайся в стены и в себя.', run: runSnake },
  { id: 'mines', name: 'Сапёр', cat: 'Логика', diff: 'Сложно', icon: 'brightness-high-fill', tint: '--coral', unit: ' с', low: 1, desc: 'Открой всё поле, не задев мины. Флажки и таймер на месте.', how: 'Нажми на клетку, чтобы открыть. Цифра — сколько мин рядом. Флажок: правая кнопка мыши или кнопка «Флажок».', run: runMines },
  { id: 'g2048', name: '2048', cat: 'Логика', diff: 'Средне', icon: '123', tint: '--sun', desc: 'Сдвигай плитки и складывай одинаковые числа.', how: 'Двигай плитки стрелками, WASD или свайпом. Одинаковые числа сливаются в одно.', run: run2048 },
  { id: 'memory', name: 'Memory', cat: 'Память', diff: 'Легко', icon: 'suit-heart-fill', tint: '--sky', unit: ' ходов', low: 1, desc: 'Переворачивай карточки и находи пары за минимум ходов.', how: 'Переворачивай по две карточки. Одинаковые остаются открытыми. Найди все 8 пар.', run: runMemory },
  { id: 'react', name: 'Reaction Test', cat: 'Реакция', diff: 'Легко', icon: 'lightning-charge-fill', tint: '--mint', unit: ' мс', low: 1, desc: 'Нажми в ту же секунду, как экран позеленеет.', how: 'Нажми на большую кнопку — она станет красной. Когда позеленеет, жми как можно быстрее.', run: runReact },
  { id: 'rps', name: 'Камень, ножницы, бумага', cat: 'Классика', diff: 'Легко', icon: 'scissors', tint: '--coral', desc: 'Обыграй компьютер и собери серию побед.', how: 'Выбери камень, ножницы или бумагу. Камень бьёт ножницы, ножницы бьют бумагу, бумага бьёт камень.', run: runRPS },
  { id: 'whack', name: 'Лови жука', cat: 'Реакция', diff: 'Средне', icon: 'bug-fill', tint: '--sun', desc: 'Жуки лезут из норок — успей нажать на каждого.', how: 'У тебя 30 секунд. Нажимай на клетку, где появился жук. Очки — сколько поймал.', run: runWhack },
  { id: 'simon', name: 'Саймон', cat: 'Память', diff: 'Средне', icon: 'palette-fill', tint: '--coral', desc: 'Запомни порядок мигающих цветов и повтори его.', how: 'Смотри, как мигают цвета, потом нажми их в том же порядке. С каждым раундом цепочка длиннее.', run: runSimon },
  { id: 'guess', name: 'Угадай число', cat: 'Логика', diff: 'Легко', icon: 'question-circle-fill', tint: '--mint', unit: ' поп.', low: 1, desc: 'Найди загаданное число от 1 до 100 по подсказкам.', how: 'Введи число и нажми «Проверить». Подсказка скажет, больше или меньше. Чем меньше попыток, тем лучше.', run: runGuess },
  { id: 'math', name: 'Быстрый счёт', cat: 'Логика', diff: 'Средне', icon: 'calculator-fill', tint: '--sky', desc: 'Решай примеры на скорость и выбирай верный ответ.', how: 'Реши пример и нажми верный ответ. На всё 30 секунд — решай как можно больше.', run: runMath },
  { id: 'four', name: 'Четыре в ряд', cat: 'Классика', diff: 'Средне', icon: 'record-circle-fill', tint: '--sky', unit: ' поб.', desc: 'Роняй фишки в столбцы и собери четыре в ряд раньше компьютера.', how: 'Нажми на столбец — фишка упадёт вниз. Собери четыре своих фишки по горизонтали, вертикали или диагонали.', run: runFour },
  { id: 'slide', name: 'Пятнашки', cat: 'Логика', diff: 'Средне', icon: 'grid-fill', tint: '--sun', unit: ' ходов', low: 1, desc: 'Сдвигай плитки и расставь числа по порядку за минимум ходов.', how: 'Нажми на плитку рядом с пустым местом или используй стрелки. Правильно стоящие числа подсвечиваются зелёным.', run: runSlide },
  { id: 'hang', name: 'Виселица', cat: 'Слова', diff: 'Средне', icon: 'alphabet-uppercase', tint: '--coral', unit: ' слов', desc: 'Угадай слово по буквам, пока не закончились попытки.', how: 'Нажимай буквы на экране или на клавиатуре. Каждая ошибка дорисовывает виселицу. Чем длиннее серия слов, тем лучше.', run: runHang },
  { id: 'lights', name: 'Лампочки', cat: 'Логика', diff: 'Сложно', icon: 'lightbulb-fill', tint: '--sun', unit: ' ходов', low: 1, desc: 'Нажатие переключает лампочку и её соседей. Погаси весь свет.', how: 'Нажми на лампочку — она и четыре соседки поменяют состояние. Цель: погасить все лампочки за минимум ходов.', run: runLights },
  { id: 'stroop', name: 'Цвет и слово', cat: 'Реакция', diff: 'Сложно', icon: 'palette2', tint: '--mint', desc: 'Слово написано чужим цветом. Нажми на цвет букв, а не на смысл.', how: 'У тебя 30 секунд. Смотри, каким цветом напечатано слово, и жми кнопку этого цвета. Ошибка отнимает очко.', run: runStroop },
  { id: 'brk', name: 'Арканоид', cat: 'Аркада', diff: 'Средне', icon: 'bricks', tint: '--coral', desc: 'Отбивай мяч и разбивай кирпичики: каждый звучит как свой инструмент.', how: 'Двигай платформу мышью, пальцем или стрелками. Клик или пробел запускает мяч. Угол отскока зависит от места удара. Три жизни.', run: runBrk },
  { id: 'tetris', name: 'Тетрис', cat: 'Аркада', diff: 'Сложно', icon: 'columns-gap', tint: '--sky', desc: 'Укладывай падающие фигурки и собирай полные линии.', how: 'Стрелки ←→ двигают, ↑ поворачивает, ↓ ускоряет, пробел сбрасывает. На экране есть и кнопки. Собери линию — она исчезнет.', run: runTetris },
  { id: 'flap', name: 'Птичка', cat: 'Аркада', diff: 'Средне', icon: 'send-fill', tint: '--mint', desc: 'Взмахивай и пролетай между трубами, не задев ни одной.', how: 'Нажимай на поле, пробел или ↑, чтобы взмахнуть. Пролетай в просветы между трубами. Каждая пара труб — очко.', run: runFlap },
  { id: 'flood', name: 'Заливка', cat: 'Логика', diff: 'Средне', icon: 'droplet-fill', tint: '--coral', unit: ' ходов', low: 1, desc: 'Закрась всё поле одним цветом, начиная с левого верхнего угла.', how: 'Нажимай на цветные кружки: угловая область станет этого цвета и захватит соседей. Закрась всё поле, пока не кончились ходы.', run: runFlood },
  { id: 'maze', name: 'Лабиринт', cat: 'Логика', diff: 'Средне', icon: 'flag-fill', tint: '--sun', unit: ' с', low: 1, desc: 'Каждый раз новый лабиринт. Доберись до флажка быстрее.', how: 'Двигайся стрелками, WASD, свайпом или кнопками. Дойди из левого верхнего угла до жёлтой клетки. Время идёт с первого шага.', run: runMaze },
  { id: 'hanoi', name: 'Ханойская башня', cat: 'Логика', diff: 'Средне', icon: 'layers-fill', tint: '--sky', unit: ' ходов', low: 1, desc: 'Перенеси башню из дисков на другой стержень по правилам.', how: 'Нажми на стержень, откуда брать диск, потом на тот, куда класть. Большой диск нельзя класть на маленький. Перенеси всё вправо.', run: runHanoi },
  { id: 'pong', name: 'Понг', cat: 'Аркада', diff: 'Средне', icon: 'controller', tint: '--coral', desc: 'Классический пинг-понг против компьютера.', how: 'Двигай левую платформу мышью, пальцем или ↑↓. Отбивай мяч и забивай за правую сторону. Три пропуска — конец.', run: runPong },
  { id: 'schulte', name: 'Таблица Шульте', cat: 'Память', diff: 'Средне', icon: 'grid-3x3', tint: '--mint', unit: ' с', low: 1, desc: 'Найди числа по порядку на скорость. Тренирует внимание.', how: 'Нажимай числа от 1 по возрастанию. Время идёт с первого нажатия. Чем быстрее, тем лучше.', run: runSchulte },
  { id: 'digits', name: 'Запомни число', cat: 'Память', diff: 'Сложно', icon: 'hash', tint: '--sky', unit: ' цифр', desc: 'Число мелькнёт на экране. Введи его по памяти.', how: 'Запомни число, пока оно видно, потом введи его. С каждым успехом цифр становится больше. Одна ошибка — конец.', run: runDigits },
  { id: 'aim', name: 'Меткий глаз', cat: 'Реакция', diff: 'Средне', icon: 'bullseye', tint: '--coral', unit: ' с', low: 1, desc: 'Попади по 15 мишеням быстрее, чем они успеют надоесть.', how: 'Нажимай на мишень, она тут же перепрыгнет на новое место. Время идёт с первого попадания.', run: runAim },
  { id: 'caps', name: 'Столицы', cat: 'Викторина', diff: 'Легко', icon: 'globe-europe-africa', tint: '--sun', unit: ' из 10', desc: 'Угадай столицу страны из десяти вопросов.', how: 'Прочитай название страны и выбери её столицу. Всего десять вопросов, счёт — число верных ответов.', run: runCaps },
  { id: 'ana', name: 'Слова из букв', cat: 'Слова', diff: 'Средне', icon: 'fonts', tint: '--mint', unit: ' слов', desc: 'Буквы перепутались. Собери праздничное слово.', how: 'Составь слово из перемешанных букв и нажми Enter. Не получается — возьми другое слово. Время ограничено.', run: runAna },
  { id: 'bj', name: '21 очко', cat: 'Классика', diff: 'Средне', icon: 'suit-spade-fill', tint: '--sky', unit: ' поб.', desc: 'Набери 21 или ближе к нему, чем дилер. Считай серию побед.', how: 'Бери карты кнопкой «Ещё» или останавливайся. Туз — 1 или 11, картинки — 10. Перебор — проигрыш.', run: runBJ }
];
let cat = 'Все', query = '';

function render(anim = true) {
  const grid = $('#grid'); grid.innerHTML = '';
  const list = GAMES.filter(g => (cat === 'Все' || g.cat === cat) && (g.name + ' ' + g.desc + ' ' + g.cat).toLowerCase().includes(query));
  if (!list.length) grid.append(mk('p', 'msg', 'Ничего не нашлось. Измени запрос или выбери «Все».'));
  list.forEach((g, n) => {
    const c = mk('article', 'card'), pic = mk('div', 'pic', ic(g.icon)); c.style.setProperty('--i', n); if (!anim) c.style.animation = 'none';
    pic.style.setProperty('--t', `var(${g.tint})`);
    if (PHOTOS[g.id]) { const im = new Image(); im.alt = g.name; im.loading = 'lazy'; im.src = PHOTOS[g.id]; im.onerror = () => im.remove(); pic.append(im) }
    const body = mk('div', 'in', `<h3>${g.name}</h3><p>${g.desc}</p><div class="tags"><i>${g.cat}</i><i>${g.diff}</i><i>Рекорд: ${fmt(g, best(g))}</i></div>`);
    const go = mk('button', '', 'Играть'); go.onclick = () => openGame(g);
    body.append(go); c.append(pic, body); grid.append(c);
  });
}
const nav = $('#cats');
['Все', ...new Set(GAMES.map(g => g.cat))].forEach(n => {
  const k = mk('button', n === 'Все' ? 'on' : '', n);
  k.onclick = () => { cat = n; [...nav.children].forEach(x => x.classList.toggle('on', x === k)); render() };
  nav.append(k);
});
$('#q').oninput = e => { query = e.target.value.trim().toLowerCase(); render(false) };
syncSnd(); render();

/* ---------- Аккаунты: хранятся в этом браузере ---------- */
const AK = 'hl-accounts', SK = 'hl-session';
const accs = () => { try { return JSON.parse(localStorage.getItem(AK)) || {} } catch (e) { return {} } };
const saveAccs = a => { try { localStorage.setItem(AK, JSON.stringify(a)); return true } catch (e) { return false } };
const sess = () => { try { return localStorage.getItem(SK) } catch (e) { return null } };
const me = () => accs()[sess()];
const hex = () => [...crypto.getRandomValues(new Uint8Array(12))].map(v => v.toString(16).padStart(2, '0')).join('');
const plural = (n, f) => f[n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 > 1 && n % 10 < 5 && (n % 100 < 10 || n % 100 > 19) ? 1 : 2];
async function hashPw(pw, salt) { /* пароль хранится только в виде хеша */
  try {
    const te = new TextEncoder(), k = await crypto.subtle.importKey('raw', te.encode(pw), 'PBKDF2', false, ['deriveBits']);
    const b = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: te.encode(salt), iterations: 120000, hash: 'SHA-256' }, k, 256);
    return [...new Uint8Array(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  } catch (e) { let h = 5381; for (const c of salt + pw) h = (h * 33 ^ c.charCodeAt(0)) >>> 0; return 'x' + h.toString(16) } /* запасной путь без crypto.subtle */
}
/* Лёгкие пароли-фразы: «синяя пицца тихо ест 18 пушистых кактусов на луне» */
const rI = n => crypto.getRandomValues(new Uint32Array(1))[0] % n;
const PW = {
  adj: [['синий', 'синяя', 'синее'], ['зелёный', 'зелёная', 'зелёное'], ['весёлый', 'весёлая', 'весёлое'], ['смешной', 'смешная', 'смешное'], ['громкий', 'громкая', 'громкое'], ['сонный', 'сонная', 'сонное'], ['хитрый', 'хитрая', 'хитрое'], ['пушистый', 'пушистая', 'пушистое'], ['ленивый', 'ленивая', 'ленивое'], ['добрый', 'добрая', 'доброе'], ['румяный', 'румяная', 'румяное'], ['важный', 'важная', 'важное']],
  noun: [['кот', 0], ['робот', 0], ['пингвин', 0], ['дракон', 0], ['волк', 0], ['слон', 0], ['пицца', 1], ['собака', 1], ['лягушка', 1], ['сова', 1], ['обезьяна', 1], ['корова', 1], ['облако', 2], ['яблоко', 2], ['пианино', 2], ['колесо', 2], ['розетка', 1], ['лампа', 1]],
  adv: ['тихо', 'громко', 'молча', 'быстро', 'тайно', 'дружно', 'смело', 'вежливо'],
  verb: ['ест', 'любит', 'ищет', 'рисует', 'несёт', 'строит', 'моет', 'ловит', 'прячет', 'считает'],
  gadj: ['пушистых', 'кислых', 'горячих', 'зелёных', 'золотых', 'смешных', 'сонных', 'ледяных', 'круглых', 'тайных', 'добрых', 'хрустящих'],
  gnoun: ['кактусов', 'носков', 'арбузов', 'пончиков', 'чайников', 'ёжиков', 'огурцов', 'зонтиков', 'бананов', 'роботов', 'пирогов', 'сундуков', 'ананасов'],
  place: ['на луне', 'в подвале', 'в гараже', 'на крыше', 'в метро', 'в лесу', 'на кухне', 'в космосе', 'в бассейне', 'на даче', 'в поезде', 'на льдине']
};
const NUMS = [...Array(95).keys()].map(i => i + 5).filter(n => n % 10 > 4 || n % 10 === 0 || (n % 100 > 10 && n % 100 < 15)); /* числа, после которых слово стоит в родительном падеже */
function genPass(long) {
  const pick = a => a[rI(a.length)], n = pick(PW.noun), adj = PW.adj[rI(PW.adj.length)][n[1]];
  let s = `${adj} ${n[0]} ${pick(PW.adv)} ${pick(PW.verb)} ${pick(NUMS)} ${pick(PW.gadj)} ${pick(PW.gnoun)} ${pick(PW.place)}`;
  let bits = Math.log2(PW.adj.length * PW.noun.length * PW.adv.length * PW.verb.length * NUMS.length * PW.gadj.length * PW.gnoun.length * PW.place.length);
  if (long) { s += ` и ${pick(NUMS)} ${pick(PW.gadj)} ${pick(PW.gnoun)}`; bits += Math.log2(NUMS.length * PW.gadj.length * PW.gnoun.length) }
  return [s, Math.round(bits)];
}
let lastGen = null; /* последняя фраза из генератора: для неё показываем честные биты */
const COMMON = ['123456', '12345678', '123456789', '1234567890', 'qwerty', 'qwerty123', 'qwertyuiop', 'password', 'password1', 'пароль', 'пароль123', 'йцукен', '111111', '000000', '123123', 'abc123', 'iloveyou', 'admin', 'letmein', 'qazwsx', '1q2w3e', 'привет', 'любовь'];
function pwScore(p) { /* грубая оценка стойкости: [биты, причина] */
  if (!p) return [0, ''];
  if (lastGen && lastGen[0] === p) return [lastGen[1], 'фраза из генератора'];
  const low = p.toLowerCase(), base = low.replace(/[\d!?.]+$/, '');
  if (COMMON.includes(low) || COMMON.includes(base)) return [5, 'один из самых частых паролей'];
  if (/^(.)\1*$/.test(p)) return [5, 'повторяется один символ'];
  if (/^[a-zа-яё]+(19|20)\d\d[!?.]*$/i.test(p)) return [18, 'имя или слово и год подбирают в первую очередь'];
  if (/(пароль|password|qwerty|admin|йцукен)/.test(low)) return [8, 'содержит слишком известное слово'];
  if (p.length < 12 && /(0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf|zxcv|йцук|фыва)/.test(low)) return [10, 'простая последовательность'];
  const w = p.trim().split(/\s+/).filter(x => x.length > 2);
  if (w.length >= 3 && new Set(w.map(x => x.toLowerCase())).size === w.length) return [w.length * 9, 'фраза из ' + w.length + ' слов'];
  const pool = (/[a-z]/.test(p) ? 26 : 0) + (/[A-Z]/.test(p) ? 26 : 0) + (/[а-яё]/.test(p) ? 33 : 0) + (/[А-ЯЁ]/.test(p) ? 33 : 0) + (/\d/.test(p) ? 10 : 0) + (/[^\wа-яёА-ЯЁ]|_/.test(p) ? 32 : 0), u = new Set(p).size;
  let b = (u + (p.length - u) * .3) * Math.log2(Math.max(pool, 2)) * .8;
  if (/^[a-zа-яё]+\d+$/i.test(p)) b *= .6;
  if (/^[a-zа-яё]+$/.test(p)) b *= .5; /* одно слово из строчных букв подобрать проще */
  return [Math.round(b), p.length < 8 ? 'слишком короткий' : ''];
}
const pwLevel = b => b < 28 ? [0, 'Слишком лёгкий пароль', 'его легко подобрать'] : b < 44 ? [1, 'Нормальный', ''] : b < 64 ? [2, 'Хороший', ''] : [3, 'Отличный', ''];
function fileToAvatar(file) {
  return new Promise((ok, no) => {
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => { const c = mk('canvas'), s = Math.min(im.width, im.height); c.width = c.height = 128; c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 128, 128); ok(c.toDataURL('image/jpeg', .85)) }; im.onerror = no; im.src = fr.result };
    fr.onerror = no; fr.readAsDataURL(file);
  });
}
function avEl(a, cls = '') { let e; if (a.avatar) { e = new Image(); e.src = a.avatar; e.alt = '' } else { e = mk('span'); e.textContent = a.name[0].toUpperCase() } e.className = 'av ' + cls; return e }
const savePwCred = (id, pw) => { try { if (window.PasswordCredential) navigator.credentials.store(new PasswordCredential({ id, name: id, password: pw })).catch(() => {}) } catch (e) {} }; /* предложить менеджеру паролей */
function updHdr() {
  const b = $('#accBtn'), a = me(), n = Object.keys(accs()).length; b.innerHTML = '';
  if (a) { const s = mk('span'); s.textContent = a.name; b.append(avEl(a), s) } else b.innerHTML = ic('person-circle') + '<span>Войти</span>';
  $('#people').innerHTML = n ? `С нами уже <b>${n}</b> ${plural(n, ['игрок', 'игрока', 'игроков'])}` : 'Создай аккаунт и стань первым игроком';
}
function reapply() { /* смена аккаунта: подхватываем его настройки и рекорды */
  const s = sess(); PRE = s ? 'hl:u:' + s + ':' : 'hl:';
  setTheme(store.get('theme', theme)); setAccent(store.get('accent', accent)); sound = store.get('sound', sound); syncSnd(); render(); updHdr();
}
const PWB = `<label>Пароль</label><div class="pw"><input name="password" type="password" required minlength="6" autocomplete="AC"><button type="button" class="eye" aria-label="Показать пароль">${ic('eye-fill')}</button></div>
<div class="gen"><button type="button" class="genb">${ic('magic')} Придумать лёгкий пароль</button><label><input type="checkbox" class="lng"> Надёжнее (длиннее)</label></div><p class="hint gh"></p><div class="meter"><i></i></div><p class="hint mt"></p>`;
function bindPw(f) {
  const inp = f.elements.password, gh = f.querySelector('.gh'), g = f.querySelector('.genb');
  f.querySelector('.eye').onclick = () => { inp.type = inp.type === 'password' ? 'text' : 'password' };
  const mt = f.querySelector('.mt'), bar = f.querySelector('.meter i');
  const upd = () => { /* полоска и подпись: насколько пароль надёжен */
    if (!mt) return; const [b, why] = pwScore(inp.value), L = pwLevel(b);
    bar.style.width = inp.value ? Math.max(6, Math.min(100, b / 80 * 100)) + '%' : '0'; bar.dataset.l = L[0];
    mt.textContent = inp.value ? L[1] + (L[2] ? ': ' + L[2] : '') + (why ? ' (' + why + ')' : '') : '';
  };
  inp.addEventListener('input', upd);
  if (!g) return;
  g.onclick = () => {
    const [p, bits] = genPass(f.querySelector('.lng').checked); inp.value = p; inp.type = 'text'; lastGen = [p, bits]; upd();
    gh.innerHTML = `Запомни: <b></b><br>≈ ${bits} бит защиты. Браузер предложит сохранить пароль в менеджере. `; gh.querySelector('b').textContent = p;
    const c = mk('button', '', ic('clipboard') + ' Скопировать'); c.type = 'button';
    c.onclick = () => navigator.clipboard && navigator.clipboard.writeText(p).then(() => { c.innerHTML = ic('check2') + ' Скопировано' }); gh.append(c); beep(660, .08, 'triangle');
  };
}
function renderAcc() {
  const body = $('#accBody'), a = me();
  if (a) {
    body.innerHTML = `<div class="prof"><label class="avbig" title="Сменить фото"><span id="avSlot"></span><input type="file" accept="image/*" id="avIn" hidden></label><h3></h3><p class="hint">Аккаунт и рекорды хранятся в этом браузере.</p>
<div class="row"><button id="avBtn">${ic('image')} Сменить фото</button><button id="avDel">${ic('trash')} Убрать фото</button><button id="pwBtn">${ic('key-fill')} Новый пароль</button><button id="outBtn">${ic('box-arrow-right')} Выйти</button></div>
<form id="fPw" hidden><input name="username" class="vh" tabindex="-1" autocomplete="username">${PWB.replace('AC', 'new-password')}<p class="err"></p><button class="go" type="submit">Сохранить пароль</button></form></div>`;
    $('#avSlot').append(avEl(a, 'big')); body.querySelector('h3').textContent = a.name;
    $('#avBtn').onclick = () => $('#avIn').click();
    $('#avIn').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const all = accs(); all[sess()].avatar = await fileToAvatar(f); saveAccs(all); updHdr(); renderAcc() } catch (er) {} };
    $('#avDel').onclick = () => { const all = accs(); delete all[sess()].avatar; saveAccs(all); updHdr(); renderAcc() };
    $('#outBtn').onclick = () => { try { localStorage.removeItem(SK) } catch (e) {} reapply(); renderAcc(); $('#acc').hidden = true };
    const f = $('#fPw'); bindPw(f); f.elements.username.value = a.name; $('#pwBtn').onclick = () => { f.hidden = !f.hidden };
    f.onsubmit = async ev => {
      ev.preventDefault(); const pw = f.elements.password.value;
      if (pw.length < 6) { f.querySelector('.err').textContent = 'Пароль — минимум 6 символов'; return }
      if (pwScore(pw)[0] < 28) { f.querySelector('.err').textContent = 'Слишком лёгкий пароль. Нажми «Придумать лёгкий пароль»'; return }
      const all = accs(), u = all[sess()]; u.salt = hex(); u.hash = await hashPw(pw, u.salt); saveAccs(all); savePwCred(a.name, pw); renderAcc(); body.querySelector('.hint').textContent = 'Пароль обновлён.';
    };
    return;
  }
  body.innerHTML = `<div class="tabs"><button id="tL" class="on">Вход</button><button id="tR">Регистрация</button></div>
<form id="fL"><label>Имя</label><input name="username" autocomplete="username" required maxlength="20">${PWB.replace('AC', 'current-password').replace(/<div class="gen">[\s\S]*?<p class="hint mt"><\/p>/, '')}<p class="err"></p><button class="go" type="submit">Войти</button></form>
<form id="fR" hidden><label>Имя</label><input name="username" autocomplete="username" required minlength="2" maxlength="20">${PWB.replace('AC', 'new-password')}<label>Фото (необязательно)</label><input type="file" name="av" accept="image/*"><p class="err"></p><button class="go" type="submit">Создать аккаунт</button></form>`;
  const fL = $('#fL'), fR = $('#fR'); bindPw(fL); bindPw(fR);
  const tab = r => { fL.hidden = r; fR.hidden = !r; $('#tL').classList.toggle('on', !r); $('#tR').classList.toggle('on', r) };
  $('#tL').onclick = () => tab(false); $('#tR').onclick = () => tab(true);
  fL.onsubmit = async ev => {
    ev.preventDefault(); const nm = fL.elements.username.value.trim(), key = 'u_' + nm.toLowerCase(), u = accs()[key], pw = fL.elements.password.value;
    if (!u || u.hash !== await hashPw(pw, u.salt)) { fL.querySelector('.err').textContent = 'Неверное имя или пароль'; beep(150, .3, 'sawtooth'); return }
    localStorage.setItem(SK, key); savePwCred(u.name, pw); reapply(); renderAcc();
  };
  fR.onsubmit = async ev => {
    ev.preventDefault(); const nm = fR.elements.username.value.trim(), key = 'u_' + nm.toLowerCase(), pw = fR.elements.password.value, err = fR.querySelector('.err'), all = accs();
    if (nm.length < 2) { err.textContent = 'Имя — минимум 2 символа'; return }
    if (all[key]) { err.textContent = 'Такое имя уже занято'; return }
    if (pw.length < 6) { err.textContent = 'Пароль — минимум 6 символов'; return }
    if (pwScore(pw)[0] < 28) { err.textContent = 'Слишком лёгкий пароль. Нажми «Придумать лёгкий пароль» — он будет и надёжным, и запоминающимся'; beep(150, .3, 'sawtooth'); return }
    const salt = hex(), u = { name: nm, salt, hash: await hashPw(pw, salt), created: Date.now() }, file = fR.elements.av.files[0];
    if (file) { try { u.avatar = await fileToAvatar(file) } catch (er) {} }
    all[key] = u; if (!saveAccs(all)) { err.textContent = 'Не удалось сохранить: память браузера недоступна'; return }
    localStorage.setItem(SK, key); savePwCred(nm, pw); reapply(); renderAcc(); jingle();
  };
}
/* ---------- Окна и шапка ---------- */
const MODALS = [$('#set'), $('#acc')], closeM = () => MODALS.forEach(m => m.hidden = true);
MODALS.forEach(m => { m.onclick = e => { if (e.target === m || e.target.closest('[data-close]')) closeM() } });
addEventListener('keydown', e => { if (e.key === 'Escape') closeM() });
const openAcc = () => { closeM(); renderAcc(); $('#acc').hidden = false };
$('#setBtn').onclick = () => { closeM(); $('#set').hidden = false };
$('#setAcc').onclick = openAcc; $('#accBtn').onclick = openAcc;
updHdr();

/* ---------- Заново: кнопка внизу и клавиша R ---------- */
$('#re2').onclick = startGame;
addEventListener('keydown', e => {
  if ($('#stage').hidden || e.ctrlKey || e.metaKey || e.altKey || MODALS.some(m => !m.hidden) || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if (e.key === 'r' || e.key === 'R' || ((e.key === 'к' || e.key === 'К') && cur.id !== 'hang')) { e.preventDefault(); startGame() }
});
/* когда игра закончилась, кнопка внизу становится крупнее и выезжает снизу */
new MutationObserver(() => $('#re2').classList.toggle('end', /Заново|Конец|Время!|Победа|Ничья|Победили|выиграл|найден|перенесена|Все пары/i.test($('#box').textContent))).observe($('#box'), { childList: true, subtree: true, characterData: true });


/* Хлопушка иногда хлопает сама, пока открыт каталог */
if (!matchMedia('(prefers-reduced-motion:reduce)').matches) setInterval(() => {
  if (!$('#stage').hidden) return;
  const p = $('#pop'), r = p.getBoundingClientRect();
  p.classList.add('puff'); setTimeout(() => p.classList.remove('puff'), 700);
  burst({ clientX: r.left + r.width * .6, clientY: r.top + r.height * .35, q: 1 });
}, 15000);
