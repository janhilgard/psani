#!/bin/bash
# Nasazení psani.hilgard.cz na server web (new-web). Spouští se jako root
# z adresáře, kam se nahrál obsah public/ (viz README níže v tomto souboru):
#   bash /home/hilgard/deploy-psani/deploy.sh
# Idempotentní: obnoví web root (atomická výměna), vhost a reloadne nginx.
# Certifikát vydá jen tehdy, když ještě neexistuje.
set -euo pipefail

DOMAIN=psani.hilgard.cz
EXPECTED_IP=142.132.172.27
SRC="$(cd "$(dirname "$0")" && pwd)/public"
WEBROOT=/var/www/$DOMAIN
CONF=/etc/nginx/sites-available/$DOMAIN
ENABLED=/etc/nginx/sites-enabled/$DOMAIN
LIVE=/etc/letsencrypt/live/$DOMAIN

[ "$(id -u)" -eq 0 ] || { echo "Spusť jako root." >&2; exit 1; }
[ -f "$SRC/index.html" ] || { echo "Chybí $SRC/index.html" >&2; exit 1; }

# --- 1) DNS
RESOLVED="$(getent ahostsv4 "$DOMAIN" | awk '{print $1; exit}')"
[ "$RESOLVED" = "$EXPECTED_IP" ] || { echo "DNS $DOMAIN -> '$RESOLVED', čekám $EXPECTED_IP." >&2; exit 1; }
echo "[1/4] DNS ok"

# --- 2) web root: připravit vedle, pak atomicky vyměnit; vlastník root, nginx jen čte
rm -rf "$WEBROOT.new"
cp -r "$SRC" "$WEBROOT.new"
chown -R root:root "$WEBROOT.new"
find "$WEBROOT.new" -type d -exec chmod 755 {} +
find "$WEBROOT.new" -type f -exec chmod 644 {} +
if [ -d "$WEBROOT" ]; then mv "$WEBROOT" "$WEBROOT.old"; fi
mv "$WEBROOT.new" "$WEBROOT"
rm -rf "$WEBROOT.old"
echo "[2/4] web root aktualizován ($(find "$WEBROOT" -type f | wc -l) souborů)"

# --- 3) certifikát (jen poprvé)
if [ ! -d "$LIVE" ]; then
  cat > "$CONF" <<'CONF'
server {
    listen 80;
    listen [::]:80;
    server_name psani.hilgard.cz;
    include /etc/nginx/snippets/block-next-action.conf;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$host$request_uri; }
}
CONF
  ln -sfn "$CONF" "$ENABLED"
  nginx -t && systemctl reload nginx
  certbot certonly --webroot -w /var/www/html -d "$DOMAIN" --non-interactive --agree-tos
fi
echo "[3/4] certifikát ok"

# --- 4) vhost
[ -f "$CONF" ] && cp -a "$CONF" "$CONF.bak"
cat > "$CONF" <<'CONF'
server {
    listen 80;
    listen [::]:80;
    server_name psani.hilgard.cz;
    include /etc/nginx/snippets/block-next-action.conf;

    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name psani.hilgard.cz;
    include /etc/nginx/snippets/block-next-action.conf;

    ssl_certificate     /etc/letsencrypt/live/psani.hilgard.cz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/psani.hilgard.cz/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    root  /var/www/psani.hilgard.cz;
    index index.html;

    # statický web — jiné metody než GET/HEAD nemají smysl
    if ($request_method !~ ^(GET|HEAD)$) { return 405; }

    # soubory nejsou verzované v názvu, proto vždy revalidace přes ETag
    add_header Cache-Control "no-cache" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    add_header Content-Security-Policy "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" always;

    # skryté soubory se neservírují
    location ~ /\. { deny all; }

    location / { try_files $uri $uri/ =404; }
}
CONF
ln -sfn "$CONF" "$ENABLED"
if ! nginx -t 2>/dev/null; then
  nginx -t || true
  echo "nginx -t selhal, vracím předchozí konfiguraci." >&2
  [ -f "$CONF.bak" ] && mv "$CONF.bak" "$CONF"
  exit 1
fi
systemctl reload nginx
echo "[4/4] vhost aktivní, nginx reloadnut"
curl -sSI --resolve "$DOMAIN:443:127.0.0.1" "https://$DOMAIN/" | grep -iE "^HTTP|content-security"
