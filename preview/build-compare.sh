#!/usr/bin/env sh
# PREVIEW ONLY. Builds preview 1 (tag preview-1 = bc46161) into <output-dir>/p1 so Joshua can
# compare it side by side with the current preview at the same address (/p1/).
#   usage: preview/build-compare.sh <output-dir>
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
out=${1:?usage: preview/build-compare.sh <output-dir>}
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git -C "$root" archive preview-1 | tar -x -C "$tmp"
sh "$tmp/preview/build-preview.sh" "$out/p1" >/dev/null
python3 - "$out/p1/index.html" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
badge = ('  <div data-preview-only style="position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:9999;'
         'background:#8655F6;color:#fff;font:700 11px Manrope,sans-serif;letter-spacing:.08em;padding:4px 12px;'
         'border-radius:0 0 8px 8px">PREVIEW 1 (for comparison) &middot; <a href="../" style="color:#fff;text-decoration:underline">'
         'open preview 2</a></div>\n</body>')
assert s.count('</body>') == 1
s = s.replace('</body>', badge)
open(p, 'w', encoding='utf-8').write(s)
PY
echo "preview 1 built: $out/p1"
