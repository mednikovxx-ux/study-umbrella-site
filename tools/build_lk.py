"""Собирает личный кабинет: src/lk/*.jsx → site/lk/app.js (+ site/lk/index.html) и общий css/fonts.css."""
import pathlib, re, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
local = ROOT / 'src/lk/owner.local.js'
if not local.exists():
    local.write_text((ROOT / 'src/lk/owner.example.js').read_text(encoding='utf-8'), encoding='utf-8')
    print('создан src/lk/owner.local.js из шаблона: впишите туда контакты владельца')
esb = ROOT / 'node_modules' / '.bin' / ('esbuild.cmd' if sys.platform == 'win32' else 'esbuild')
subprocess.run([str(esb), str(ROOT / 'src/lk/main.jsx'), '--bundle', '--minify', '--format=iife',
                '--define:process.env.NODE_ENV="production"', '--loader:.js=jsx', '--jsx=automatic',
                f'--outfile={ROOT / "site/lk/app.js"}', '--legal-comments=none'], check=True, cwd=ROOT)
(ROOT / 'site/lk/index.html').write_text((ROOT / 'src/lk/shell.html').read_text(encoding='utf-8'), encoding='utf-8')
css = (ROOT / 'site/css/main.css').read_text(encoding='utf-8')
m = re.search(r'/\*FONTS-LOCAL\*/.*?/\*END-FONTS-LOCAL\*/\n', css, re.S)
kyiv = re.search(r'@font-face\{font-family:"Kyiv Type Serif"[^}]*\}', css).group(0)
(ROOT / 'site/css/fonts.css').write_text(m.group(0) + kyiv + '\n', encoding='utf-8')
print('кабинет собран:', (ROOT / 'site/lk/app.js').stat().st_size // 1024, 'КБ')
