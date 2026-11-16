#!/usr/bin/env bash
# Usage: tools/images.sh <old-site-dir> <portfolio-dir>
# Converts the old site's screenshots and portrait into WebP (800/1600/2400) + JPG fallback.
set -euo pipefail
SRC="$1"; OUT="$2/assets/img"
declare -A MAP=([allcare]=g-allcare [asklex]=g-asklex [marygrace]=g-marygrace [goldentopper]=g-goldentopper [mdlr]=g-mdlr [emmaus]=g-emmaus [ignite]=g-ignite [stepforward]=g-stepforward [janlink]=g-janlink [risktaker]=g-risktaker [souzoku]=g-souzoku-niigata)
for name in "${!MAP[@]}"; do
  in="$SRC/images/portfolio/gallery/${MAP[$name]}.jpg"
  for w in 800 1600 2400; do
    ffmpeg -loglevel error -y -i "$in" -vf "scale=${w}:-2:flags=lanczos" -c:v libwebp -quality 78 "$OUT/work/$name-$w.webp"
  done
  ffmpeg -loglevel error -y -i "$in" -vf "scale=1600:-2:flags=lanczos" -q:v 4 "$OUT/work/$name-1600.jpg"
done
for w in 600 1200; do
  ffmpeg -loglevel error -y -i "$SRC/images/about-photo@2x.png" -vf "scale=${w}:-2:flags=lanczos" -c:v libwebp -quality 80 "$OUT/ian-$w.webp"
done
ffmpeg -loglevel error -y -i "$SRC/images/about-photo@2x.png" -vf "scale=1200:-2:flags=lanczos" -q:v 4 "$OUT/ian-1200.jpg"
