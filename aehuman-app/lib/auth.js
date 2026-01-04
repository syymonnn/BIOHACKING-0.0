// lib/auth.js
// Sistema di autenticazione MVP basato su localStorage
// Pronto per essere esteso con OTP/2FA in futuro

export const AUTH_KEY = 'aehuman_auth';

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) return false;
  
  try {
    const data = JSON.parse(auth);
    return data.email && data.loggedIn === true;
  } catch {
    return false;
  }
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) return null;
  
  try {
    const data = JSON.parse(auth);
    return data.email ? { email: data.email } : null;
  } catch {
    return null;
  }
}

export function login(email) {
  if (typeof window === 'undefined') return false;
  
  // Validazione email semplice
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Email non valida');
  }
  
  const authData = {
    email,
    loggedIn: true,
    timestamp: Date.now()
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  return true;
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

// Hook per proteggere le route
export function useAuth() {
  if (typeof window === 'undefined') return { isAuth: false, user: null };
  
  const isAuth = isAuthenticated();
  const user = getUser();
  
  return { isAuth, user };
}
