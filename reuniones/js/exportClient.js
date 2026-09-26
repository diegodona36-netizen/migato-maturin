/**
 * MIGATO AudioIntel - Servicio de Exportación y Sincronización
 * Genera Markdown para Obsidian, Minutas para WhatsApp y compila DOCX oficial (IUTIRLA)
 * directamente en el navegador con JSZip o a través del servidor local Python.
 */

class MeetingExportService {

  static escapeXml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  static generateMarkdown(data) {
    const partLinks = (data.participantes || []).map(p => {
      const clean = p.split('(')[0].trim();
      return `[[${clean}]]`;
    });

    const md = [
      "---",
      `title: "${data.titulo}"`,
      `date: ${data.fecha}`,
      `duration: "${data.duracion}"`,
      `location: "${data.lugar}"`,
      "tags:",
      "  - migato2026",
      "  - acta-reunion",
      "  - sala-situacional",
      "  - comando-regional",
      "---",
      "",
      `# 🏛️ ${data.titulo}`,
      `**Fecha:** \`${data.fecha}\` | **Duración:** \`${data.duracion}\` | **Sede:** \`${data.lugar}\``,
      `**Participantes:** ${partLinks.join(', ')}`,
      "",
      "---",
      "",
      "## 📌 1. Resumen Ejecutivo (BLUF)",
      data.resumen_ejecutivo || "Sin resumen disponible.",
      "",
      "## 💡 2. Matriz de Lluvia de Ideas y Propuestas",
      ...(data.lluvia_ideas || []).map((idea, idx) => `- **[Propuesta ${idx + 1}]:** ${idea}`),
      "",
      "## ⚖️ 3. Debate Dialéctico: Opiniones vs. Contraopiniones",
      ...(data.debates || []).map(d => `
### ⚔️ Eje: ${d.tema}
- **Propuesta / Opinión:** ${d.opinion}
- **Objeción / Contraopinión:** ${d.contraopinion}
- **Resolución Acordada:** *${d.resolucion}*
      `),
      "",
      "## 📋 4. Matriz de Acuerdos y Compromisos Adquiridos",
      "| Compromiso / Tarea | Responsable | Plazo | Estado |",
      "| :--- | :--- | :--- | :--- |",
      ...(data.acuerdos || []).map(a => `| ${a.tarea} | **[[${a.responsable}]]** | \`${a.plazo}\` | \`${a.estado}\` |`),
      "",
      "## ⏳ 5. Puntos Pendientes para la Próxima Sesión",
      ...(data.pendientes || []).map(p => `- ⚠️ ${p}`),
      "",
      "---",
      "### 🔗 Enlaces Relacionales del Grafo (Word Tree)",
      "- [[00-Indice-General]]",
      "- [[Modulo Comandos Territoriales]]",
      "- [[Modulo Sala Situacional]]",
      "- [[Modulo Centros Electorales y Padron CNE]]"
    ];
    return md.join("\n");
  }

  static generateWhatsAppText(data) {
    const lines = [
      `🏛️ *MIGATO • MINUTA EJECUTIVA DE REUNIÓN*`,
      `📅 *Fecha:* ${data.fecha} | ⏱️ *Duración:* ${data.duracion}`,
      `📍 *Asunto:* ${data.titulo}`,
      "",
      `📌 *RESUMEN ESTRATÉGICO:*`,
      `${data.resumen_ejecutivo}`,
      "",
      `⚖️ *DEBATES Y DEFINICIONES:*`,
      ...(data.debates || []).map(d => `• *${d.tema}:* ${d.resolucion}`),
      "",
      `✅ *COMPROMISOS ASIGNADOS:*`,
      ...(data.acuerdos || []).map(a => `• *${a.responsable}:* ${a.tarea} (Plazo: ${a.plazo})`),
      "",
      `🔒 _Documento foliado en Bóveda Obsidian y Acta DOCX oficial disponible._`
    ];
    return lines.join("\n");
  }

