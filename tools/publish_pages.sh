#!/bin/sh
# Демо на GitHub Pages: собирает сайт, ставит префикс репозитория и выкладывает в ветку gh-pages.
set -e
cd "$(dirname "$0")/.."
npm run build
python3 tools/pages_base.py study-umbrella-site
touch _pages/.nojekyll
rm -rf /tmp/su-pages && git worktree add -f /tmp/su-pages gh-pages 2>/dev/null || git worktree add -f --orphan -b gh-pages /tmp/su-pages
find /tmp/su-pages -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R _pages/. /tmp/su-pages/
cd /tmp/su-pages && git add -A && (git commit -q -m "Демо сайта" || true) && git push -q -u origin gh-pages
cd - >/dev/null && git worktree remove --force /tmp/su-pages
echo "опубликовано: https://mednikovxx-ux.github.io/study-umbrella-site/"
