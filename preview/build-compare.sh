#!/usr/bin/env sh
# PREVIEW ONLY. Builds the earlier previews next to the current one so Joshua can compare them
# side by side at the same address: preview 2 (tag preview-2 = a3b24d0) at <output-dir>/p2 and
# preview 1 (tag preview-1 = bc46161) at <output-dir>/p1. Each gets a purple bar with links back.
#   usage: preview/build-compare.sh <output-dir>
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
out=${1:?usage: preview/build-compare.sh <output-dir>}

build_old() { # <tag> <subdir>
  tmp=$(mktemp -d)
  git -C "$root" archive "$1" | tar -x -C "$tmp"
  sh "$tmp/preview/build-preview.sh" "$out/$2" >/dev/null
  rm -rf "$tmp"
}
build_old preview-1 p1
build_old preview-2 p2

python3 - "$out" <<'PY'
import sys
out = sys.argv[1]
link = 'color:#fff;text-decoration:underline'
bar = ('  <div data-preview-only style="position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:9999;'
       'background:#8655F6;color:#fff;font:700 11px Manrope,sans-serif;letter-spacing:.08em;padding:4px 12px;'
       'border-radius:0 0 8px 8px;white-space:nowrap">{label} (for comparison) &middot; {links}</div>\n</body>')
for sub, label, links in [
    ('p1', 'PREVIEW 1', [('../', 'open preview 3'), ('../p2/', 'preview 2')]),
    ('p2', 'PREVIEW 2', [('../', 'open preview 3'), ('../p1/', 'preview 1')]),
]:
    p = f'{out}/{sub}/index.html'
    s = open(p, encoding='utf-8').read()
    assert s.count('</body>') == 1
    html = ' &middot; '.join(f'<a href="{h}" style="{link}">{t}</a>' for h, t in links)
    s = s.replace('</body>', bar.format(label=label, links=html))
    open(p, 'w', encoding='utf-8').write(s)
# Preview 2's own switcher links to "p1/" (it was served at the root); from /p2/ that is ../p1/.
sw = f'{out}/p2/preview-switcher.js'
s = open(sw, encoding='utf-8').read()
assert s.count("cmp.href = 'p1/';") == 1
open(sw, 'w', encoding='utf-8').write(s.replace("cmp.href = 'p1/';", "cmp.href = '../p1/';"))
PY
echo "previews 1 and 2 built: $out/p1 $out/p2"
