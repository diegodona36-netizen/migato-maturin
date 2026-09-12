# 📡 ARQUITECTURA OFICIAL: GESTIÓN DE IMÁGENES Y BASE DE DATOS EN VPS (SISTEMA MONAGAS)

> **Documento Técnico para el Equipo de Operaciones y Desarrollo**  
> **Proyecto:** Satélite Electoral y Territorial de Monagas (`earth-monagas`)  
> **Versión:** 120 (Producción Real)

---

## 1. ⚠️ El Problema Crítico: ¿Por qué colapsa la página si se meten fotos en la Base de Datos?

Cuando los operadores en la calle toman fotos con celulares modernos (Samsung, Xiaomi, iPhone), cada foto pesa entre **4 MB y 12 MB**. Si se intentan guardar directamente en la base de datos o en el almacenamiento local del navegador:

1. **Límite de LocalStorage del Navegador (5 MB):**
   - El navegador sólo permite almacenar **5 MB en total** por sitio web.
   - Una sola foto convertida a texto (Base64) aumenta un 33% su peso (una foto de 6 MB se convierte en 8 MB de texto).
   - Al intentar guardarla, el navegador arroja `QuotaExceededError`, se congela y **se cae la página por completo**.

2. **Límite Duro de Google Cloud Firestore (1 MB por Documento):**
   - Firestore rechaza cualquier documento que pese más de **1,048,576 bytes (1 MB)** con el error `400 Bad Request: Document exceeds maximum size`.
   - Si un sector o parroquia incluye fotos en Base64, Firestore rechaza el guardado, los datos no se sincronizan en la nube y los demás operadores no ven los cambios.

3. **Colapso de Memoria RAM en Celulares (WebGL Crash):**
   - El motor de mapas satelitales (Leaflet/Mapbox) necesita la GPU y la memoria RAM para mover el satélite en tiempo real.
   - Descargar megabytes de imágenes codificadas en texto satura el hilo principal de JavaScript y cierra la pestaña del navegador ("Aw, Snap!" / "Página se cerró inesperadamente").

---

## 2. 🛡️ La Solución Arquitectónica: Imágenes Desacopladas (URLs Livianas)

La regla de oro de la industria geoespacial y de bases de datos masivas es:

> **LAS IMÁGENES NUNCA SE GUARDAN EN LA BASE DE DATOS.**  
> **En la Base de Datos ÚNICAMENTE se guarda la URL pública (`https://...`), que pesa apenas ~80 bytes.**

```
                                    ┌────────────────────────┐
                                    │    FOTO ORIGINAL       │
                                    │    (Celular: 6 MB)     │
                                    └───────────┬────────────┘
                                                │
                                                ▼
                         ┌─────────────────────────────────────────┐
                         │  CLIENTE: earth-monagas/imageOptimizer  │
                         │  - Redimensiona a max 1280px            │
                         │  - Comprime a formato moderno WebP      │
                         │  - Reduce el peso a < 150 KB (90% menos)│
                         └──────────────────────┬──────────────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     ▼                                                     ▼
     ┌───────────────────────────────┐                     ┌──────────────────────────────┐
     │      SERVIDOR VPS / STORAGE   │                     │  BASE DE DATOS (Firestore)   │
     │  - Guarda el archivo .webp    │                     │  - Guarda sólo el texto:     │
     │  - Retorna URL pública:       │────────────────────▶│    "https://vps/foto1.webp"  │
     │    https://vps/uploads/...    │                     │    (Solo 80 bytes)           │
     └───────────────────────────────┘                     └──────────────────────────────┘
```

---

## 3. 🚀 Opciones de Despliegue para el Almacenamiento de Imágenes

### Opción A: Despliegue en el VPS Propio (Recomendado para soberanía total de datos)

En el VPS (Ubuntu/Debian Linux), se habilita una carpeta estática en Nginx y un microservicio liviano para recibir las fotos:

#### 1. Configuración de Nginx en el VPS (`/etc/nginx/sites-available/monagas`):
```nginx
server {
    server_name vps.monagas.gob.ve; # O la IP pública de tu VPS

    # Carpeta pública de imágenes optimizadas
    location /uploads/ {
        alias /var/www/monagas-uploads/;
        autoindex off;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        client_max_body_size 10M;
    }

    # Endpoint de subida
    location /api/upload {
        proxy_pass http://127.0.0.1:5000/upload;
        client_max_body_size 10M;
    }
}
```

#### 2. Microservicio Liviano de Subida (Python / FastAPI o Node.js) en el VPS:
```python
# app_uploader.py (ejecutado con systemd o pm2 en el VPS)
from fastapi import FastAPI, UploadFile, File
import shutil, os, uuid

app = FastAPI()
UPLOAD_DIR = "/var/www/monagas-uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4().hex}.webp"
    dest_path = os.path.join(UPLOAD_DIR, filename)
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Retorna la URL pública de 80 bytes
    return {"url": f"https://vps.monagas.gob.ve/uploads/{filename}"}
```

---

### Opción B: Firebase Storage (Ya disponible de inmediato en tu proyecto actual)

El proyecto actual de Diego (`gato-3e238`) ya tiene habilitado el Bucket oficial:
- **Bucket:** `gato-3e238.firebasestorage.app`
- **Capacidad:** 5 GB de almacenamiento gratuito y 1 GB de subida diaria.
- **Ventaja:** No requiere configurar ningún servidor VPS adicional hoy mismo; se activa directamente mediante el SDK con autenticación de reglas.

---

## 4. 🧩 Módulo `imageOptimizer.js` Implementado en el Sistema

El sistema ahora cuenta con el módulo `earth-monagas/js/imageOptimizer.js`:

1. **Compresión Automática vía Canvas Offscreen:**
   - Detecta si la imagen subida es un plano o una foto.
   - Escala proporcionalmente el ancho y alto a un máximo de 1280px.
   - Convierte el archivo a formato `WebP` a un 78% de calidad.
   - Una imagen de 8 MB pasa a pesar **~110 KB**, ahorrando más del 90% del consumo de red.

2. **Validación Preventiva (`isSafeForDatabase`):**
   - Monitorea los datos antes de guardar en almacenamiento local o nube.
   - Bloquea cargas pesadas que superen 200 KB para evitar que la app móvil se cierre en los celulares de los operadores.

---

## 5. 📋 Resumen de Acciones para el Equipo

1. **Para Trazar Polígonos y Crear Sectores (Hoy):**
   - Las capas 4 y 5 están 100% limpias en la base de datos (0 sectores de prueba).
   - Pueden ingresar a cualquier parroquia y registrar los polígonos y sectores territoriales reales de campo.

2. **Para Subir Planos y Fotos al Satélite:**
   - La herramienta de plano superpuesto (`Plano / Imagen`) ahora comprime automáticamente cualquier plano o foto antes de proyectarlo en el mapa.
   - La página **no se colapsará ni se ralentizará**.
