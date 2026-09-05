#!/usr/bin/env bash
set -e

echo "=================================================="
echo "   Instalador Automático MIGATO Monagas en VPS"
echo "=================================================="

# 1. Actualizar sistema e instalar Nginx y Git
echo "📦 Actualizando paquetes e instalando Nginx y Git..."
sudo apt-get update -y
sudo apt-get install -y nginx git curl

# 2. Configurar directorio web
WEB_DIR="/var/www/migato-maturin"
echo "📂 Descargando código de MIGATO en $WEB_DIR..."
if [ -d "$WEB_DIR" ]; then
  cd "$WEB_DIR"
  sudo git pull origin main
else
  sudo git clone https://github.com/diegodona36-netizen/migato-maturin.git "$WEB_DIR"
fi

# Ajustar permisos
sudo chown -R www-data:www-data "$WEB_DIR"
sudo chmod -R 755 "$WEB_DIR"

# 3. Configurar Nginx con compresión GZIP y sin caché congelado
echo "⚙️ Configurando Nginx para alta velocidad..."
sudo tee /etc/nginx/sites-available/migato > /dev/null << 'NGINX_CONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/migato-maturin;
    index index.html index.htm;

    server_name _;

    # Compresión gzip para carga ultra rápida
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ =404;
        # Evitar caché congelado para que los cambios se vean de inmediato
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
NGINX_CONF

# Habilitar sitio Nginx
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/migato /etc/nginx/sites-enabled/migato
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 4. Configurar firewall
sudo ufw allow 80/tcp || true
sudo ufw allow 443/tcp || true
sudo ufw allow 22/tcp || true

echo ""
echo "=================================================="
echo "🎉 ¡Instalación Completada con Éxito!"
IP=$(curl -s http://checkip.amazonaws.com || hostname -I 2>/dev/null | awk '{print $1}')
echo "Tu visor ya está en vivo en internet en:"
echo "👉 http://$IP/earth-monagas/"
echo "=================================================="
