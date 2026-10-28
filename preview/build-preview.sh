#!/usr/bin/env sh
# PREVIEW ONLY. Builds a private preview copy of the site with the pick switcher injected.
# The production index.html never references preview-switcher.js.
#   usage: preview/build-preview.sh <output-dir>
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
out=${1:?usage: preview/build-preview.sh <output-dir>}
mkdir -p "$out"
rsync -a --delete \
  --exclude '.git' --exclude '.antigravity' --exclude 'research' --exclude 'design-system' \
  --exclude 'preview' --exclude '*.md' --exclude 'agent_help.txt' --exclude 'CNAME' --exclude '/p1' --exclude '/p2' --exclude '/p3' --exclude '/p4' --exclude '/p5' --exclude '/p6' --exclude '/p7' --exclude '/p8' --exclude '/p9' \
  "$root"/ "$out"/
cp "$root/preview/preview-switcher.js" "$out/preview-switcher.js"
python3 - "$out/index.html" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
tag = '  <script src="preview-switcher.js"></script><!-- PREVIEW ONLY -->\n</body>'
assert s.count('</body>') == 1
s = s.replace('</body>', tag)
s = s.replace('<head>', '<head>\n  <meta name="robots" content="noindex, nofollow" />', 1)
# Preview hooks for the Whop join step. The real Whop checkout still mounts in the preview (the pixel never sends off
# tryechoos.com). The switcher can (a) simulate Whop's onComplete with a fake waitlist entry, showing the confirmation
# without a real join, and (b) simulate a load failure, showing the hosted-checkout fallback.
hook = "      window.EchoQuiz = { open, close, showStep, showResult, state };"
assert s.count(hook) == 1
s = s.replace(hook, hook + "\n      window.__echoPreviewJoin = { complete: onWhopComplete, fail: joinFailed, mount: mountJoin }; // PREVIEW ONLY")
gate = "        setJoin('loading');\n        renderTimer ="
assert s.count(gate) == 1
s = s.replace(gate, "        setJoin('loading');\n        if (window.__echoPreviewJoinFails) { joinFailed('PREVIEW: simulated load failure'); return; } // PREVIEW ONLY\n        renderTimer =")
open(p, 'w', encoding='utf-8').write(s)
PY
echo "preview built: $out"
