#!/bin/bash
# Regenera la tabla de commits dentro del README, entre las marcas.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

README="README.md"
INICIO="<!-- INICIO TABLA COMMITS -->"
FIN="<!-- FIN TABLA COMMITS -->"

TABLA="$(mktemp)"
trap 'rm -f "$TABLA"' EXIT

{
  echo "| # | Fecha | Hash | Mensaje |"
  echo "|---|-------|------|---------|"
  if git rev-parse HEAD >/dev/null 2>&1; then
    git log --reverse --date=short --pretty=format:"%ad|%h|%s" \
      | nl -w1 -s'|' \
      | awk -F'|' '{
          msg = $4
          for (i = 5; i <= NF; i++) msg = msg "\\|" $i
          print "| " $1 " | " $2 " | " $3 " | " msg " |"
        }'
  fi
  echo
} > "$TABLA"

if ! grep -qF "$INICIO" "$README" || ! grep -qF "$FIN" "$README"; then
  echo "Error: no encontré las marcas de la tabla en $README" >&2
  exit 1
fi

awk -v inicio="$INICIO" -v fin="$FIN" -v tabla="$TABLA" '
  $0 == inicio { print; while ((getline linea < tabla) > 0) print linea; dentro = 1; next }
  $0 == fin    { dentro = 0 }
  !dentro      { print }
' "$README" > "$README.nuevo"

mv "$README.nuevo" "$README"
echo "Tabla actualizada."
