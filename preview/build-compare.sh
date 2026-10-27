#!/usr/bin/env sh
# PREVIEW ONLY. Builds the earlier previews next to the current one so Joshua can compare them
# side by side at the same address: preview 4 (tag preview-4 = edfdab5) at <output-dir>/p4,
# preview 3 (tag preview-3 = d46fc4f) at <output-dir>/p3,
# preview 2 (tag preview-2 = a3b24d0) at <output-dir>/p2 and preview 1 (tag preview-1 = bc46161)
# at <output-dir>/p1. Each gets a purple bar with links back.
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
build_old preview-3 p3
build_old preview-4 p4

python3 - "$out" <<'PY'
import sys
out = sys.argv[1]
link = 'color:#fff;text-decoration:underline'
bar = ('  <div data-preview-only style="position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:9999;'
       'background:#8655F6;color:#fff;font:700 11px Manrope,sans-serif;letter-spacing:.08em;padding:4px 12px;'
       'border-radius:0 0 8px 8px;white-space:nowrap">{label} (for comparison) &middot; {links}</div>\n</body>')
for sub, label, links in [
    ('p1', 'PREVIEW 1', [('../', 'open preview 5'), ('../p4/', 'preview 4'), ('../p3/', 'preview 3'), ('../p2/', 'preview 2')]),
    ('p2', 'PREVIEW 2', [('../', 'open preview 5'), ('../p4/', 'preview 4'), ('../p3/', 'preview 3'), ('../p1/', 'preview 1')]),
    ('p3', 'PREVIEW 3', [('../', 'open preview 5'), ('../p4/', 'preview 4'), ('../p2/', 'preview 2'), ('../p1/', 'preview 1')]),
    ('p4', 'PREVIEW 4', [('../', 'open preview 5'), ('../p3/', 'preview 3'), ('../p2/', 'preview 2'), ('../p1/', 'preview 1')]),
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
# Preview 3's switcher links to "p2/" and "p1/" (it was served at the root); from /p3/ those are ../p2/ and ../p1/.
sw = f'{out}/p3/preview-switcher.js'
s = open(sw, encoding='utf-8').read()
old = "[['p2/', 'Open preview 2'], ['p1/', 'Open preview 1']]"
assert s.count(old) == 1
open(sw, 'w', encoding='utf-8').write(s.replace(old, "[['../p2/', 'Open preview 2'], ['../p1/', 'Open preview 1']]"))
# Preview 4's switcher links to "p3/", "p2/" and "p1/" (it was served at the root); from /p4/ those are ../p3/, ../p2/ and ../p1/.
sw = f'{out}/p4/preview-switcher.js'
s = open(sw, encoding='utf-8').read()
old = "[['p3/', 'Open preview 3'], ['p2/', 'Open preview 2'], ['p1/', 'Open preview 1']]"
assert s.count(old) == 1
open(sw, 'w', encoding='utf-8').write(s.replace(old, "[['../p3/', 'Open preview 3'], ['../p2/', 'Open preview 2'], ['../p1/', 'Open preview 1']]"))
PY
echo "previews 1 to 4 built: $out/p1 $out/p2 $out/p3 $out/p4"
