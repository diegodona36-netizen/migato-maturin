/**
 * Sistema de Auditoría y Telemetría de Accesos • MIGATO Monagas
 * Registra ingresos, identidad de usuario, rol, IP pública, timestamp y trazabilidad operativa.
 */

export const AUDIT_STORAGE_KEY = "migato_audit_trail";

export class AuditLogger {
  constructor() {
    this.session = this.getActiveSession();
    this.clientIP = "Buscando IP...";
    this.initIP();
  }

  getActiveSession() {
    try {
      if (window.MIGATO_AUTH && typeof window.MIGATO_AUTH.getSession === "function") {
        return window.MIGATO_AUTH.getSession();
      }
      const raw = localStorage.getItem("migato_user_session");
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("[AuditLogger] Error leyendo sesión:", e);
    }

    return {
      userId: "usr-sala-01",
      name: "Operador Sala Situacional",
      role: "sala",
      loginTime: new Date().toISOString()
    };
  }

  async initIP() {
    try {
      // Consulta ultraligera a servicio público de IP
      const resp = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
      if (resp.ok) {
        const data = await resp.json();
        this.clientIP = data.ip || "127.0.0.1";
        this.updateUIBadge();
        this.logEvent("ACCESO_LAMINA_120", { ip: this.clientIP, level: "Nivel Inicial" });
      }
    } catch (e) {
      this.clientIP = "Red Local / Intranet";
      this.updateUIBadge();
    }
  }

  logEvent(action, meta = {}) {
    const entry = {
      id: "aud-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      localTime: new Date().toLocaleString("es-VE", { timeZone: "America/Caracas" }),
      userId: this.session.userId,
      userName: this.session.name,
      role: this.session.role,
      ip: this.clientIP,
      userAgent: navigator.userAgent,
      action,
      meta
    };

    try {
      const logs = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || "[]");
      logs.unshift(entry);
      // Mantener buffer de hasta 200 eventos en almacenamiento local
      if (logs.length > 200) logs.pop();
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn("[AuditLogger] Error guardando log local:", e);
    }

    // Disparar en consola para trazabilidad forense
    console.log(`%c[AUDIT MIGATO] %c${entry.localTime} | ${entry.userName} (${entry.role}) | IP: ${entry.ip} | Acción: ${action}`, 
      "background: #1e1b4b; color: #38bdf8; font-weight: bold; padding: 2px 4px;",
      "color: #0f172a; font-weight: 600;"
    );

    return entry;
  }

  updateUIBadge() {
    const badge = document.getElementById("session-audit-badge");
    if (badge) {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
        <span class="font-bold text-slate-800">${this.session.name}</span>
        <span class="text-slate-400">|</span>
        <span class="font-mono text-slate-500 text-xs">${this.clientIP}</span>
      `;
      badge.title = `Sesión iniciada: ${new Date(this.session.loginTime).toLocaleTimeString('es-VE')} • IP: ${this.clientIP}`;
    }
  }
}

export const auditLogger = new AuditLogger();
