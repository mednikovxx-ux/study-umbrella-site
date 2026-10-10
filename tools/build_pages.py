"""Собирает внутренние страницы сайта из src/pages/*.html в site/<страница>/index.html.
Имя файла blog__statya.html → site/blog/statya/index.html.
Шапка, блок заявки, подвал и карточки преподавателей берутся из site/index.html,
поэтому правятся в одном месте.
Источник страницы: <!--HEAD--> мета-теги и JSON-LD <!--BODY--> секции.
Вставки: {{TEACHERS:Имя|Имя}}, {{CTA}}.
"""
import pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
S = ROOT / 'site'
SRC = ROOT / 'src' / 'pages'
import hashlib, re as _re
ASSET_V = hashlib.md5(((S / 'css/main.css').read_bytes() + (S / 'js/main.js').read_bytes())).hexdigest()[:8]
# главная тоже получает метку версии, чтобы браузер не показывал старые стили
_home = (S / 'index.html').read_text(encoding='utf-8')
_home = _re.sub(r'/css/main\.css(\?v=\w+)?', '/css/main.css?v=' + ASSET_V, _home)
_home = _re.sub(r'/js/main\.js(\?v=\w+)?', '/js/main.js?v=' + ASSET_V, _home)
(S / 'index.html').write_text(_home, encoding='utf-8')
idx = (S / 'index.html').read_text(encoding='utf-8')

def block(start, end):
    i = idx.index(start); j = idx.index(end, i) + len(end); return idx[i:j]

KEEP = {'#zayavka', '#main'}
def to_root(html):
    return re.sub(r'href="(#[\w-]+)"', lambda m: m.group(0) if m.group(1) in KEEP else f'href="/{m.group(1)}"', html)

header = to_root(block('<header class="top"', '</header>'))
footer = to_root(block('<footer class="foot">', '</footer>'))
cta = block('<section class="sec cta" id="zayavka"', '</section>')
lis = re.findall(r'   <li><figure class="polaroid">.*?</li>', idx)

def teachers(names):
    out = []
    for n in names.split('|'):
        li = [l for l in lis if f'<h3>{n}</h3>' in l]
        assert li, n; out.append(li[0])
    return '\n'.join(out)

HEAD_COMMON = '''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="Study Umbrella">
<meta property="og:image" content="https://example.com/img/og-cover.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1D4E5F">
<link rel="icon" type="image/png" href="/img/favicon.png">
<link rel="apple-touch-icon" href="/img/mark.png">
<link rel="preload" href="/fonts/KyivTypeSerif-Bold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/onest-cyrillic-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<!-- ПОДКЛЮЧИТЬ при запуске: Яндекс.Метрика (вставить код счётчика сюда) и подтверждение в Яндекс.Вебмастере:
<meta name="yandex-verification" content="КОД"> -->
<link rel="stylesheet" href="/css/main.css?v={ASSET_V}">'''


import math
LUC = ROOT / 'node_modules' / 'lucide-static' / 'icons'
def icon(name):
    s = (LUC / f'{name}.svg').read_text(encoding='utf-8')
    s = s[s.index('<svg'):]
    s = re.sub(r'\s+', ' ', s).replace(' >', '>').replace('> <', '><')
    s = re.sub(r'class="[^"]*"', 'class="ic" aria-hidden="true" focusable="false"', s)
    return s.replace('width="24" height="24" ', '')
def star(cx, cy, r, rot=-90):
    pts = []
    for i in range(10):
        a = math.radians(rot + i * 36); rr = r if i % 2 == 0 else r * 0.382
        pts.append(f'{cx + rr*math.cos(a):.1f},{cy + rr*math.sin(a):.1f}')
    return ' '.join(pts)
