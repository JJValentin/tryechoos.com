// PREVIEW ONLY. Not referenced by index.html; preview/build-preview.sh injects it into the
// preview copy. Delete the preview/ folder before or after publishing; nothing depends on it.
//
// Lets Joshua flip the two open picks from copy-deck-r5 section 0 (hero headline A/B/C,
// CTA button 1/2/3), jump straight to each result variant, and simulate a booking
// (there is no calendar link yet).
(function () {
  const HERO = {
    A: ['Turn one video into', 'clips and posts in your voice.'],
    B: ['Your best posts are', 'already on camera.'],
    C: ['Stop starting every post', 'from a blank page.'],
  };
  const CTA = {
    1: "See what's stalling your content",
    2: 'Request early access',
    3: 'Take the 3-question quiz',
  };
  // Final CTA: if H1 B is picked, the deck swaps the final H2/sub so the page doesn't repeat itself.
  // h2 is HTML: the emphasized phrase keeps the page's purple gradient span.
  const FINAL_DEFAULT = {
    h2: 'Your next posts are<br class="hidden sm:block" /> <span class="text-purple-gradient">already recorded.</span>',
    sub: "Take three questions, see what's stalling your content, then pick a time with Joshua.",
  };
  const FINAL_FOR_B = {
    h2: 'Bring one video<br class="hidden sm:block" /> <span class="text-purple-gradient">to the call.</span>',
    sub: 'Three questions first, then your result, then a time with Joshua.',
  };
  const SAMPLE = {
    A: { q1: 'get more out of the videos you already make', q2: "you're sitting on videos you never used" },
    B: { q1: 'post things that sound like you', q2: "you're posting, but it doesn't sound like you" },
    C: { q1: 'have the right people reach out to work with you', q2: "you're posting, but it never turns into conversations" },
    D: { q1: 'show up every week without losing client hours', q2: "you're spending hours turning one video into a post or two" },
  };
  const META_BASE = "EchoOS is a desktop app that turns your videos into transcripts, clips and post drafts in your voice, with your own AI. ";
  const META_LAST = { 1: "Take 3 questions to see what's stalling your content.", 2: 'Request early access.', 3: 'Take the 3-question quiz.' };

  const store = {
    get: (k, d) => { try { return localStorage.getItem('echoos_preview_' + k) || d; } catch (e) { return d; } },
    set: (k, v) => { try { localStorage.setItem('echoos_preview_' + k, v); } catch (e) { /* ignore */ } },
  };

  function applyHero(pick) {
    const [l1, l2] = HERO[pick];
    document.querySelectorAll('[data-copy="hero-line1"]').forEach(el => { el.textContent = l1; });
    document.querySelectorAll('[data-copy="hero-line2"]').forEach(el => { el.textContent = l2; });
    const final = pick === 'B' ? FINAL_FOR_B : FINAL_DEFAULT;
    const h2 = document.querySelector('[data-copy="final-h2"]');
    const sub = document.querySelector('[data-copy="final-sub"]');
    if (h2) h2.innerHTML = final.h2;
    if (sub) sub.textContent = final.sub;
    const og = document.querySelector('meta[property="og:title"]');
    if (og) og.setAttribute('content', pick === 'A' ? 'Turn one video into clips and posts in your voice' : l1 + ' ' + l2.replace(/\.$/, ''));
    store.set('hero', pick);
  }

  function applyCta(pick) {
    document.querySelectorAll('[data-cta-label]').forEach(el => { el.textContent = CTA[pick]; });
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', META_BASE + META_LAST[pick]);
    store.set('cta', pick);
  }

  function button(label, onClick, group, value) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.dataset.group = group || '';
    b.dataset.value = value || '';
    b.style.cssText = 'padding:4px 9px;border-radius:7px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#F4F4F5;font:600 12px Manrope,sans-serif;cursor:pointer';
    b.addEventListener('click', onClick);
    return b;
  }

  function mark(panel, group, value) {
    panel.querySelectorAll('button[data-group="' + group + '"]').forEach(b => {
      const on = b.dataset.value === String(value);
      b.style.background = on ? '#8655F6' : 'rgba(255,255,255,.05)';
      b.style.borderColor = on ? '#8655F6' : 'rgba(255,255,255,.15)';
    });
  }

  function row(title, children) {
    const r = document.createElement('div');
    r.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px';
    const t = document.createElement('span');
    t.textContent = title;
    t.style.cssText = 'min-width:52px;color:#A1A1AA;font:600 11px Manrope,sans-serif';
    r.appendChild(t);
    children.forEach(c => r.appendChild(c));
    return r;
  }

  function build() {
    const panel = document.createElement('div');
    panel.id = 'preview-switcher';
    panel.setAttribute('data-preview-only', '');
    panel.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:9999;background:rgba(9,9,11,.94);border:1px solid rgba(134,85,246,.5);border-radius:12px;padding:10px 12px;box-shadow:0 10px 30px rgba(0,0,0,.6);max-width:calc(100vw - 24px)';
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px';
    const label = document.createElement('span');
    label.textContent = 'PREVIEW ONLY: picks';
    label.style.cssText = 'color:#C084FC;font:700 10px Manrope,sans-serif;letter-spacing:.12em';
    const toggle = button('hide', () => {
      const hidden = body.style.display === 'none';
      body.style.display = hidden ? '' : 'none';
      toggle.textContent = hidden ? 'hide' : 'show';
    });
    head.appendChild(label);
    head.appendChild(toggle);
    const body = document.createElement('div');

    const heroBtns = ['A', 'B', 'C'].map(k => button(k, () => { applyHero(k); mark(panel, 'hero', k); }, 'hero', k));
    const ctaBtns = ['1', '2', '3'].map(k => button(k, () => { applyCta(k); mark(panel, 'cta', k); }, 'cta', k));
    const resBtns = ['A', 'B', 'C', 'D'].map(k => button(k, () => window.EchoQuiz && window.EchoQuiz.showResult(k, SAMPLE[k])));
    body.appendChild(row('Hero', heroBtns));
    body.appendChild(row('CTA', ctaBtns));
    body.appendChild(row('Result', resBtns));
    // Side by side: preview/build-compare.sh serves preview 1 at ./p1/ (absent there, so no link inside p1).
    if (!/\/p1\/?/.test(location.pathname)) {
      const cmp = document.createElement('a');
      cmp.href = 'p1/';
      cmp.textContent = 'Open preview 1';
      cmp.style.cssText = 'color:#C084FC;font:600 12px Manrope,sans-serif;text-decoration:underline';
      body.appendChild(row('Compare', [cmp]));
    }
    panel.appendChild(head);
    panel.appendChild(body);
    document.body.appendChild(panel);
    // Phones: start collapsed so the panel never covers quiz buttons.
    if (window.innerWidth < 640) { body.style.display = 'none'; toggle.textContent = 'show'; }

    // Simulated booking: there is no calendar link yet.
    const slot = document.getElementById('calendar-slot');
    if (slot) {
      const sim = button('Simulate a booking (preview only)', () => window.EchoQuiz && window.EchoQuiz.showBooked({ when: '[day, date, time and time zone from the calendar]', inviteSent: true }));
      sim.setAttribute('data-preview-only', '');
      sim.style.marginTop = '8px';
      slot.appendChild(sim);
    }

    const hero = store.get('hero', 'A');
    const cta = store.get('cta', '1');
    applyHero(HERO[hero] ? hero : 'A');
    applyCta(CTA[cta] ? cta : '1');
    mark(panel, 'hero', HERO[hero] ? hero : 'A');
    mark(panel, 'cta', CTA[cta] ? cta : '1');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
