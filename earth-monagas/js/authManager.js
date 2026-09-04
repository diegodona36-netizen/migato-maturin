/**
 * Gestor de Autenticación, Sesiones y Seguridad Territorial
 * Control de Acceso Basado en Roles (RBAC) para el Estado Monagas
 */

import { findUserByCredentials, USERS_CATALOG } from "./usersCatalog.js?v=38";

const AUTH_STORAGE_KEY = "migato_earth_session_v4";

export function forceCleanCacheAndReload() {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {}

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const r of registrations) r.unregister();
    });
  }

  if ("caches" in window) {
    caches.keys().then(names => {
      for (const n of names) caches.delete(n);
    });
  }

  setTimeout(() => {
    window.location.href = window.location.pathname + "?nocache=" + Date.now();
  }, 100);
}

if (typeof window !== "undefined") {
  window.forceCleanCacheAndReload = forceCleanCacheAndReload;
}

export class AuthManager {
  constructor() {
    try {
      localStorage.removeItem("migato_earth_session_v1");
      localStorage.removeItem("migato_earth_session_v2");
      localStorage.removeItem("migato_earth_session_v3");
      sessionStorage.removeItem("migato_earth_session_v1");
      sessionStorage.removeItem("migato_earth_session_v2");
      sessionStorage.removeItem("migato_earth_session_v3");
    } catch (e) {}
    this.currentUser = this.loadSession();
  }

  loadSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.username || !parsed.rol) return null;
      return parsed;
    } catch (e) {
      console.warn("Error cargando sesión:", e);
      return null;
    }
  }

  login(identity, password = "", remember = true) {
    const user = findUserByCredentials(identity, password);
    if (!user) {
      return {
        success: false,
        message: "Credenciales no reconocidas. Puedes hacer clic en '👑 Ingresar como Usuario General' para entrar directamente."
      };
    }

    // Copia segura de sesión sin exponer el password
    const sessionData = {
      id: user.id,
      username: user.username,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      municipioId: user.municipioId,
      parroquiaId: user.parroquiaId,
      parroquiaNombre: user.parroquiaNombre,
      municipioNombre: user.municipioNombre,
      loginAt: new Date().toISOString()
    };

    this.currentUser = sessionData;
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));

    return { success: true, user: sessionData };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Verifica si el usuario puede ver y editar una parroquia específica
  canAccessParish(munId, parishId) {
    if (!this.currentUser) return false;
    if (this.currentUser.rol === "admin") return true;
    if (this.currentUser.rol === "coordinador") {
      return this.currentUser.municipioId === munId;
    }
    if (this.currentUser.rol === "operador") {
      return this.currentUser.municipioId === munId && this.currentUser.parroquiaId === parishId;
    }
    return false;
  }

  // Verifica si el usuario tiene permiso de cambiar de parroquia
  canSwitchParish() {
    if (!this.currentUser) return false;
    return this.currentUser.rol === "admin" || this.currentUser.rol === "coordinador";
  }
}
