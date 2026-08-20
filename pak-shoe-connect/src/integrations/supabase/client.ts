/**
 * Clean Unified API-backed Auth Client
 * Connects to Vercel Gateway REST API (/api/v1/auth/*)
 * Zero Supabase / Lovable Cloud dependency.
 */

export interface AuthUser {
  id: string;
  email?: string | null;
  phone?: string;
  role: string;
  fullName?: string;
  city?: string;
  aud?: string;
  created_at?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token?: string;
  user: AuthUser;
}

export type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED";

const SESSION_STORAGE_KEY = "anamon_auth_session_v3";
const listeners = new Set<(event: AuthChangeEvent, session: AuthSession | null) => void>();

function notify(event: AuthChangeEvent, session: AuthSession | null) {
  listeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (err) {
      console.warn("[Auth] Listener callback error:", err);
    }
  });
}

function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (session && session.access_token && session.expires_at > Date.now() / 1000) {
      return session;
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

function setStoredSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (err) {
    console.warn("[Auth] Error saving session to storage:", err);
  }
}

function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    if (
      window.location.hostname.includes("anamonofficial.com") ||
      window.location.hostname.includes("hostingersite.com")
    ) {
      return "https://pak-shoe-connect.vercel.app";
    }
  }
  return "";
}

export const auth = {
  async getSession(): Promise<{ data: { session: AuthSession | null }; error: any }> {
    const session = getStoredSession();
    return { data: { session }, error: null };
  },

  async getUser(): Promise<{ data: { user: AuthUser | null }; error: any }> {
    const session = getStoredSession();
    return { data: { user: session?.user || null }, error: null };
  },

  async signInWithPassword(credentials: { email?: string; phone?: string; password: string }): Promise<{
    data: { user: AuthUser | null; session: AuthSession | null };
    error: { message: string } | null;
  }> {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          data: { user: null, session: null },
          error: { message: data?.message || data?.error?.message || "Invalid credentials" },
        };
      }

      const token = data.data?.token;
      const rawUser = data.data?.user || {};
      const user: AuthUser = {
        id: rawUser.id || `usr-${Date.now()}`,
        email: rawUser.email || credentials.email || null,
        phone: rawUser.phone || credentials.phone || "",
        role: rawUser.role || "BUYER",
        fullName: rawUser.fullName || rawUser.name || "Customer",
        city: rawUser.city || "Lahore",
        aud: "authenticated",
        created_at: new Date().toISOString(),
        user_metadata: rawUser,
      };

      const session: AuthSession = {
        access_token: token,
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: token,
        user,
      };

      setStoredSession(session);
      notify("SIGNED_IN", session);
      return { data: { user, session }, error: null };
    } catch (err: any) {
      return {
        data: { user: null, session: null },
        error: { message: err?.message || "Network error during authentication" },
      };
    }
  },

  async signUp(params: {
    email?: string;
    phone?: string;
    password: string;
    options?: { data?: Record<string, any>; emailRedirectTo?: string };
  }): Promise<{
    data: { user: AuthUser | null; session: AuthSession | null };
    error: { message: string } | null;
  }> {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: params.email,
          phone: params.phone,
          password: params.password,
          fullName: params.options?.data?.fullName || params.options?.data?.business_name || "New Buyer",
          city: params.options?.data?.city || "Lahore",
          role: params.options?.data?.role || "BUYER",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          data: { user: null, session: null },
          error: { message: data?.message || data?.error?.message || "Registration failed" },
        };
      }

      const token = data.data?.token;
      const rawUser = data.data?.user || {};
      const user: AuthUser = {
        id: rawUser.id,
        email: rawUser.email,
        phone: rawUser.phone,
        role: rawUser.role,
        fullName: rawUser.fullName,
        city: rawUser.city,
        aud: "authenticated",
        created_at: new Date().toISOString(),
        user_metadata: rawUser,
      };

      const session: AuthSession = {
        access_token: token,
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: token,
        user,
      };

      setStoredSession(session);
      notify("SIGNED_IN", session);
      return { data: { user, session }, error: null };
    } catch (err: any) {
      return {
        data: { user: null, session: null },
        error: { message: err?.message || "Network error during registration" },
      };
    }
  },

  async signOut(): Promise<{ error: null }> {
    setStoredSession(null);
    notify("SIGNED_OUT", null);
    return { error: null };
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: AuthSession | null) => void) {
    listeners.add(callback);
    const session = getStoredSession();
    if (session) {
      setTimeout(() => callback("SIGNED_IN", session), 0);
    }
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            listeners.delete(callback);
          },
        },
      },
    };
  },
};

// Chainable mock builder for backward compatibility
function createQueryBuilder(initialData: any = null) {
  const chain: any = {
    select: (_cols?: string) => chain,
    order: (_col?: string, _opts?: any) => chain,
    limit: (_n?: number) => chain,
    eq: (_col?: string, _val?: any) => chain,
    maybeSingle: async () => ({ data: initialData, error: null }),
    single: async () => ({ data: initialData, error: null }),
    update: (updates: any) => ({
      eq: (_col: string, _val: any) => Promise.resolve({ data: updates, error: null }),
      then: (onfulfilled?: any) => Promise.resolve({ data: updates, error: null }).then(onfulfilled),
    }),
    insert: (records: any) => Promise.resolve({ data: records, error: null }),
    then: (onfulfilled?: any) => Promise.resolve({ data: initialData || [], error: null }).then(onfulfilled),
  };
  return chain;
}

export const supabase = {
  auth,
  from: (_table: string) => createQueryBuilder(),
};

// Type aliases for legacy components
export type User = AuthUser;
export type Session = AuthSession;
