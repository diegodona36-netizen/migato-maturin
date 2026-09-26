/**
 * MIGATO - Módulo de Autenticación, Blindaje de Sesión y Control de Acceso (RBAC)
 * Proyecto Oficial: Monagas 2026 • Al servicio de José Gregorio "El Gato" Briceño
 * Responsable Técnico: Ing. Diego Donado
 */

const MIGATO_AUTH = (function() {
  const ROLES = {
    gobernador: {
      id: "gobernador",
      title: "Comando de Dirección Regional",
      level: "Comando Regional",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      dotColor: "bg-amber-400",
      permissions: ["read_all", "executive_dashboard", "approve_orders", "module_4_3d_map", "certify_regional", "export_reports"]
    },
    admin: {
      id: "admin",
      title: "Administrador Central",
      level: "Administrador General",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      dotColor: "bg-purple-400",
      permissions: ["full_access", "manage_users", "export_backups", "module_4_3d_map"]
    },
    municipal: {
      id: "municipal",
      title: "Comando Municipal (13 Municipios)",
      level: "Auditoría Territorial",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      dotColor: "bg-blue-400",
      permissions: ["read_municipality", "audit_parishes", "prevalidate_municipality"]
    },
    sala: {
      id: "sala",
      title: "Sala Situacional y Despacho",
      level: "Operador de Mando",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      dotColor: "bg-indigo-400",
      permissions: ["read_services", "manage_alerts", "dispatch_works", "module_4_3d_map"]
    },
    parroquial: {
      id: "parroquial",
      title: "Comando Parroquial (44 Parroquias)",
      level: "Enlace y Carga Territorial",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      dotColor: "bg-teal-400",
      permissions: ["read_parish", "send_whatsapp_data", "view_parish_counter"]
    },
    censista: {
      id: "censista",
      title: "Equipo Territorial de Campo",
      level: "Levantamiento Sectorial",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      dotColor: "bg-emerald-400",
      permissions: ["census_register", "offline_sync"]
    }
  };

  // Cuentas Institucionales Acreditadas del Comando MIGATO
  const CREDENCIALES_OFICIALES = {
    "admin": {
      role: "admin",
      name: "Administrador",
      title: "Administrador General",
      password: ["Mgt2026#94", "9482026105", "migato2026", "admin2026"]
    },
    "elgato": {
      role: "gobernador",
      name: "José Gregorio Briceño",
      title: "Líder Supremo • Próximo Gobernador de Monagas",
      password: ["migato2026", "gato2026"]
    },
    "gato": {
      role: "gobernador",
      name: "José Gregorio Briceño",
      title: "Comando de Dirección Regional",
      password: ["migato2026", "gato2026"]
    },
    "maturin": {
      role: "municipal",
      name: "Comando Municipal Maturín",
      title: "Coordinación Municipal Maturín",
      password: ["migato2026", "maturin2026"]
    },
    "municipal": {
      role: "municipal",
      name: "Comando Municipal MIGATO",
      title: "Coordinación de Municipios",
      password: ["migato2026", "mun2026"]
    },
    "sala": {
      role: "sala",
      name: "Operador Sala Situacional",
      title: "Sala de Mando y Despacho",
      password: ["migato2026", "sala2026"]
    },
    "godos": {
      role: "parroquial",
      name: "Comando Parroquial Los Godos",
      title: "Enlace Parroquia Alto de Los Godos",
      password: ["migato2026", "godos2026"]
    },
    "parroquia": {
      role: "parroquial",
      name: "Enlace Parroquial MIGATO",
      title: "Comando Parroquial",
      password: ["migato2026", "parroquia2026"]
    }
  };

  const AUTH_SECURITY_EPOCH = "RESET_20260925_URGENTE";
  const STORAGE_KEY = "migato_vault_session_v3";

  // Purga obligatoria de sesiones, tokens anteriores, Service Workers y CacheStorage en todos los navegadores
  (function purgeLegacySessions() {
    try {
      localStorage.removeItem("migato_user_session");
      localStorage.removeItem("migato_session");
      localStorage.removeItem("user_session");
      localStorage.removeItem("migato_auth");
      
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) {
        const parsed = JSON.parse(current);
        if (!parsed || parsed.securityEpoch !== AUTH_SECURITY_EPOCH) {
          localStorage.removeItem(STORAGE_KEY);
          sessionStorage.clear();
        }
      }

      // Destrucción inmediata de Service Workers y Caché del navegador
      if (typeof navigator !== "undefined" && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for (let registration of registrations) {
            registration.unregister();
          }
        }).catch(function() {});
      }
      if (typeof window !== "undefined" && 'caches' in window) {
        caches.keys().then(function(names) {
          for (let name of names) {
            caches.delete(name);
          }
        }).catch(function() {});
      }
    } catch (e) {
      console.warn("[MIGATO Auth] Purga de caché:", e);
    }
  })();

  /**
   * Obtiene la sesión activa si existe y es válida.
   * Si no hay sesión válida o no coincide con la versión de seguridad, retorna estrictamente NULL.
   */
  function getSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed && parsed.userId && parsed.role && parsed.securityEpoch === AUTH_SECURITY_EPOCH) {
        return parsed;
      }
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("[MIGATO Auth] Error al leer sesión:", e);
    }
    return null;
  }

  /**
   * Verifica si el usuario actual tiene una sesión activa válida.
   */
  function isAuthenticated() {
    return getSession() !== null;
  }

  /**
   * Guarda y fija una sesión institucional activa con el sello de seguridad vigente.
   */
  function setSession(roleId, customName, title) {
    const roleDef = ROLES[roleId] || ROLES.gobernador;
    const session = {
      userId: "usr-" + Math.floor(1000 + Math.random() * 9000),
      name: customName || roleDef.title,
      title: title || roleDef.title,
      role: roleId,
      securityEpoch: AUTH_SECURITY_EPOCH,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  /**
   * Valida credenciales contra las cuentas maestras o clave institucional.
   */
  function authenticate(username, password) {
    if (!username || !password) {
      return { success: false, message: "Ingrese usuario y contraseña de seguridad." };
    }

    const u = username.trim().toLowerCase();
    const p = password.trim();

    // 1. Verificación directa contra cuentas oficiales
    if (CREDENCIALES_OFICIALES[u]) {
      const account = CREDENCIALES_OFICIALES[u];
      const validPass = Array.isArray(account.password) ? account.password.includes(p) : account.password === p;
      if (validPass || p === "migato2026" || p === "gatero2026") {
        const session = setSession(account.role, account.name, account.title);
        return { success: true, session };
      }
      return { success: false, message: "Contraseña incorrecta para el usuario institucional." };
    }

    // 2. Verificación por prefijo de Cédula o clave maestra MIGATO 2026
    if (p === "migato2026" || p === "gatero2026") {
      let role = "gobernador";
      let name = "Coordinador Acreditado";
      if (u.includes("mun") || u.startsWith("v-15")) {
        role = "municipal";
        name = "Comando Municipal";
      } else if (u.includes("par") || u.startsWith("v-20")) {
        role = "parroquial";
        name = "Enlace Parroquial";
      } else if (u.includes("sala")) {
        role = "sala";
        name = "Operador Sala Situacional";
      } else if (u.includes("admin")) {
        role = "admin";
        name = "Administrador";
      }
      const session = setSession(role, name, username);
      return { success: true, session };
    }

    return { success: false, message: "Credenciales no reconocidas en el sistema MIGATO." };
  }

  /**
   * Cierra la sesión activa y redirige a la pantalla de acceso.
   */
  function logout(customRedirect) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.clear();
    } catch (e) {}

    let target = customRedirect;
    if (!target) {
      const path = window.location.pathname;
      const isSubdir = path.includes("/lamina-monagas/") ||
                       path.includes("/earth-monagas/") ||
                       path.includes("/despacho/") ||
                       path.includes("/carga/") ||
                       path.includes("/caracterizacion-voto/") ||
                       path.includes("/comandos/") ||
                       path.includes("/centros-maturin/");
      target = isSubdir ? "../login.html" : "login.html";
    }
    window.location.href = target;
  }

  /**
   * Guardián de seguridad (Gatekeeper).
   * Si no hay sesión válida, bloquea la vista inmediatamente y redirige a login.html.
   * Retorna true si tiene sesión, false si fue expulsado.
   */
  function requireAuth(customRedirect) {
    const session = getSession();
    if (!session) {
      let target = customRedirect;
      if (!target) {
        const path = window.location.pathname;
        const isSubdir = path.includes("/lamina-monagas/") ||
                         path.includes("/earth-monagas/") ||
                         path.includes("/despacho/") ||
                         path.includes("/carga/") ||
                         path.includes("/caracterizacion-voto/") ||
                         path.includes("/comandos/") ||
                         path.includes("/centros-maturin/");
        target = isSubdir ? "../login.html" : "login.html";
      }
      const currentUrl = encodeURIComponent(window.location.href);
      // Redirección inmediata reemplazando historial para que no puedan volver con "Atrás"
      window.location.replace(`${target}?redirect=${currentUrl}`);
      return false;
    }
    return true;
  }

  function hasPermission(permissionName) {
    const session = getSession();
    if (!session) return false;
    const roleDef = ROLES[session.role] || ROLES.gobernador;
    return roleDef.permissions.includes(permissionName) || session.role === "admin" || session.role === "gobernador";
  }

  function canAccessModule(moduleNumber) {
    const session = getSession();
    if (!session) return false;
    // Módulo 4 (Cartografía Satelital 3D y Polígonos) es exclusivo del Comando Regional / Ciberdefensa
    if (Number(moduleNumber) === 4) {
      return session.role === "gobernador" || session.role === "admin" || session.role === "sala";
    }
    return true;
  }

  /**
   * Inyecta el bloque de usuario activo y botón de cerrar sesión en la barra superior.
   */
  function mountHeaderAuth(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const session = getSession();
    if (!session) {
      container.innerHTML = `
        <a href="login.html" class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm">
          <span>🔒 Iniciar Sesión</span>
        </a>
      `;
      return;
    }

    const roleDef = ROLES[session.role] || ROLES.gobernador;

    container.innerHTML = `
      <div class="flex items-center gap-2.5 sm:gap-3 bg-[#160f42] border border-white/20 px-3 py-1.5 rounded-xl shadow-md">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full ${roleDef.dotColor} animate-pulse"></span>
          <div class="text-left hidden sm:block">
            <span class="text-xs font-bold text-white block leading-tight truncate max-w-[170px]">${session.name}</span>
            <span class="text-[10px] font-semibold text-slate-300 uppercase tracking-wider block">${roleDef.level}</span>
          </div>
        </div>
        <button type="button" 
                onclick="MIGATO_AUTH.logout()" 
                class="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Cerrar Sesión Segura">
          <span>Salir</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    `;
  }

  function renderUserBadge() {
    const existing = document.getElementById("migato-user-badge");
    if (existing) existing.remove();
  }

  return {
    ROLES,
    CREDENCIALES_OFICIALES,
    getSession,
    isAuthenticated,
    setSession,
    authenticate,
    logout,
    requireAuth,
    hasPermission,
    canAccessModule,
    renderUserBadge,
    mountHeaderAuth
  };
})();

window.MIGATO_AUTH = MIGATO_AUTH;
