#!/bin/sh
# 用法：sh scripts/package.sh
# 检查每个 skill 的 SKILL.md（name 与文件夹同名、有 description），再分别打成 dist/<name>.zip，用于上传到 agensi.io 等 skill 市场。
set -e
cd "$(dirname "$0")/.."
rm -rf dist && mkdir dist
for dir in skills/*/; do
  name=$(basename "$dir")
  file="$dir/SKILL.md"
  [ -f "$file" ] || { echo "✗ $name：缺 SKILL.md"; exit 1; }
  fm_name=$(awk '/^---$/{n++; next} n==1 && /^name:/{sub(/^name:[ ]*/, ""); print; exit}' "$file")
  [ "$fm_name" = "$name" ] || { echo "✗ $name：frontmatter 的 name 是「$fm_name」，要和文件夹同名"; exit 1; }
  awk '/^---$/{n++; next} n==1 && /^description:/{found=1} END{exit !found}' "$file" || { echo "✗ $name：缺 description"; exit 1; }
  (cd skills && zip -qr "../dist/$name.zip" "$name" -x '*.DS_Store')
  echo "✓ dist/$name.zip"
done
