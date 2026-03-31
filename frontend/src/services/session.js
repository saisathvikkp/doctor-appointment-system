import { useMemo, useSyncExternalStore } from "react";

const USER_KEY = "hospital_user";
const TOKEN_KEY = "hospital_token";
const SESSION_EVENT = "hospital-session-change";

function notifySessionChange() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function saveSession(user, token) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
  notifySessionChange();
}

function getStoredUserFromRaw(rawUser) {

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    clearSession();
    return null;
  }
}

export function getStoredUser() {
  return getStoredUserFromRaw(localStorage.getItem(USER_KEY));
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  notifySessionChange();
}

function subscribe(callback) {
  const handleStorageChange = () => {
    callback();
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(SESSION_EVENT, handleStorageChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(SESSION_EVENT, handleStorageChange);
  };
}

export function useStoredUser() {
  const rawUser = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(USER_KEY),
    () => null
  );

  return useMemo(() => getStoredUserFromRaw(rawUser), [rawUser]);
}
