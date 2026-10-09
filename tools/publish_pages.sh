#!/bin/sh
# Демо на GitHub Pages: собирает сайт, ставит префикс репозитория и выкладывает в ветку gh-pages.
set -e
cd "$(dirname "$0")/.."
# Демо собирается БЕЗ контактов владельца: owner.local.js на время сборки убирается.
mv src/lk/owner.local.js /tmp/su-owner.local.js
trap 'mv -f /tmp/su-owner.local.js src/lk/owner.local.js; npm run build:lk >/dev/null' EXIT
cp src/lk/owner.example.js src/lk/owner.local.js
npm run build
python3 tools/pages_base.py study-umbrella-site
PATTERN=$(grep -oE '"(@[A-Za-z0-9_]+|\+7[^"]*|[^"]+@[^"]+)"' /tmp/su-owner.local.js | tr -d '"' | sed 's/[^0-9A-Za-z@._]//g' | grep -v "^$" | paste -sd "|" -)
if [ -n "$PATTERN" ] && grep -rqE "$PATTERN" _pages; then echo "СТОП: в демо попали личные данные"; exit 1; fi
touch _pages/.nojekyll
rm -rf /tmp/su-pages && git worktree add -f /tmp/su-pages gh-pages 2>/dev/null || git worktree add -f --orphan -b gh-pages /tmp/su-pages
find /tmp/su-pages -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R _pages/. /tmp/su-pages/
cd /tmp/su-pages && git add -A && git commit -q --amend -m "Демо сайта" && git push -q --force -u origin gh-pages
cd - >/dev/null && git worktree remove --force /tmp/su-pages
echo "опубликовано: https://mednikovxx-ux.github.io/study-umbrella-site/"