  static downloadFile(content, filename, type = "text/plain") {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  static async copyWhatsAppToClipboard(data) {
    const text = this.generateWhatsAppText(data);
    await navigator.clipboard.writeText(text);
    return text;
  }

  static downloadMarkdown(data) {
    const md = this.generateMarkdown(data);
    const filename = `Acta_${data.fecha}_MIGATO.md`;
    this.downloadFile(md, filename, "text/markdown");
  }

  /**
   * Genera el archivo .docx nativo OpenXML en el navegador usando JSZip
   * Cumpliendo con el estándar tipográfico y estructural oficial IUTIRLA / MIGATO.
   */
  static async generateDocxBlob(data) {
    if (typeof JSZip === "undefined") {
      throw new Error("La biblioteca JSZip no está cargada en la página.");
    }

    const esc = this.escapeXml;
    const titulo = data.titulo || "Acta Oficial de Reunión de Mando";
    const fecha = data.fecha || new Date().toISOString().split("T")[0];
    const duracion = data.duracion || "02:00:00";
    const lugar = data.lugar || "Central de Mando MIGATO, Maturín";
    const participantes = data.participantes || ["José Gregorio El Gato Briceño", "Ing. Diego Donado"];
    const resumen = data.resumen_ejecutivo || "Sin resumen disponible.";
    const ideas = data.lluvia_ideas || [];
    const debates = data.debates || [];
    const acuerdos = data.acuerdos || [];
    const pendientes = data.pendientes || [];

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:sz w:val="23"/>
        <w:szCs w:val="23"/>
        <w:color w:val="000000"/>
        <w:lang w:val="es-VE"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="280" w:lineRule="auto" w:before="0" w:after="140"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>`;

    const headerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:pStyle w:val="Header"/>
      <w:jc w:val="right"/>
      <w:spacing w:after="100"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="17"/>
        <w:color w:val="555555"/>
        <w:i/>
      </w:rPr>
      <w:t>COMANDO REGIONAL MIGATO • ACTA OFICIAL DE SALA SITUACIONAL</w:t>
    </w:r>
  </w:p>
</w:hdr>`;

    const footerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:pStyle w:val="Footer"/>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="18"/>
        <w:color w:val="666666"/>
      </w:rPr>
      <w:t xml:space="preserve">Página </w:t>
    </w:r>
    <w:fldSimple w:instr="PAGE"/>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="18"/>
        <w:color w:val="666666"/>
      </w:rPr>
      <w:t xml:space="preserve"> de </w:t>
    </w:r>
    <w:fldSimple w:instr="NUMPAGES"/>
  </w:p>
</w:ftr>`;

    const bodyParts = [];

    // Cintillo Institucional
    const cintillo = [
      "REPÚBLICA DE VENEZUELA",
      "ESTADO MONAGAS • SALA SITUACIONAL Y CENTRAL DE MANDO",
      "MOVIMIENTO INDEPENDIENTE GANAMOS TODOS (MIGATO)"
    ];
    for (const c of cintillo) {
      bodyParts.push(`
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="40" w:line="240" w:lineRule="auto"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="21"/></w:rPr><w:t>${esc(c)}</w:t></w:r>
    </w:p>`);
    }

    // Título Principal
    bodyParts.push(`
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="160"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1e1554"/></w:rPr><w:t>${esc(titulo.toUpperCase())}</w:t></w:r>
    </w:p>`);

    // Ficha Técnica
    bodyParts.push(`
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="120" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>1. FICHA TÉCNICA Y CONTEXTO OPERATIVO</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:firstLine="567"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Fecha: </w:t></w:r><w:r><w:t xml:space="preserve">${esc(fecha)}   |   </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Duración de Grabación: </w:t></w:r><w:r><w:t xml:space="preserve">${esc(duracion)}   |   </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Sede / Jurisdicción: </w:t></w:r><w:r><w:t>${esc(lugar)}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:firstLine="567"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Asistentes / Vocería: </w:t></w:r><w:r><w:t>${esc(participantes.join(", "))}</w:t></w:r>
    </w:p>`);

    // Resumen BLUF
    bodyParts.push(`
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="180" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>2. RESUMEN EJECUTIVO (BLUF)</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:firstLine="567"/></w:pPr>
      <w:r><w:t>${esc(resumen)}</w:t></w:r>
    </w:p>`);

    // Lluvia de Ideas
    if (ideas.length > 0) {
      bodyParts.push(`
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="180" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>3. MATRIZ DE LLUVIA DE IDEAS Y PROPUESTAS</w:t></w:r>
    </w:p>`);
      ideas.forEach((idea, idx) => {
        bodyParts.push(`
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:left="400" w:hanging="400"/><w:spacing w:after="60"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">• [${idx + 1}] </w:t></w:r><w:r><w:t>${esc(idea)}</w:t></w:r>
    </w:p>`);
      });
    }

    // Debates
    if (debates.length > 0) {
      bodyParts.push(`
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="180" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>4. DEBATE DIALÉCTICO: OPINIONES VS. CONTRAOPINIONES</w:t></w:r>
    </w:p>`);
      for (const d of debates) {
        bodyParts.push(`
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="100" w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:u w:val="single"/></w:rPr><w:t>Eje: ${esc(d.tema || "Tema en debate")}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:left="400"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:color w:val="059669"/></w:rPr><w:t xml:space="preserve">Propuesta / Argumento A Favor: </w:t></w:r>
      <w:r><w:t>${esc(d.opinion || "")}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:left="400"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/><w:color w:val="dc2626"/></w:rPr><w:t xml:space="preserve">Objeción / Contraopinión: </w:t></w:r>
      <w:r><w:t>${esc(d.contraopinion || "")}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:left="400"/><w:spacing w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:color w:val="1e1554"/></w:rPr><w:t xml:space="preserve">Resolución de Mando: </w:t></w:r>
      <w:r><w:i/><w:t>${esc(d.resolucion || "")}</w:t></w:r>
    </w:p>`);
      }
    }

    // Tabla de Acuerdos
    if (acuerdos.length > 0) {
      bodyParts.push(`
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="180" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>5. MATRIZ DE ACUERDOS Y COMPROMISOS ADQUIRIDOS</w:t></w:r>
    </w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9360" w:type="dxa"/>
        <w:jc w:val="center"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:left w:val="none"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:right w:val="none"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
          <w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:trPr><w:tblHeader/></w:trPr>
        <w:tc><w:tcPr><w:tcW w:w="4200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EAEAEA"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>TAREA / COMPROMISO</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="2600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EAEAEA"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>RESPONSABLE</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="1400" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EAEAEA"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>PLAZO</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="1160" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="EAEAEA"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>ESTADO</w:t></w:r></w:p>
        </w:tc>
      </w:tr>`);
      for (const a of acuerdos) {
        bodyParts.push(`
      <w:tr>
        <w:tc><w:tcPr><w:tcW w:w="4200" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="30"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>${esc(a.tarea || "")}</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="2600" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="30"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>${esc(a.responsable || "")}</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="1400" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="30"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>${esc(a.plazo || "")}</w:t></w:r></w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="1160" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="30"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>${esc(a.estado || "Aprobado")}</w:t></w:r></w:p>
        </w:tc>
      </w:tr>`);
      }
      bodyParts.push(`</w:tbl>`);
    }

    // Puntos Pendientes
    if (pendientes.length > 0) {
      bodyParts.push(`
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:spacing w:before="180" w:after="80"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e1554"/></w:rPr><w:t>6. PUNTOS PENDIENTES PARA LA PRÓXIMA SESIÓN</w:t></w:r>
    </w:p>`);
      for (const p of pendientes) {
        bodyParts.push(`
    <w:p>
      <w:pPr><w:jc w:val="both"/><w:ind w:left="400" w:hanging="400"/><w:spacing w:after="40"/></w:pPr>
      <w:r><w:rPr><w:b/></w:rPr><w:t>▪ </w:t></w:r><w:r><w:t>${esc(p)}</w:t></w:r>
    </w:p>`);
      }
    }

    // Bloque de Firmas Formal MIGATO
    bodyParts.push(`
    <w:p><w:pPr><w:spacing w:before="360" w:after="100"/></w:pPr></w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9360" w:type="dxa"/>
        <w:jc w:val="center"/>
        <w:tblBorders>
          <w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/>
          <w:insideH w:val="none"/><w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc><w:tcPr><w:tcW w:w="4680" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:t>_____________________________________</w:t></w:r>
          </w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="19"/></w:rPr><w:t>JOSÉ GREGORIO BRICEÑO</w:t></w:r>
          </w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="17"/><w:color w:val="555555"/></w:rPr><w:t>Líder Regional MIGATO • Gobernación 2026</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="4680" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:t>_____________________________________</w:t></w:r>
          </w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:rPr><w:b/><w:sz w:val="19"/></w:rPr><w:t>ING. DIEGO DONADO</w:t></w:r>
          </w:p>
          <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="17"/><w:color w:val="555555"/></w:rPr><w:t>Resp. Ciencia, Tecnología y Ciberdefensa</w:t></w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>`);

    const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyParts.join("")}
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rIdHeader1"/>
      <w:footerReference w:type="default" r:id="rIdFooter1"/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;

    const zip = new JSZip();
    zip.file("[Content_Types].xml", contentTypes);
    zip.file("_rels/.rels", rels);
    zip.file("word/_rels/document.xml.rels", docRels);
    zip.file("word/styles.xml", stylesXml);
    zip.file("word/header1.xml", headerXml);
    zip.file("word/footer1.xml", footerXml);
    zip.file("word/document.xml", docXml);

    return await zip.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
  }

  static async downloadDocx(data) {
    // 1. Intento con el servidor local Python si está activo
    try {
      const resp = await fetch("http://127.0.0.1:8090/api/build-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        const blob = await resp.blob();
        this.downloadFile(blob, `Acta_${data.fecha}_MIGATO.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        return true;
      }
    } catch (e) {
      console.log("Servidor local 8090 no disponible, generando DOCX nativamente en navegador con JSZip...");
    }

    // 2. Generación nativa en navegador con JSZip
    try {
      const blob = await this.generateDocxBlob(data);
      this.downloadFile(blob, `Acta_${data.fecha}_MIGATO.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      return true;
    } catch (err) {
      console.error("Error generando DOCX en navegador:", err);
      // Fallback a Markdown de seguridad
      this.downloadMarkdown(data);
      throw err;
    }
  }

  static async saveToObsidianVault(data) {
    // Intenta enviar al endpoint del servidor local
    const endpoints = [
      "http://127.0.0.1:8090/api/save-acta",
      "/api/save-acta"
    ];

    for (const url of endpoints) {
      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (resp.ok) {
          const res = await resp.json();
          return { success: true, localServer: true, data: res };
        }
      } catch (e) {
        // siguiente endpoint
      }
    }

    // Fallback: descarga directa en el navegador
    this.downloadMarkdown(data);
    return { success: true, localServer: false };
  }
}

window.MeetingExportService = MeetingExportService;
