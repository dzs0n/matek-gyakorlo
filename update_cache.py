#!/usr/bin/env python3
"""Cache-busting for a static GitHub Pages site. Run from repository root."""
from pathlib import Path
from datetime import datetime, timezone
import json, re, sys

root = Path.cwd()
if not (root / 'index.html').is_file():
    sys.exit('HIBA: A projekt gyokerebol futtasd (ahol az index.html van).')

version = datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')
marker_start = '<!-- MATEK-CACHE-START -->'
marker_end = '<!-- MATEK-CACHE-END -->'

# Pages inside /exercises/ must fetch the manifest one directory higher.
checker = r'''<!-- MATEK-CACHE-START -->
<script>
(() => {
  const versionFile = new URL('__MANIFEST__', document.baseURI);
  const current = '__VERSION__';
  let refreshing = false;
  async function checkVersion() {
    if (refreshing) return;
    try {
      const response = await fetch(versionFile.href + '?t=' + Date.now(), {
        cache: 'no-store'
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.version && data.version !== current) {
        refreshing = true;
        const url = new URL(location.href);
        url.searchParams.set('site_version', data.version);
        location.replace(url.href);
      }
    } catch (_) { /* Offline: keep the page usable. */ }
  }
  window.addEventListener('pageshow', checkVersion);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkVersion();
  });
  window.addEventListener('focus', checkVersion);
  setInterval(() => {
    if (!document.hidden) checkVersion();
  }, 60000);
})();
</script>
<!-- MATEK-CACHE-END -->'''

# Add a version to local .js and .css references, including JS module imports.
# Avoid remote URLs and leave non-JS/CSS URLs untouched.
asset_re = re.compile(r'(?P<path>(?:(?:\.{1,2}/)|(?:/)|(?:js/)|(?:css/)|(?:exercises/)|(?:style\.css))[^\s\"\'`<>]*?\.(?:js|css))(?P<query>\?[^\s\"\'`<>]*)?', re.I)

def bust(match):
    path = match.group('path')
    query = match.group('query') or ''
    # Preserve existing query parameters other than the cache key.
    params = [x for x in query.lstrip('?').split('&') if x and not x.startswith('v=')]
    params.append('v=' + version)
    return path + '?' + '&'.join(params)

changed = []
for path in sorted(list(root.rglob('*.html')) + list(root.rglob('*.js'))):
    if any(part in {'.git', '.idea', 'node_modules', 'dist', 'build'} for part in path.relative_to(root).parts):
        continue
    original = path.read_text(encoding='utf-8-sig')
    content = original
    if path.suffix == '.html':
        if marker_start in content and marker_end in content:
            content = re.sub(re.escape(marker_start) + r'.*?' + re.escape(marker_end), '', content, flags=re.S)
        manifest = '../version.json' if path.parent != root else 'version.json'
        block = checker.replace('__MANIFEST__', manifest).replace('__VERSION__', version)
        if re.search(r'</head\s*>', content, flags=re.I):
            content = re.sub(r'</head\s*>', lambda m: block + '\n' + m.group(0), content, count=1, flags=re.I)
        else:
            print('FIGYELEM: nincs </head>:', path)
    # Match only URL tokens ending in .js/.css; this also catches module imports.
    content = asset_re.sub(bust, content)
    if content != original:
        path.write_text(content, encoding='utf-8', newline='\n')
        changed.append(str(path.relative_to(root)))

(root / 'version.json').write_text(json.dumps({'version': version}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('KESZ! Uj verzio:', version)
print('Modositott fajlok:', ', '.join(changed) if changed else '(nincs)')
print('Letrehozva: version.json')
print('Kovetkezo: helyi teszt, majd git add/commit/push.')
