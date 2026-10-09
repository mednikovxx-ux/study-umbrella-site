"""Копия сайта для GitHub Pages: сайт там живёт не в корне, а по адресу /<репозиторий>/,
поэтому абсолютные пути /css/…, /img/… получают этот префикс. Демо-копию не индексируют поисковики."""
import pathlib, re, shutil, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
base = '/' + sys.argv[1].strip('/')
out = ROOT / '_pages'
shutil.rmtree(out, ignore_errors=True)
shutil.copytree(ROOT / 'site', out)
for f in out.rglob('*'):
    if f.suffix not in ('.html', '.css', '.js'):
        continue
    t = f.read_text(encoding='utf-8')
    if f.suffix == '.js':
        t = re.sub(r'(["\'])/(img|lk|css|fonts|js)/', lambda m: m.group(1) + base + '/' + m.group(2) + '/', t)
        t = re.sub(r'href:"/"', 'href:"' + base + '/"', t)
        t = re.sub(r'href="/"', 'href="' + base + '/"', t)
    else:
        t = re.sub(r'((?:href|src|action)=["\']|url\(["\']?)/(?!/)', lambda m: m.group(1) + base + '/', t)
    if f.suffix == '.html':
        t = t.replace('<head>', '<head>\n<meta name="robots" content="noindex">', 1)
    f.write_text(t, encoding='utf-8')
print('копия для Pages:', out, 'префикс', base)
