#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/resize-dino-pixel-art.sh [options]

Resize dino pixel-art PNGs so matching files share the same canvas size as
the reference set. By default, dino-idle is treated as the source of truth and
every matching file in the other mood folders is resized with nearest-neighbor
sampling and centered on a transparent canvas.

Options:
  --reference-dir PATH   Directory with the reference sprites.
                         Default: src/mainview/public/assets/dino/dino-idle
  --target-root PATH     Root dino asset directory.
                         Default: src/mainview/public/assets/dino
  --moods LIST           Comma-separated mood directories to update.
                         Default: every folder in target-root except reference-dir
  --dry-run              Print the work that would be done without changing files.
  -h, --help             Show this help text.
EOF
}

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

reference_dir="${repo_root}/src/mainview/public/assets/dino/dino-idle"
target_root="${repo_root}/src/mainview/public/assets/dino"
dry_run=0
moods_csv=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --reference-dir)
      reference_dir="$2"
      shift 2
      ;;
    --target-root)
      target_root="$2"
      shift 2
      ;;
    --moods)
      moods_csv="$2"
      shift 2
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick 'magick' command not found." >&2
  exit 1
fi

if [[ ! -d "$reference_dir" ]]; then
  echo "Reference directory not found: $reference_dir" >&2
  exit 1
fi

if [[ ! -d "$target_root" ]]; then
  echo "Target root not found: $target_root" >&2
  exit 1
fi

reference_name="$(basename "$reference_dir")"
declare -a mood_dirs=()

if [[ -n "$moods_csv" ]]; then
  IFS=',' read -r -a mood_names <<<"$moods_csv"
  for mood_name in "${mood_names[@]}"; do
    mood_dir="${target_root}/${mood_name}"
    if [[ ! -d "$mood_dir" ]]; then
      echo "Mood directory not found: $mood_dir" >&2
      exit 1
    fi
    mood_dirs+=("$mood_dir")
  done
else
  while IFS= read -r mood_dir; do
    if [[ "$(basename "$mood_dir")" != "$reference_name" ]]; then
      mood_dirs+=("$mood_dir")
    fi
  done < <(find "$target_root" -mindepth 1 -maxdepth 1 -type d | sort)
fi

if [[ ${#mood_dirs[@]} -eq 0 ]]; then
  echo "No target mood directories found." >&2
  exit 1
fi

shopt -s nullglob
reference_files=("$reference_dir"/*.png)
shopt -u nullglob

if [[ ${#reference_files[@]} -eq 0 ]]; then
  echo "No PNG files found in reference directory: $reference_dir" >&2
  exit 1
fi

processed=0
skipped=0

for reference_file in "${reference_files[@]}"; do
  filename="$(basename "$reference_file")"
  size_output="$(magick identify -format '%w %h' "$reference_file")"
  read -r target_width target_height <<<"$size_output"

  for mood_dir in "${mood_dirs[@]}"; do
    source_file="${mood_dir}/${filename}"

    if [[ ! -f "$source_file" ]]; then
      echo "Skipping missing file: ${source_file#$repo_root/}"
      skipped=$((skipped + 1))
      continue
    fi

    relative_source="${source_file#$repo_root/}"
    action="Resize ${relative_source} -> ${target_width}x${target_height}"

    if [[ $dry_run -eq 1 ]]; then
      echo "$action"
      processed=$((processed + 1))
      continue
    fi

    tmp_file="$(mktemp "${TMPDIR:-/tmp}/dino-resize.XXXXXX.png")"

    magick "$source_file" \
      -alpha on \
      -filter point \
      -resize "${target_width}x${target_height}>" \
      -gravity center \
      -background none \
      -extent "${target_width}x${target_height}" \
      "$tmp_file"

    mv "$tmp_file" "$source_file"
    echo "$action"
    processed=$((processed + 1))
  done
done

echo "Processed ${processed} file(s); skipped ${skipped} missing match(es)."
