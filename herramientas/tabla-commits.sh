#!/bin/bash
# Regenera la tabla de commits dentro del README, entre las marcas.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

README="README.md"
META="herramientas/commits-meta.tsv"
INICIO="<!-- INICIO TABLA COMMITS -->"
FIN="<!-- FIN TABLA COMMITS -->"
SEP=$'\037'
REG=$'\036'

TABLA="$(mktemp)"
trap 'rm -f "$TABLA"' EXIT

{
  echo "| # | Fecha | Hash | Mensaje | Sección | Cambio |"
  echo "|---|-------|------|---------|---------------------|------------------|"
  if git rev-parse HEAD >/dev/null 2>&1; then
    git log --reverse --date=short \
      --pretty=format:"%h%x1f%ad%x1f%s%x1f%(trailers:key=Seccion,valueonly,separator=%x2c%x20)%x1f%(trailers:key=Cambio,valueonly,separator=%x2c%x20)%x1e" \
      | tr -d '\n' | tr "$REG" '\n' \
      | awk -F "$SEP" -v meta="$META" '
          BEGIN {
            while ((getline linea < meta) > 0) {
              if (linea ~ /^#/ || linea == "") continue
              split(linea, col, "\t")
              sec[col[1]] = col[2]; cam[col[1]] = col[3]
            }
          }
          NF >= 3 {
            n++; h = $1; f = $2; m = $3; s = $4; c = $5
            if (s == "" && (h in sec)) s = sec[h]
            if (c == "" && (h in cam)) c = cam[h]
            if (s == "") s = "General"
            if (c == "") c = m
            gsub(/\|/, "\\|", m); gsub(/\|/, "\\|", s); gsub(/\|/, "\\|", c)
            print "| " n " | " f " | " h " | " m " | " s " | " c " |"
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