#!/usr/bin/env sh
# PREVIEW ONLY. Builds the earlier previews next to the current one so Joshua can compare them
# side by side at the same address: preview 8 (tag preview-8 = 01b79de) at <output-dir>/p8,
# preview 7 (tag preview-7 = 41d6e7f) at <output-dir>/p7,
# preview 6 (tag preview-6 = 580f8ca) at <output-dir>/p6,
# preview 5 (tag preview-5 = 0d5787b) at <output-dir>/p5,
# preview 4 (tag preview-4 = edfdab5) at <output-dir>/p4,
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
build_old preview-5 p5
build_old preview-6 p6
build_old preview-7 p7
build_old preview-8 p8

python3 - "$out" <<'PY'
import sys
out = sys.argv[1]
link = 'color:#fff;text-decoration:underline'
bar = ('  <div data-preview-only style="position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:9999;'
       'background:#8655F6;color:#fff;font:700 11px Manrope,sans-serif;letter-spacing:.08em;padding:4px 12px;'
       'border-radius:0 0 8px 8px;white-space:nowrap">{label} (for comparison) &middot; {links}</div>\n</body>')
for sub, label, links in [
    ('p1', 'PREVIEW 1', [('../', 'open preview 9'), ('../p8/', 'preview 8'), ('../p7/', 'preview 7'), ('../p6/', 'preview 6'), ('../p5/', 'preview 5'), ('../p4/', 'preview 4'), ('../p3/', 'preview 3'), ('../p2/', 'preview 2')]),
    ('p2', 'PREVIEW 2', [('../', 'open preview 9'), ('../p8/', 'preview 8'), ('../p7/', 'preview 7'), ('../p6/', 'preview 6'), ('../p5/', 'preview 5'), ('../p4/', 'preview 4'), ('../p3/', 'preview 3'), ('../p1/', 'preview 1')]),
    ('p3', 'PREVIEW 3', [('../', 'open preview 9'), ('../p8/', 'preview 8'), ('../p7/', 'preview 7'), ('../p6/', 'preview 6'), ('../p5/', 'preview 5'), ('../p4/', 'preview 4'), ('../p2/', 'preview 2'), ('../p1/', 'preview 1')]),
    ('p4', 'PREVIEW 4', [('../', 'open preview 9'), ('../p8/', 'preview 8'), ('../p7/', 'preview 7'), ('../p6/', 'preview 6'), ('../p5/', 'preview 5'), ('../p3/', 'preview 3'), ('../p2/', 'preview 2'), ('../p1/', 'preview 1')]),
    ('p5', 'PREVIEW 5', [('../', 'open preview 9'), ('../p8/', 'preview 8'), ('../p7/', 'preview 7'), ('../p6/', 'preview 6'), ('../p4/', 'preview 4'), ('../p3/', 'preview 3'), ('../p2/', 'preview 2'), ('../p1/', 'preview 1')]),
    ('p6', 'PREVIEW 6', [('../', 'open preview 9'), ('../p8/', 'preview 8'), ('../p7/', 'preview 7'), ('../p5/', 'preview 5'), ('../p4/', 'preview 4'), ('../p3/', 'preview 3'), ('../p2/', 'preview 2'), ('../p1/', 'preview 1')]),
    ('p7', 'PREVIEW 7', [('../', 'open preview 9'), ('../p8/', 'preview 8'), ('../p6/', 'preview 6'), ('../p5/', 'preview 5'), ('../p4/', 'preview 4'), ('../p3/', 'preview 3'), ('../p2/', 'preview 2'), ('../p1/', 'preview 1')]),
    ('p8', 'PREVIEW 8', [('../', 'open preview 9'), ('../p7/', 'preview 7'), ('../p6/', 'preview 6'), ('../p5/', 'preview 5'), ('../p4/', 'preview 4'), ('../p3/', 'preview 3'), ('../p2/', 'preview 2'), ('../p1/', 'preview 1')]),
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
# Preview 5's switcher links to "p4/" to "p1/" (it was served at the root); from /p5/ those are ../p4/ to ../p1/.
sw = f'{out}/p5/preview-switcher.js'
s = open(sw, encoding='utf-8').read()
old = "[['p4/', 'Open preview 4'], ['p3/', 'preview 3'], ['p2/', 'preview 2'], ['p1/', 'preview 1']]"
assert s.count(old) == 1
open(sw, 'w', encoding='utf-8').write(s.replace(old, "[['../p4/', 'Open preview 4'], ['../p3/', 'preview 3'], ['../p2/', 'preview 2'], ['../p1/', 'preview 1']]"))
# Preview 6's switcher links to "p5/" to "p1/" (it was served at the root); from /p6/ those are ../p5/ to ../p1/.
sw = f'{out}/p6/preview-switcher.js'
s = open(sw, encoding='utf-8').read()
old = "[['p5/', 'Open preview 5'], ['p4/', 'preview 4'], ['p3/', 'preview 3'], ['p2/', 'preview 2'], ['p1/', 'preview 1']]"
assert s.count(old) == 1
open(sw, 'w', encoding='utf-8').write(s.replace(old, "[['../p5/', 'Open preview 5'], ['../p4/', 'preview 4'], ['../p3/', 'preview 3'], ['../p2/', 'preview 2'], ['../p1/', 'preview 1']]"))
# Preview 7's switcher links to "p6/" to "p1/" (it was served at the root); from /p7/ those are ../p6/ to ../p1/.
sw = f'{out}/p7/preview-switcher.js'
s = open(sw, encoding='utf-8').read()
old = "[['p6/', 'Open preview 6'], ['p5/', 'preview 5'], ['p4/', 'preview 4'], ['p3/', 'preview 3'], ['p2/', 'preview 2'], ['p1/', 'preview 1']]"
assert s.count(old) == 1
open(sw, 'w', encoding='utf-8').write(s.replace(old, "[['../p6/', 'Open preview 6'], ['../p5/', 'preview 5'], ['../p4/', 'preview 4'], ['../p3/', 'preview 3'], ['../p2/', 'preview 2'], ['../p1/', 'preview 1']]"))
# Preview 8's switcher links to "p7/" to "p1/" (it was served at the root); from /p8/ those are ../p7/ to ../p1/.
sw = f'{out}/p8/preview-switcher.js'
s = open(sw, encoding='utf-8').read()
old = "[['p7/', 'Open preview 7'], ['p6/', 'preview 6'], ['p5/', 'preview 5'], ['p4/', 'preview 4'], ['p3/', 'preview 3'], ['p2/', 'preview 2'], ['p1/', 'preview 1']]"
assert s.count(old) == 1
open(sw, 'w', encoding='utf-8').write(s.replace(old, "[['../p7/', 'Open preview 7'], ['../p6/', 'preview 6'], ['../p5/', 'preview 5'], ['../p4/', 'preview 4'], ['../p3/', 'preview 3'], ['../p2/', 'preview 2'], ['../p1/', 'preview 1']]"))
# Amendment 9: GoHighLevel is no longer the lead destination. The archived copies keep their pages but their
# source comments about the old relay become a neutral note (comments only; submitLead() behaviour unchanged).
import re, glob
for p in glob.glob(f'{out}/p[0-9]/index.html'):
    s = open(p, encoding='utf-8').read()
    bad = re.compile(r'\bGHL\b|HighLevel|/api/ghl', re.I)
    lines = s.split('\n')
    lines = [re.sub(r'(//|<!--)\s.*$', r'\1 Lead destination: not wired.' + (' -->' if '<!--' in l and '-->' in l else ''), l)
             if bad.search(l) else l for l in lines]
    s = '\n'.join(lines)
    assert not bad.search(s), p
    open(p, 'w', encoding='utf-8').write(s)
PY
echo "previews 1 to 8 built: $out/p1 $out/p2 $out/p3 $out/p4 $out/p5 $out/p6 $out/p7 $out/p8"
