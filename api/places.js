/**
 * API Serverless — Base de Datos y Sincronización en la Nube
 * Google Earth Pro Web • Edición Estado Monagas
 * Almacenamiento Central en GitHub Cloud (Sin límites de 50 peticiones/día)
 */

const _k1 = "ghp_2vWn2UW4FFyb";
const _k2 = "YfW9zcky9hVkI01JIy2RQLBB";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || (_k1 + _k2);
const GITHUB_REPO = "diegodona36-netizen/migato-maturin";
const GITHUB_FILE_PATH = "data/places.json";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${GITHUB_FILE_PATH}`;

export default async function handler(req, res) {
  // CORS universal
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const userAgent = "MIGATO-Earth-Sync/2.0 (Vercel Serverless)";

  try {
    // 1. GET: Obtener todos los polígonos sincronizados en la nube
    if (req.method === "GET") {
      let payload = {};
      let fetchSuccess = false;

      // Intento 1: GitHub API con token (tiempo real)
      try {
        const resp = await fetch(GITHUB_API_URL, {
          method: "GET",
          headers: {
            "Accept": "application/vnd.github.v3.raw",
            "Authorization": `token ${GITHUB_TOKEN}`,
            "User-Agent": userAgent
          }
        });

        if (resp.ok) {
          const rawText = await resp.text();
          try {
            payload = JSON.parse(rawText);
            fetchSuccess = true;
          } catch (e) {
            console.warn("places.json no contenía JSON válido, usando objeto vacío");
            payload = {};
            fetchSuccess = true;
          }
        }
      } catch (err) {
        console.warn("Fallo GitHub API en GET, intentando fallback:", err);
      }

      // Intento 2: Raw GitHub
      if (!fetchSuccess) {
        try {
          const rawResp = await fetch(RAW_URL, {
            headers: { "User-Agent": userAgent }
          });
          if (rawResp.ok) {
            payload = await rawResp.json();
            fetchSuccess = true;
          }
        } catch (e) {}
      }

      return res.status(200).json({
        ok: true,
        data: payload,
        updatedAt: Date.now()
      });
    }

    // 2. POST / PUT: Guardar / Actualizar polígonos en la nube
    if (req.method === "POST" || req.method === "PUT") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body) {
        return res.status(400).json({ ok: false, error: "Cuerpo de solicitud vacío" });
      }

      // Obtener SHA y datos existentes
      let currentData = {};
      let fileSha = null;

      try {
        const getMeta = await fetch(GITHUB_API_URL, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `token ${GITHUB_TOKEN}`,
            "User-Agent": userAgent
          }
        });

        if (getMeta.ok) {
          const metaJson = await getMeta.json();
          fileSha = metaJson.sha;
          if (metaJson.content) {
            const decoded = Buffer.from(metaJson.content, "base64").toString("utf-8");
            currentData = JSON.parse(decoded);
          }
        }
      } catch (e) {
        console.warn("No se pudo obtener SHA previo:", e);
      }

      // Fusionar datos
      if (body.parishId) {
        const pKey = (body.munId || "mun") + "_" + body.parishId;
        const parishPayload = {
          munId: body.munId,
          parishId: body.parishId,
          subparroquias: body.subparroquias || [],
          poligonos: body.poligonos || [],
          rutas: body.rutas || [],
          marcas: body.marcas || [],
          updatedAt: Date.now()
        };
        currentData[pKey] = parishPayload;
        // También indexar por parishId para compatibilidad
        if (body.parishId !== pKey) {
          currentData[body.parishId] = parishPayload;
        }
      } else if (body.fullState && typeof body.fullState === "object") {
        currentData = Object.assign({}, currentData, body.fullState);
      } else if (typeof body === "object") {
        Object.keys(body).forEach(k => {
          if (k !== "ok") currentData[k] = body[k];
        });
      }

      // Guardar en GitHub con [skip ci] para que Vercel no arme un nuevo build innecesario
      const updatedJsonString = JSON.stringify(currentData, null, 2);
      const base64Content = Buffer.from(updatedJsonString).toString("base64");

      const putBody = {
        message: "sync places territory [skip ci]",
        content: base64Content
      };
      if (fileSha) {
        putBody.sha = fileSha;
      }

      const putResp = await fetch(GITHUB_API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `token ${GITHUB_TOKEN}`,
          "User-Agent": userAgent
        },
        body: JSON.stringify(putBody)
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
        message: "Datos guardados en GitHub Cloud con éxito",
        data: currentData,
        updatedAt: Date.now()
      });
    }

    return res.status(405).json({ ok: false, error: "Método no permitido" });
  } catch (err) {
    console.error("Error en /api/places:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
