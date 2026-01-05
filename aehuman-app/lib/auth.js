// lib/auth.js
// Sistema di autenticazione con Supabase + fallback localStorage
import { supabase } from './supabaseClient';

export const AUTH_KEY = 'aehuman_auth';

// Funzione per verificare se l'utente è autenticato
export async function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  // Se Supabase è configurato, usa la sessione di Supabase
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }
  
  // Fallback a localStorage
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) return false;
  
  try {
    const data = JSON.parse(auth);
    return data.email && data.loggedIn === true;
  } catch {
    return false;
  }
}

// Versione sincrona per uso immediato
export function isAuthenticatedSync() {
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

export async function getUser() {
  if (typeof window === 'undefined') return null;
  
  // Se Supabase è configurato, ottieni l'utente da Supabase
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
  
  // Fallback a localStorage
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) return null;
  
  try {
    const data = JSON.parse(auth);
    return data.email ? { email: data.email } : null;
  } catch {
    return null;
  }
}

// Login con Supabase Magic Link o fallback
export async function login(email) {
  if (typeof window === 'undefined') return false;
  
  // Validazione email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Email non valida');
  }
  
  // Se Supabase è configurato, usa Magic Link
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/track/auth`
          : 'http://localhost:3000/track/auth',
      },
    });
    
    if (error) throw error;
    
    // Salva temporaneamente in localStorage per la UI
    const authData = {
      email,
      loggedIn: false, // Non ancora confermato
      pending: true,
      timestamp: Date.now()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    
    return { data, needsConfirmation: true };
  }
  
  // Fallback a localStorage (dev mode)
  const authData = {
    email,
    loggedIn: true,
    timestamp: Date.now()
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  return { needsConfirmation: false };
}

export async function logout() {
  if (typeof window === 'undefined') return;
  
  // Logout da Supabase se configurato
  if (supabase) {
    await supabase.auth.signOut();
  }
  
  // Rimuovi da localStorage
  localStorage.removeItem(AUTH_KEY);
}

// Hook per proteggere le route
export function useAuth() {
  if (typeof window === 'undefined') return { isAuth: false, user: null };
  
  const isAuth = isAuthenticatedSync();
  const auth = localStorage.getItem(AUTH_KEY);
  let user = null;
  
  try {
    const data = JSON.parse(auth || '{}');
    user = data.email ? { email: data.email } : null;
  } catch {}
  
  return { isAuth, user };
}
