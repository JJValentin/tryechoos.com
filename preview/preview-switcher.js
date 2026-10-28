// PREVIEW ONLY. Not referenced by index.html; preview/build-preview.sh injects it into the
// preview copy. Delete the preview/ folder before or after publishing; nothing depends on it.
//
// Short waitlist form (2026-10-28, quiz removed): "Open form" opens the overlay at the name + email form;
// "Open join step" skips the form with a sample contact (Preview Tester, preview-test@example.com), so the
// real Whop checkout mounts with that email prefilled. "Simulate join success" fakes Whop's onComplete
// (confirmation, no real join) and "Simulate load failure" shows the hosted-checkout fallback.
// preview/build-preview.sh exposes the hooks (window.__echoPreviewJoin) these buttons call.
(function () {
  const SAMPLE = { name: 'Preview Tester', email: 'preview-test@example.com' };

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

  function onJoinStep() {
    return document.getElementById('quiz').dataset.current === 'join';
  }

  function build() {
    const panel = document.createElement('div');
    panel.id = 'preview-switcher';
    panel.setAttribute('data-preview-only', '');
    panel.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:9999;background:rgba(9,9,11,.94);border:1px solid rgba(134,85,246,.5);border-radius:12px;padding:10px 12px;box-shadow:0 10px 30px rgba(0,0,0,.6);max-width:calc(100vw - 24px)';
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px';
    const label = document.createElement('span');
    label.textContent = 'PREVIEW 10 ONLY';
    label.style.cssText = 'color:#C084FC;font:700 10px Manrope,sans-serif;letter-spacing:.12em';
    const toggle = button('hide', () => {
      const hidden = body.style.display === 'none';
      body.style.display = hidden ? '' : 'none';
      toggle.textContent = hidden ? 'hide' : 'show';
    });
    head.appendChild(label);
    head.appendChild(toggle);
    const body = document.createElement('div');

    const formBtn = button('Open form', () => { if (window.EchoQuiz) window.EchoQuiz.open(); });
    formBtn.id = 'preview-open-form';
    // Same join step a form submit opens, minus the pixel lead: the real Whop checkout mounts with the sample email.
    const joinBtn = button('Open join step', () => { if (window.EchoQuiz) window.EchoQuiz.showJoin(Object.assign({}, SAMPLE)); });
    joinBtn.id = 'preview-open-join';

    // Simulate Whop's onComplete (a fake ent_ waitlist entry): shows the confirmation. Nothing is sent to Whop.
    const okBtn = button('Simulate join success', () => {
      const q = window.EchoQuiz, j = window.__echoPreviewJoin;
      if (!q || !j || !onJoinStep() || !q.state.lead) return;
      console.info('[preview] simulating Whop onComplete: waitlist_entry ent_PREVIEW (no real join)');
      j.complete({ result: 'waitlist_entry', entryId: 'ent_PREVIEW', sessionId: 'chs_PREVIEW' });
    });
    okBtn.id = 'preview-join-success';
    // Not persisted: every load starts with the embed loading for real.
    window.__echoPreviewJoinFails = false;
    const failBtn = button('Simulate load failure: off', () => {
      window.__echoPreviewJoinFails = !window.__echoPreviewJoinFails;
      const on = window.__echoPreviewJoinFails;
      failBtn.textContent = 'Simulate load failure: ' + (on ? 'on' : 'off');
      failBtn.style.background = on ? '#8655F6' : 'rgba(255,255,255,.05)';
      failBtn.style.borderColor = on ? '#8655F6' : 'rgba(255,255,255,.15)';
      failBtn.setAttribute('aria-pressed', String(on));
      // If a join step is open, redraw it for the new state: fallback now, or a fresh real mount.
      const q = window.EchoQuiz, j = window.__echoPreviewJoin, lead = q && q.state.lead;
      if (!j || !lead || lead.saved || !onJoinStep()) return;
      if (on) j.fail('PREVIEW: simulated load failure');
      else j.retry();
    });
    failBtn.id = 'preview-join-fail';
    failBtn.setAttribute('aria-pressed', 'false');
    body.appendChild(row('Open', [formBtn, joinBtn]));
    body.appendChild(row('Join', [okBtn, failBtn]));
    // Side by side: preview/build-compare.sh serves preview 9 at ./p9/, 8 at ./p8/, 7 at ./p7/, 6 at ./p6/, 5 at ./p5/, 4 at ./p4/, 3 at ./p3/, 2 at ./p2/ and 1 at ./p1/.
    const links = [['p9/', 'Open preview 9'], ['p8/', 'preview 8'], ['p7/', 'preview 7'], ['p6/', 'preview 6'], ['p5/', 'preview 5'], ['p4/', 'preview 4'], ['p3/', 'preview 3'], ['p2/', 'preview 2'], ['p1/', 'preview 1']].map(([href, text]) => {
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
    // Phones: start collapsed so the panel never covers the form buttons.
    if (window.innerWidth < 640) { body.style.display = 'none'; toggle.textContent = 'show'; }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
