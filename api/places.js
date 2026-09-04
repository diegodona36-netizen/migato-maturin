/**
 * API Serverless — Base de Datos y Sincronización en la Nube
 * Google Earth Pro Web • Edición Estado Monagas
 * Permite que lo que se trace en una computadora aparezca al instante en las demás.
 */

const CLOUD_DB_URL = "https://api.restful-api.dev/objects/ff808181a067127101a06ec2648014dc";

export default async function handler(req, res) {
  // Configuración de CORS universal
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MIGATO-Earth-Sync/1.0";

  try {
    // 1. GET: Obtener todos los polígonos y datos sincronizados en la nube
    if (req.method === "GET") {
      const resp = await fetch(CLOUD_DB_URL, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": userAgent
        }
      });

      if (!resp.ok) {
        return res.status(resp.status).json({
          ok: false,
          error: "Error leyendo base de datos en la nube",
          status: resp.status
        });
      }

      const json = await resp.json();
      const payload = json.data || {};

      return res.status(200).json({
        ok: true,
        data: payload,
        updatedAt: json.updatedAt || json.createdAt || Date.now()
      });
    }

    // 2. POST / PUT: Guardar / Actualizar polígonos en la nube
    if (req.method === "POST" || req.method === "PUT") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      if (!body) {
        return res.status(400).json({ ok: false, error: "Cuerpo de solicitud vacío" });
      }

      // Leer estado existente para fusionar sin borrar datos de otras parroquias
      let currentData = {};
      try {
        const getResp = await fetch(CLOUD_DB_URL, {
          method: "GET",
          headers: { "Accept": "application/json", "User-Agent": userAgent }
        });
        if (getResp.ok) {
          const curJson = await getResp.json();
          currentData = curJson.data || {};
        }
      } catch (e) {
        console.warn("No se pudo leer estado previo, creando nuevo:", e);
      }

      // Si envía por parroquia específica
      if (body.parishId) {
        const pKey = (body.munId || "mun") + "_" + body.parishId;
        currentData[pKey] = {
          munId: body.munId,
          parishId: body.parishId,
          subparroquias: body.subparroquias || [],
          poligonos: body.poligonos || [],
          rutas: body.rutas || [],
          marcas: body.marcas || [],
          updatedAt: Date.now()
        };
      } else if (body.fullState && typeof body.fullState === "object") {
        // Si envía estado completo
        currentData = Object.assign({}, currentData, body.fullState);
      } else if (typeof body === "object") {
        // Fusión genérica de claves
        Object.keys(body).forEach(k => {
          if (k !== "ok") currentData[k] = body[k];
        });
      }

      // Guardar en la base de datos cloud
      const putResp = await fetch(CLOUD_DB_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": userAgent
        },
        body: JSON.stringify({
          name: "earth_monagas_territorio_v1",
          data: currentData
        })
      });

      if (!putResp.ok) {
        const errTxt = await putResp.text();
        return res.status(putResp.status).json({
          ok: false,
          error: "Fallo al escribir en la nube",
          detail: errTxt
        });
      }

      const savedJson = await putResp.json();
      return res.status(200).json({
        ok: true,
        message: "Datos territoriales guardados con éxito en la red",
        updatedAt: savedJson.updatedAt || Date.now()
      });
    }

    return res.status(405).json({ ok: false, error: "Método no permitido" });
  } catch (err) {
    console.error("Error en /api/places:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
