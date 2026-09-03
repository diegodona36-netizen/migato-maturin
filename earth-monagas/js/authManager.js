/**
 * Gestor de Autenticación, Sesiones y Seguridad Territorial
 * Control de Acceso Basado en Roles (RBAC) para el Estado Monagas
 */

import { findUserByCredentials, USERS_CATALOG } from "./usersCatalog.js";

const AUTH_STORAGE_KEY = "migato_earth_session_v1";

export class AuthManager {
  constructor() {
    this.currentUser = this.loadSession();
  }

  loadSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Error cargando sesión:", e);
      return null;
    }
  }

  login(identity, password, remember = true) {
    const user = findUserByCredentials(identity, password);
    if (!user) {
      return {
        success: false,
        message: "Credenciales inválidas. Verifica tu usuario/correo y contraseña."
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
