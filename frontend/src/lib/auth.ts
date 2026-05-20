export interface SafeBankUser {
  id: string;
  fullname: string;
  email: string;
  phone?: string | null;
  balance: number;
  account_number: string;
  role: string;
  is_frozen: boolean;
}

export function saveSession(token: string, user: SafeBankUser) {
  localStorage.setItem("safebank_token", token);
  localStorage.setItem("safebank_user", JSON.stringify(user));
  console.log("[SafeBank Auth] Session saved for", user.email);
}

export function getUser(): SafeBankUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("safebank_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SafeBankUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("safebank_token");
  localStorage.removeItem("safebank_user");
  console.log("[SafeBank Auth] Session cleared");
}

export function isAuthenticated(): boolean {
  return !!getUser() && !!localStorage.getItem("safebank_token");
}
