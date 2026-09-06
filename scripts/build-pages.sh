#!/usr/bin/env bash
set -e

REV="${1:-${GITHUB_SHA:-dev}}"
OUT="${2:-_site}"

rm -rf "$OUT"
mkdir -p "$OUT/vendor"
cp index.html v6.css v6-ux.css v6-theme.css v6-ui-kit.css v6-editor-premium.css v6-functional.css v6-*.mjs v5-*.mjs .nojekyll "$OUT/"

cp vendor/jszip-3.10.1.min.js vendor/JSZip-LICENSE.markdown "$OUT/vendor/"

sed -E -i "s#href=\"v6.css(\?[^\"]*)?\"#href=\"v6.css?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#href=\"v6-ux.css(\?[^\"]*)?\"#href=\"v6-ux.css?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#href=\"v6-theme.css(\?[^\"]*)?\"#href=\"v6-theme.css?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#href=\"v6-ui-kit.css(\?[^\"]*)?\"#href=\"v6-ui-kit.css?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#href=\"v6-editor-premium.css(\?[^\"]*)?\"#href=\"v6-editor-premium.css?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-app.mjs(\?[^\"]*)?\"#src=\"v6-app.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-ux.mjs(\?[^\"]*)?\"#src=\"v6-ux.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-editor-premium.mjs(\?[^\"]*)?\"#src=\"v6-editor-premium.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-site-languages.mjs(\?[^\"]*)?\"#src=\"v6-site-languages.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-responsive-preview.mjs(\?[^\"]*)?\"#src=\"v6-responsive-preview.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-functional-inspector.mjs(\?[^\"]*)?\"#src=\"v6-functional-inspector.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-premium-inspector.mjs(\?[^\"]*)?\"#src=\"v6-premium-inspector.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-premium-section-inspector.mjs(\?[^\"]*)?\"#src=\"v6-premium-section-inspector.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-reuse.mjs(\?[^\"]*)?\"#src=\"v6-reuse.mjs?v=${REV}\"#" "$OUT/index.html"

for f in "$OUT"/v5-*.mjs "$OUT"/v6-*.mjs; do
  sed -E -i "s#(from ['\"]\./(v5|v6)-[^'\"?]+\.mjs)(\?[^'\"]*)?(['\"])#\1?v=${REV}\4#g" "$f"
  sed -E -i "s#(import ['\"]\./(v5|v6)-[^'\"?]+\.mjs)(\?[^'\"]*)?(['\"])#\1?v=${REV}\4#g" "$f"
  sed -E -i "s#(import\(['\"]\./(v5|v6)-[^'\"?]+\.mjs)(\?[^'\"]*)?(['\"]\))#\1?v=${REV}\4#g" "$f"
done
