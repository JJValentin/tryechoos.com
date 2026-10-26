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
  --exclude 'preview' --exclude '*.md' --exclude 'agent_help.txt' --exclude 'CNAME' --exclude '/p1' --exclude '/p2' \
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
open(p, 'w', encoding='utf-8').write(s)
PY
echo "preview built: $out"
