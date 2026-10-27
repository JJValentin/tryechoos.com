// PREVIEW ONLY. Not referenced by index.html; preview/build-preview.sh injects it into the
// preview copy. Delete the preview/ folder before or after publishing; nothing depends on it.
//
// Preview 5 (copy-deck-r8): the picks are locked (Amendment 5: hero A, "Join the waitlist"), so the
// hero and CTA switches are gone. What stays: jump straight to each result variant, and simulate a
// failed save to see the save-failed close (the preview's stand-in for submitLead() resolves saved;
// preview/build-preview.sh wires it to this toggle).
(function () {
  // Sample Q1/Q2 echo lines per result (r8 option wording).
  const SAMPLE = {
    A: { q1: 'get more from videos you already make', q2: "you're sitting on videos you never used" },
    B: { q1: 'post things that sound like you', q2: "you're posting, but it doesn't sound like you" },
    C: { q1: 'get the right people reaching out', q2: "you're posting, but nobody reaches out" },
    D: { q1: 'show up every week without losing client hours', q2: "you're losing hours turning videos into posts" },
  };

  function button(label, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText = 'padding:4px 9px;border-radius:7px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#F4F4F5;font:600 12px Manrope,sans-serif;cursor:pointer';
    b.addEventListener('click', onClick);
    return b;
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
    label.textContent = 'PREVIEW 5 ONLY';
    label.style.cssText = 'color:#C084FC;font:700 10px Manrope,sans-serif;letter-spacing:.12em';
    const toggle = button('hide', () => {
      const hidden = body.style.display === 'none';
      body.style.display = hidden ? '' : 'none';
      toggle.textContent = hidden ? 'hide' : 'show';
    });
    head.appendChild(label);
    head.appendChild(toggle);
    const body = document.createElement('div');

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
    });
    failBtn.id = 'preview-save-fail';
    failBtn.setAttribute('aria-pressed', 'false');
    body.appendChild(row('Result', resBtns));
    body.appendChild(row('Save', [failBtn]));
    // Side by side: preview/build-compare.sh serves preview 5 at ./p5/, 4 at ./p4/, 3 at ./p3/, 2 at ./p2/ and 1 at ./p1/.
    const links = [['p5/', 'Open preview 5'], ['p4/', 'preview 4'], ['p3/', 'preview 3'], ['p2/', 'preview 2'], ['p1/', 'preview 1']].map(([href, text]) => {
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
