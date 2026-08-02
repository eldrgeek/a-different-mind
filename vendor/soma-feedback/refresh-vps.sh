#!/bin/sh
# refresh-vps.sh — push the canonical soma-feedback widget (JS+CSS) to the VPS.
#
# WQ-147 (2026-07-05): soma-feedback-svc now serves the widget files directly
# (added a static-file GET route in server.js next to /health and /feedback),
# so every site on the estate can point at ONE canonical URL:
#
#   https://vpsmikewolf.duckdns.org/feedback-svc/soma-feedback.js
#   https://vpsmikewolf.duckdns.org/feedback-svc/soma-feedback.css
#
# Future widget edits: edit the files in THIS directory (the canonical
# source), then run this script to copy them live. No site redeploy needed —
# every site loads the same URL, cached 5 minutes (Cache-Control: max-age=300).
#
# Usage: ./refresh-vps.sh
#
# Requires: ssh key at ~/.ssh/id_ed25519_vps (passwordless to dev@).
# Does NOT restart the pm2 process — static files are read fresh off disk on
# every request (no in-process caching in server.js), so no restart is
# needed for JS/CSS edits. If you edit server.js itself, restart with:
#   ssh -i ~/.ssh/id_ed25519_vps dev@vpsmikewolf.duckdns.org 'pm2 restart soma-feedback-svc'

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
HOST="dev@vpsmikewolf.duckdns.org"
KEY="$HOME/.ssh/id_ed25519_vps"
REMOTE_DIR="/opt/soma-feedback-svc"

echo "Copying soma-feedback.js + soma-feedback.css -> $HOST:$REMOTE_DIR/"
scp -i "$KEY" "$DIR/soma-feedback.js" "$DIR/soma-feedback.css" "$HOST:$REMOTE_DIR/"

echo "Verifying live URLs..."
JS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://vpsmikewolf.duckdns.org/feedback-svc/soma-feedback.js)
CSS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://vpsmikewolf.duckdns.org/feedback-svc/soma-feedback.css)

echo "  soma-feedback.js  -> HTTP $JS_CODE"
echo "  soma-feedback.css -> HTTP $CSS_CODE"

if [ "$JS_CODE" = "200" ] && [ "$CSS_CODE" = "200" ]; then
  echo "OK — widget live for all sites (cache expires within 5 min)."
else
  echo "WARNING — one or both URLs did not return 200. Check server.js static route and pm2 status." >&2
  exit 1
fi
