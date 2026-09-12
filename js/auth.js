/**
 * MIGATO - Módulo de Autenticación y Control de Acceso por Roles (RBAC)
 * Gestión de sesión, niveles de permiso y distintivo de usuario institucional.
 */

const MIGATO_AUTH = (function() {
  const ROLES = {
    gobernador: {
      id: "gobernador",
      title: "Comando de Dirección Regional",
      level: "Máxima Autoridad MIGATO",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      dotColor: "bg-amber-400",
      permissions: ["read_all", "executive_dashboard", "approve_orders", "module_4_3d_map", "certify_regional", "export_reports"]
    },
    municipal: {
      id: "municipal",
      title: "Comando Municipal (13 Municipios)",
      level: "Auditoría Territorial",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      dotColor: "bg-blue-400",
      permissions: ["read_municipality", "audit_parishes", "prevalidate_municipality"]
    },
    parroquial: {
      id: "parroquial",
      title: "Comando Parroquial (44 Parroquias)",
      level: "Enlace y Carga de Campo",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      dotColor: "bg-teal-400",
      permissions: ["read_parish", "send_whatsapp_data", "view_parish_counter"]
    },
    sala: {
      id: "sala",
      title: "Sala Situacional y Monitoreo",
      level: "Operador de Despacho",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      dotColor: "bg-indigo-400",
      permissions: ["read_services", "manage_alerts", "dispatch_works", "module_4_3d_map"]
    },
    censista: {
      id: "censista",
      title: "Equipo Territorial de Campo",
      level: "Levantamiento Sectorial",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      dotColor: "bg-emerald-400",
      permissions: ["census_register", "offline_sync"]
    },
    admin: {
      id: "admin",
      title: "Dirección de Tecnologías",
      level: "Administrador General",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      dotColor: "bg-purple-400",
      permissions: ["full_access", "manage_users", "export_backups", "module_4_3d_map"]
    }
  };

  const STORAGE_KEY = "migato_user_session";

  function getSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("[MIGATO Auth] Error leyendo sesión:", e);
    }
    // Sesión por defecto si no ha iniciado sesión
    return {
      userId: "usr-001",
      name: "Coordinador General MIGATO",
      role: "gobernador",
      loginTime: new Date().toISOString()
    };
  }

  function setSession(roleId, customName) {
    const roleDef = ROLES[roleId] || ROLES.gobernador;
    const session = {
      userId: "usr-" + Math.floor(1000 + Math.random() * 9000),
      name: customName || roleDef.title,
      role: roleId,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "login.html";
  }

  function renderUserBadge() {
    const session = getSession();
    const roleDef = ROLES[session.role] || ROLES.gobernador;
    
    // Buscar contenedor o inyectar flotante si no existe
    let badgeEl = document.getElementById("migato-user-badge");
    if (!badgeEl) {
      badgeEl = document.createElement("div");
      badgeEl.id = "migato-user-badge";
      badgeEl.className = "fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-[#140e40]/95 backdrop-blur border border-[#2d1f85] rounded-full px-4 py-2 shadow-2xl text-xs font-medium text-slate-200";
      document.body.appendChild(badgeEl);
    }

    badgeEl.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${roleDef.dotColor} opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 ${roleDef.dotColor}"></span>
        </span>
        <span class="text-slate-400 font-mono hidden sm:inline">${roleDef.level}:</span>
        <span class="font-semibold text-white">${session.name}</span>
      </div>
      <span class="px-2 py-0.5 rounded-full border text-[11px] ${roleDef.badgeColor}">
        ${roleDef.title}
      </span>
      <a href="login.html" title="Cambiar rol o usuario" class="text-slate-400 hover:text-white transition px-1.5 py-0.5 rounded hover:bg-slate-800">
        🔄 Cambiar
      </a>
    `;
  }

  function hasPermission(permissionName) {
    const session = getSession();
    const roleDef = ROLES[session.role] || ROLES.gobernador;
    return roleDef.permissions.includes(permissionName) || session.role === "admin" || session.role === "gobernador";
  }

  function canAccessModule(moduleNumber) {
    const session = getSession();
    const roleDef = ROLES[session.role] || ROLES.gobernador;
    // REGLA CRÍTICA: El Módulo 4 (Cartografía Satelital 3D y Polígonos) es exclusivo del Comando Regional / Partido
    if (Number(moduleNumber) === 4) {
      return session.role === "gobernador" || session.role === "admin" || session.role === "sala";
    }
    // Módulo 1, 2, 3 accesibles según jerarquía
    return true;
  }

  // Auto-iniciar al cargar el DOM
  if (typeof window !== "undefined") {
    document.addEventListener("DOMContentLoaded", renderUserBadge);
  }

  return {
    ROLES,
    getSession,
    setSession,
    logout,
    hasPermission,
    canAccessModule,
    renderUserBadge
  };
})();

window.MIGATO_AUTH = MIGATO_AUTH;
