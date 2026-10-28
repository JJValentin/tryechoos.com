// Product moments (preview 8, Amendment 8). Each .mo[data-moment] loops a short story through
// data-s states ("1", "2", "3", "4", "end"); assets/moments.css shows the elements whose data-on
// lists the current state. The markup ships in its final state ("end"), so without JS, with
// prefers-reduced-motion, or offscreen, every moment is static and complete. Loops start when a
// moment scrolls into view and stop when it leaves.
(function () {
  'use strict';
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var STOP = {};
  var CURSOR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2.5v17.2l4.6-4.4 3 6.6 3-1.4-3-6.4h6.4z" fill="#fff" stroke="#09090b" stroke-width="1.4" stroke-linejoin="round"/></svg>';

  function Moment(root) {
    this.root = root;
    this.name = root.getAttribute('data-moment');
    this.run = 0;
    this.visible = false;
    this.cursor = null;
  }
  Moment.prototype.q = function (sel) { return this.root.querySelector(sel); };
  Moment.prototype.set = function (s) { this.root.setAttribute('data-s', s); };
  Moment.prototype.reset = function () {
    // Final, complete state: typed text whole, toggles on, no cursor.
    var r = this.root;
    r.classList.remove('is-out', 'is-typing', 'is-cursor');
    [].forEach.call(r.querySelectorAll('[data-full]'), function (el) { el.textContent = el.getAttribute('data-full'); });
    [].forEach.call(r.querySelectorAll('[data-final-on]'), function (el) { el.classList.add(el.getAttribute('data-final-on')); });
    [].forEach.call(r.querySelectorAll('.is-press,.is-focus'), function (el) { el.classList.remove('is-press', 'is-focus'); });
    this.set('end');
  };
  Moment.prototype.ensureCursor = function () {
    if (this.cursor) return this.cursor;
    var c = document.createElement('div');
    c.className = 'mo-cursor';
    c.innerHTML = CURSOR;
    this.root.appendChild(c);
    this.cursor = c;
    return c;
  };
  Moment.prototype.cursorAt = function (el, instant) {
    var c = this.ensureCursor();
    var r = this.root.getBoundingClientRect(), b = el.getBoundingClientRect();
    var k = this.root.offsetWidth ? r.width / this.root.offsetWidth : 1; // CSS zoom on the hero at 768 to 979
    var x = (b.left + b.width * 0.55 - r.left) / k, y = (b.top + b.height * 0.55 - r.top) / k;
    if (instant) { c.style.transition = 'none'; c.style.transform = 'translate(' + x + 'px,' + y + 'px)'; void c.offsetWidth; c.style.transition = ''; }
    else c.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  };

  function play(m) {
    var id = ++m.run;
    var alive = function () { return m.run === id && m.visible && !reduce.matches; };
    var wait = function (ms) { return new Promise(function (res, rej) { setTimeout(function () { alive() ? res() : rej(STOP); }, ms); }); };
    var type = function (el, text, ms) {
      el.textContent = '';
      m.root.classList.add('is-typing');
      var i = 0, per = ms / text.length;
      var tick = function () { i += 1; el.textContent = text.slice(0, i); return i < text.length ? wait(per).then(tick) : wait(1); };
      return wait(per).then(tick).then(function () { m.root.classList.remove('is-typing'); });
    };
    var click = function (el) {
      m.cursor.classList.add('is-press'); el.classList.add('is-press');
      return wait(170).then(function () { m.cursor.classList.remove('is-press'); el.classList.remove('is-press'); });
    };
    var moveTo = function (el) { m.root.classList.add('is-cursor'); m.cursorAt(el); return wait(800); };
    var out = function () { m.root.classList.remove('is-cursor'); m.root.classList.add('is-out'); return wait(450); };
    var begin = function () {
      m.root.classList.remove('is-out', 'is-cursor');
      [].forEach.call(m.root.querySelectorAll('[data-final-on]'), function (el) { el.classList.remove(el.getAttribute('data-final-on')); });
    };
    var S = SCRIPTS[m.name];
    if (!S) return;
    var loop = function () { begin(); return S(m, { wait: wait, type: type, click: click, moveTo: moveTo, out: out }).then(loop); };
    loop().catch(function (e) { if (e !== STOP) throw e; if (m.run === id) m.reset(); });
  }

  var SCRIPTS = {
    // Hero: a pasted video loads, its transcript appears, then a post draft, then a 9:16 clip.
    hero: function (m, t) {
      m.set('1');
      return t.wait(1700).then(function () { m.set('2'); return t.wait(1300); })
        .then(function () { m.set('3'); return t.wait(1300); })
        .then(function () { m.set('end'); return t.wait(3800); })
        .then(t.out);
    },
    // Block 1: a link is pasted, the Source downloads and transcribes, three timed lines appear.
    m2: function (m, t) {
      var link = m.q('[data-full]');
      m.set('1'); link.textContent = '';
      return t.wait(350).then(function () { return t.type(link, link.getAttribute('data-full'), 1300); })
        .then(function () { return t.wait(450); })
        .then(function () { m.set('2'); return t.wait(1250); })
        .then(function () { m.set('3'); return t.wait(1400); })
        .then(function () { m.set('end'); return t.wait(3600); })
        .then(t.out);
    },
    // Block 2: ask for a change, click Rewrite, the draft comes back shorter with Copy text and Approve.
    m3: function (m, t) {
      var field = m.q('.d-field'), text = m.q('[data-full]'), btn = m.q('[data-click="rewrite"]');
      m.set('1'); text.textContent = '';
      m.cursorAt(m.q('.d-label'), true);
      return t.wait(500).then(function () { field.classList.add('is-focus'); return t.type(text, text.getAttribute('data-full'), 1500); })
        .then(function () { return t.moveTo(btn); })
        .then(function () { return t.click(btn); })
        .then(function () { field.classList.remove('is-focus'); m.set('2'); return t.wait(1200); })
        .then(function () { m.root.classList.remove('is-cursor'); m.set('end'); return t.wait(4000); })
        .then(t.out);
    },
    // Block 3: tick Vertical 9:16, Cut clip, then the cut 9:16 clip appears and Save to folder saves it.
    m4: function (m, t) {
      var box = m.q('.box'), cut = m.q('[data-click="cut"]'), save = m.q('[data-click="save"]'), saved = m.q('.c-saved');
      m.set('1');
      m.cursorAt(m.q('.c-title'), true);
      return t.wait(500).then(function () { return t.moveTo(box); })
        .then(function () { return t.click(box); })
        .then(function () { box.classList.add('on'); return t.wait(450); })
        .then(function () { return t.moveTo(cut); })
        .then(function () { return t.click(cut); })
        .then(function () { m.set('2'); return t.wait(1600); })
        .then(function () { m.set('end'); return t.wait(700); })
        .then(function () { return t.moveTo(save); })
        .then(function () { return t.click(save); })
        .then(function () { saved.classList.add('on'); m.root.classList.remove('is-cursor'); return t.wait(3200); })
        .then(t.out);
    },
    // Step 1: connect your AI.
    sw1: function (m, t) {
      var btn = m.q('[data-click]');
      m.set('1'); m.cursorAt(m.q('.s-name'), true);
      return t.wait(600).then(function () { return t.moveTo(btn); })
        .then(function () { return t.click(btn); })
        .then(function () { m.root.classList.remove('is-cursor'); m.set('end'); return t.wait(3200); })
        .then(t.out);
    },
    // Step 2: paste a link, the Source loads, then it is ready.
    sw2: function (m, t) {
      var link = m.q('[data-full]');
      m.set('1'); link.textContent = '';
      return t.wait(300).then(function () { return t.type(link, link.getAttribute('data-full'), 1200); })
        .then(function () { m.set('2'); return t.wait(1400); })
        .then(function () { m.set('end'); return t.wait(3200); })
        .then(t.out);
    },
    // Step 3: approve the draft.
    sw3: function (m, t) {
      var btn = m.q('[data-click]');
      m.set('1'); m.cursorAt(m.q('.d-plat'), true);
      return t.wait(700).then(function () { return t.moveTo(btn); })
        .then(function () { return t.click(btn); })
        .then(function () { m.root.classList.remove('is-cursor'); m.set('end'); return t.wait(3400); })
        .then(t.out);
    }
  };

  var moments = [].map.call(document.querySelectorAll('.mo[data-moment]'), function (el) { return new Moment(el); });
  if (!moments.length || !('IntersectionObserver' in window)) return;
  var byEl = new Map(moments.map(function (m) { return [m.root, m]; }));
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var m = byEl.get(e.target);
      var vis = e.isIntersecting && e.intersectionRatio >= 0.35;
      if (vis === m.visible) return;
      m.visible = vis;
      if (vis && !reduce.matches) play(m);
      else { m.run += 1; m.reset(); }
    });
  }, { threshold: [0, 0.35, 0.6] });
  moments.forEach(function (m) { io.observe(m.root); });
  var onReduce = function () {
    moments.forEach(function (m) { m.run += 1; m.reset(); if (!reduce.matches && m.visible) play(m); });
  };
  if (reduce.addEventListener) reduce.addEventListener('change', onReduce);
})();
