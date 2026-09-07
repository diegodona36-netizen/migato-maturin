/**
 * Gestor de Autenticación, Sesiones y Seguridad Territorial
 * Control de Acceso Basado en Roles (RBAC) para el Estado Monagas
 */

import { findUserByCredentials, USERS_CATALOG } from "./usersCatalog.js?v=117";

const AUTH_STORAGE_KEY = "migato_earth_session_v7";

export function forceCleanCacheAndReload() {
  try {
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
    const url = new URL(window.location.href);
    const mun = url.searchParams.get("mun");
    const p = url.searchParams.get("p");
    let reloadUrl = window.location.pathname + "?v=117&u=admin-militancia";
    if (mun) reloadUrl += "&mun=" + mun;
    if (p) reloadUrl += "&p=" + p;
    window.location.href = reloadUrl;
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
      localStorage.removeItem("migato_earth_session_v4");
      localStorage.removeItem("migato_earth_session_v5");
      localStorage.removeItem("migato_earth_session_v6");
      sessionStorage.removeItem("migato_earth_session_v1");
      sessionStorage.removeItem("migato_earth_session_v2");
      sessionStorage.removeItem("migato_earth_session_v3");
      sessionStorage.removeItem("migato_earth_session_v4");
      sessionStorage.removeItem("migato_earth_session_v5");
      sessionStorage.removeItem("migato_earth_session_v6");
    } catch (e) {}
    this.currentUser = this.loadSession();
  }

  loadSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  login(identity, password, remember = true) {
    const user = findUserByCredentials(identity, password);
    if (!user) {
      return {
        success: false,
        message: "Credenciales no válidas. Verifique su usuario y contraseña asignados."
      };
    }

    const sessionData = {
      id: user.id,
      username: user.username,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      nivel: user.nivel || (user.id === "usr-jefe" ? "jefe" : "general"),
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
    try {
      sessionStorage.clear();
      localStorage.removeItem("migato_last_mun");
      localStorage.removeItem("migato_last_parish");
    } catch(e) {}
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Verifica si el usuario puede ver y editar una parroquia específica
  canAccessParish(munId, parishId) {
    if (!this.currentUser) return true;
    if (this.currentUser.rol === "admin") return true;
    return this.currentUser.parroquiaId === parishId;
  }

  // Verifica si el usuario tiene permiso de cambiar de parroquia
  canSwitchParish() {
    if (!this.currentUser) return true;
    return this.currentUser.rol === "admin";
  }
}
