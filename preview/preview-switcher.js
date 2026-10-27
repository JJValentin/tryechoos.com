// PREVIEW ONLY. Not referenced by index.html; preview/build-preview.sh injects it into the
// preview copy. Delete the preview/ folder before or after publishing; nothing depends on it.
//
// Lets Joshua flip the two open picks from copy-deck-r7 section 0 (hero headline A/B/C,
// CTA button 1/2; FAQ 4's question follows the CTA), jump straight to each result variant,
// and simulate a failed save to see the save-failed close (the preview's stand-in for
// submitLead() resolves saved; preview/build-preview.sh wires it to this toggle).
(function () {
  const HERO = {
    A: ['Write posts, cut clips,', 'and keep it all in one app.'],
    B: ['Your best posts are', 'already on camera.'],
    C: ['One app for the work', 'between video and post.'],
  };
  const CTA = {
    1: 'Join the waitlist',
    2: 'Apply to the waitlist',
  };
  // Head copy per pick (deck r6 head note): A keeps the deck's title; B and C use the picked H1 on one line.
  const HEAD_A = 'Write posts, cut clips and keep it all in one app';
  // Final CTA: if H1 B is picked, the deck swaps the final H2 so the page doesn't say "already" twice (sub unchanged).
  // h2 is HTML: the emphasized phrase keeps the page's purple gradient span.
  const FINAL_DEFAULT = {
    h2: 'Your next posts are<br class="hidden sm:block" /> <span class="text-purple-gradient">already recorded.</span>',
  };
  const FINAL_FOR_B = {
    h2: 'Your next posts are<br class="hidden sm:block" /> <span class="text-purple-gradient">in that folder.</span>',
  };
  // FAQ 4 follows the CTA pick (deck r7 S8 note; answer unchanged).
  const FAQ4 = { 1: 'What happens after I join?', 2: 'What happens after I apply?' };
  const SAMPLE = {
    A: { q1: 'get more out of the videos you already make', q2: "you're sitting on videos you never used" },
    B: { q1: 'post things that sound like you', q2: "you're posting, but it doesn't sound like you" },
    C: { q1: 'have the right people reach out to work with you', q2: "you're posting, but it never turns into conversations" },
    D: { q1: 'show up every week without losing client hours', q2: "you're spending hours turning one video into a post or two" },
  };
  const META_BASE = 'A desktop app that takes one video to a transcript, post drafts in your voice and clips, using your own AI. ';
  const META_LAST = { 1: 'Join the waitlist.', 2: 'Apply to the waitlist.' };

  const store = {
    get: (k, d) => { try { return localStorage.getItem('echoos_preview4_' + k) || d; } catch (e) { return d; } },
    set: (k, v) => { try { localStorage.setItem('echoos_preview4_' + k, v); } catch (e) { /* ignore */ } },
  };

  function applyHero(pick) {
    const [l1, l2] = HERO[pick];
    document.querySelectorAll('[data-copy="hero-line1"]').forEach(el => { el.textContent = l1; });
    document.querySelectorAll('[data-copy="hero-line2"]').forEach(el => { el.textContent = l2; });
    const h2 = document.querySelector('[data-copy="final-h2"]');
    if (h2) h2.innerHTML = (pick === 'B' ? FINAL_FOR_B : FINAL_DEFAULT).h2;
    const head = pick === 'A' ? HEAD_A : l1 + ' ' + l2.replace(/\.$/, '');
    const og = document.querySelector('meta[property="og:title"]');
    if (og) og.setAttribute('content', head);
    document.title = 'EchoOS | ' + head;
    store.set('hero', pick);
  }

  function applyCta(pick) {
    document.querySelectorAll('[data-cta-label]').forEach(el => { el.textContent = CTA[pick]; });
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', META_BASE + META_LAST[pick]);
    const faq4 = document.querySelector('[data-copy="faq4-q"]');
    if (faq4) faq4.textContent = FAQ4[pick];
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
    const ctaBtns = ['1', '2'].map(k => button(k, () => { applyCta(k); mark(panel, 'cta', k); }, 'cta', k));
    // Jumping straight to a result shows the close for the current save state (saved unless the failure toggle is on).
    const resBtns = ['A', 'B', 'C', 'D'].map(k => button(k, () => {
      if (!window.EchoQuiz) return;
      window.EchoQuiz.state.lead = { saved: !window.__echoPreviewSaveFails };
      window.EchoQuiz.showResult(k, SAMPLE[k]);
    }));
    // Not persisted: every load starts with saves succeeding.
    window.__echoPreviewSaveFails = false;
    const failBtn = button('Simulate save failure: off', () => {
      window.__echoPreviewSaveFails = !window.__echoPreviewSaveFails;
      failBtn.textContent = 'Simulate save failure: ' + (window.__echoPreviewSaveFails ? 'on' : 'off');
      failBtn.style.background = window.__echoPreviewSaveFails ? '#8655F6' : 'rgba(255,255,255,.05)';
      failBtn.style.borderColor = window.__echoPreviewSaveFails ? '#8655F6' : 'rgba(255,255,255,.15)';
      failBtn.setAttribute('aria-pressed', String(window.__echoPreviewSaveFails));
      // If a result is open, redraw its close for the new state.
      const q = window.EchoQuiz;
      if (q && document.getElementById('quiz').dataset.current === 'result') { q.state.lead = { saved: !window.__echoPreviewSaveFails }; q.showResult(); }
    }, 'savefail', '');
    failBtn.id = 'preview-save-fail';
    failBtn.setAttribute('aria-pressed', 'false');
    body.appendChild(row('Hero', heroBtns));
    body.appendChild(row('CTA', ctaBtns));
    body.appendChild(row('Result', resBtns));
    body.appendChild(row('Save', [failBtn]));
    // Side by side: preview/build-compare.sh serves preview 3 at ./p3/, preview 2 at ./p2/ and preview 1 at ./p1/.
    const links = [['p3/', 'Open preview 3'], ['p2/', 'Open preview 2'], ['p1/', 'Open preview 1']].map(([href, text]) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      a.style.cssText = 'color:#C084FC;font:600 12px Manrope,sans-serif;text-decoration:underline';
      return a;
    });
    body.appendChild(row('Compare', links));
    panel.appendChild(head);
    panel.appendChild(body);
    document.body.appendChild(panel);
    // Phones: start collapsed so the panel never covers quiz buttons.
    if (window.innerWidth < 640) { body.style.display = 'none'; toggle.textContent = 'show'; }

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
