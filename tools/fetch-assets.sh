#!/usr/bin/env bash
# Downloads generated media listed in tools/assets-manifest.json into the repo
# and optimizes it (resize + recompress). Designed to run on a GitHub Actions
# runner, which has unrestricted network + ImageMagick + ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."

MANIFEST="tools/assets-manifest.json"
COUNT=$(jq length "$MANIFEST")
CHANGED=0

for i in $(seq 0 $((COUNT - 1))); do
  TYPE=$(jq -r ".[$i].type" "$MANIFEST")
  URL=$(jq -r ".[$i].url" "$MANIFEST")
  DEST=$(jq -r ".[$i].dest" "$MANIFEST")
  WIDTH=$(jq -r ".[$i].width // 1600" "$MANIFEST")

  if [ -s "$DEST" ]; then
    echo "skip (exists): $DEST"
    continue
  fi

  mkdir -p "$(dirname "$DEST")"
  TMP=$(mktemp --suffix=".src")
  echo "fetch: $URL"
  curl -fsSL --retry 3 -o "$TMP" "$URL"

  case "$TYPE" in
    image)
      ffmpeg -y -loglevel error -i "$TMP" \
        -vf "scale='min(${WIDTH},iw)':-2" -q:v 3 "$DEST"
      ;;
    video)
      ffmpeg -y -loglevel error -i "$TMP" -an -c:v libx264 -crf 23 -preset slow \
        -vf "scale='min(1920,iw)':-2" -movflags +faststart "$DEST"
      ;;
    *)
      cp "$TMP" "$DEST"
      ;;
  esac
  rm -f "$TMP"
  echo "wrote: $DEST ($(du -h "$DEST" | cut -f1))"
  CHANGED=1
done

echo "changed=$CHANGED" >> "${GITHUB_OUTPUT:-/dev/null}" 2>/dev/null || true
