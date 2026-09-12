# ==============================================================================
# PROYECTO MIGATO - DOCKERFILE DE PRODUCCIÓN (NGINX ALPINE)
# Servidor web ultra-rápido, ligero y securizado para el Estado Monagas
# ==============================================================================

FROM nginx:alpine

# Etiquetas de metadatos institucionales
LABEL maintainer="Gobernación del Estado Monagas <tecnologia@monagas.gob.ve>"
LABEL description="Plataforma de Inteligencia Territorial y Gobierno Digital MIGATO"
LABEL version="2.5.0-PROD"

# Configuración personalizada de Nginx para alto rendimiento
RUN rm -rf /etc/nginx/conf.d/*
COPY <<-'NGINX_CONF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html login.html;

    # Compresión Gzip para aceleración en redes móviles de Venezuela
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 256;

    # Encabezados de Seguridad Institucional
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caché eficiente para mapas y datos geográficos
    location ~* \.(kml|geojson|json|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
NGINX_CONF

# Copiar todo el sistema MIGATO al contenedor
COPY . /usr/share/nginx/html/

# Exponer puerto HTTP estándar
EXPOSE 80

# Comprobación de salud (Healthcheck)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