FLAGS = {
 'gb': '<rect width="60" height="60" fill="#012169"/><path d="M0 0L60 60M60 0L0 60" stroke="#fff" stroke-width="12"/><path d="M0 0L60 60M60 0L0 60" stroke="#C8102E" stroke-width="4"/><path d="M30 0V60M0 30H60" stroke="#fff" stroke-width="16"/><path d="M30 0V60M0 30H60" stroke="#C8102E" stroke-width="9"/>',
 'es': '<rect width="60" height="60" fill="#AA151B"/><rect y="15" width="60" height="30" fill="#F1BF00"/>',
 'it': '<rect width="20" height="60" fill="#009246"/><rect x="20" width="20" height="60" fill="#fff"/><rect x="40" width="20" height="60" fill="#CE2B37"/>',
 'cn': '<rect width="60" height="60" fill="#DE2910"/><polygon fill="#FFDE00" points="' + star(20, 22, 11) + '"/><polygon fill="#FFDE00" points="' + star(36, 12, 3.2, -60) + '"/><polygon fill="#FFDE00" points="' + star(42, 20, 3.2, -75) + '"/><polygon fill="#FFDE00" points="' + star(42, 30, 3.2, -90) + '"/><polygon fill="#FFDE00" points="' + star(36, 37, 3.2, -105) + '"/>',
 'kr': '<rect width="60" height="60" fill="#fff"/><g transform="rotate(-33 30 30)"><path d="M16 30a14 14 0 0 1 28 0z" fill="#CD2E3A"/><path d="M16 30a14 14 0 0 0 28 0z" fill="#0047A0"/><circle cx="23" cy="30" r="7" fill="#CD2E3A"/><circle cx="37" cy="30" r="7" fill="#0047A0"/></g><g stroke="#111" stroke-width="2.2"><path d="M8 18l7-9M10.5 20l7-9M13 22l7-9"/><path d="M40 50l7-9M42.5 52l7-9M45 54l7-9"/><path d="M40 9l7 9M42.5 7l7 9M45 5l7 9"/><path d="M8 41l7 9M10.5 39l7 9M13 37l7 9"/></g>',
 'tr': '<rect width="60" height="60" fill="#E30A17"/><circle cx="24" cy="30" r="13" fill="#fff"/><circle cx="27.5" cy="30" r="10.4" fill="#E30A17"/><polygon fill="#fff" points="' + star(39, 30, 6, 180) + '"/>',
}
def flag(code):
    return f'<span class="flag" aria-hidden="true"><svg viewBox="0 0 60 60" focusable="false">{FLAGS[code]}</svg></span>'

for src in sorted(SRC.glob('*.html')):
    t = src.read_text(encoding='utf-8')
    head, body = t.split('<!--BODY-->')
    head = head.replace('<!--HEAD-->', '').strip()
    slug = src.stem.replace('__', '/')
    top = slug.split('/')[0]
    hdr = header.replace(f'<a href="/{top}/">', f'<a href="/{top}/" aria-current="page">')
    body = body.replace('{{ALLTEACHERS}}', '\n'.join(lis))
    body = re.sub(r'\{\{TEACHERS:(.*?)\}\}', lambda m: teachers(m.group(1)), body)
    body = body.replace('{{CTA}}', cta)
    if 'id="zayavka"' not in body:
        hdr = hdr.replace('href="#zayavka"', 'href="/#zayavka"')
    body = re.sub(r'\{\{ICON:([\w-]+)\}\}', lambda m: icon(m.group(1)), body)
    body = re.sub(r'\{\{FLAG:(\w+)\}\}', lambda m: flag(m.group(1)), body)
    page = f'''<!doctype html>
<html lang="ru">
<head>
{HEAD_COMMON}
{head}
</head>
<body>

{hdr}

<main id="main">
{body.strip()}
</main>

{footer}

<script src="/js/main.js?v={ASSET_V}" defer></script>
</body>
</html>
'''
    out = S / slug / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page.replace('{ASSET_V}', ASSET_V), encoding='utf-8')
    print('built', out.relative_to(S))
