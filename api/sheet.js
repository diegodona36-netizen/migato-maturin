export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Falta el parámetro url de Google Sheets' });
  }

  try {
    const cleanUrl = decodeURIComponent(url);
    const matches = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!matches || !matches[1]) {
      return res.status(400).json({ error: 'URL de Google Sheets no válida' });
    }

    const sheetId = matches[1];
    const gidMatch = cleanUrl.match(/[#&?]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

    const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}`;
    
    const response = await fetch(gvizUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const csvText = await response.text();

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.status(200).send(csvText);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
