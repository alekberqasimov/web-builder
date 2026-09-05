#!/usr/bin/env bash
set -e

REV="${1:-${GITHUB_SHA:-dev}}"
OUT="${2:-_site}"

rm -rf "$OUT"
mkdir -p "$OUT"
cp index.html v6.css v6-ux.css v6-theme.css v6-ui-kit.css v6-functional.css v6-*.mjs v5-*.mjs .nojekyll "$OUT/"

sed -E -i "s#href=\"v6.css(\?[^\"]*)?\"#href=\"v6.css?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#href=\"v6-ux.css(\?[^\"]*)?\"#href=\"v6-ux.css?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#href=\"v6-theme.css(\?[^\"]*)?\"#href=\"v6-theme.css?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#href=\"v6-ui-kit.css(\?[^\"]*)?\"#href=\"v6-ui-kit.css?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-app.mjs(\?[^\"]*)?\"#src=\"v6-app.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-ux.mjs(\?[^\"]*)?\"#src=\"v6-ux.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-site-languages.mjs(\?[^\"]*)?\"#src=\"v6-site-languages.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-responsive-preview.mjs(\?[^\"]*)?\"#src=\"v6-responsive-preview.mjs?v=${REV}\"#" "$OUT/index.html"
sed -E -i "s#src=\"v6-functional-inspector.mjs(\?[^\"]*)?\"#src=\"v6-functional-inspector.mjs?v=${REV}\"#" "$OUT/index.html"

for f in "$OUT"/v5-*.mjs "$OUT"/v6-*.mjs; do
  # Static ES-module imports must share one version identity.
  sed -E -i "s#(from ['\"]\./(v5|v6)-[^'\"?]+\.mjs)(\?[^'\"]*)?(['\"])#\1?v=${REV}\4#g" "$f"
  # Dynamic imports need the same cache key, otherwise browsers can load a stale
  # module or instantiate stateful modules a second time under a different URL.
  sed -E -i "s#(import\(['\"]\./(v5|v6)-[^'\"?]+\.mjs)(\?[^'\"]*)?(['\"]\))#\1?v=${REV}\4#g" "$f"
done
