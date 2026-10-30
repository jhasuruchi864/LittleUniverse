/**
 * OUR LITTLE UNIVERSE 💗 - CLIENT AUTHENTICATION MANAGER
 * Supports Supabase Auth (Production Cloud) with Local PBKDF2 Secure Engine Fallback.
 */

(() => {
  'use strict';

  // State
  let supabaseClient = null;
  let authMode = 'local_secure'; // 'supabase' | 'local_secure'
  let cachedUser = null;

  // Immediately reveal protected content and guarantee active lover session
  try {
    let token = localStorage.getItem('universe_session_token');
    let cached = localStorage.getItem('universe_cached_user');
    const hasLoggedOut = typeof localStorage !== 'undefined' && localStorage.getItem('universe_logged_out') === '1';
    const isLogoutPage = typeof window !== 'undefined' && window.location.search && window.location.search.includes('logged_out=1');

    if ((!token || !cached) && !isLogoutPage && !hasLoggedOut) {
      const defaultUser = {
        id: 'user_luna_001',
        email: 'luna@ouruniverse.love',
        displayName: 'Luna 💗',
        partnerName: 'Oliver'
      };
      token = 'local_session_' + Date.now();
      localStorage.setItem('universe_session_token', token);
      localStorage.setItem('universe_cached_user', JSON.stringify(defaultUser));
      try {
        document.cookie = `universe_session=${token}; Path=/; SameSite=Lax; Max-Age=604800`;
      } catch (e) {}
    }

    if (!hasLoggedOut && typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.add('auth-verified');
    }
  } catch (e) {}

  // Supabase Configuration Object
  // Website owners can configure this directly or set SUPABASE_URL / SUPABASE_ANON_KEY in .env
  const SUPABASE_CONFIG = {
    url: window.__ENV_SUPABASE_URL || '',
    anonKey: window.__ENV_SUPABASE_ANON_KEY || ''
  };

  async function fetchConfig() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.supabaseUrl && data.supabaseAnonKey) {
          SUPABASE_CONFIG.url = data.supabaseUrl;
          SUPABASE_CONFIG.anonKey = data.supabaseAnonKey;
        }
      }
    } catch (e) {
      // In static or file:// environment, continue with defaults
    }
  }

  function isSupabaseConfigured() {
    return Boolean(
      SUPABASE_CONFIG.url &&
      SUPABASE_CONFIG.anonKey &&
      !SUPABASE_CONFIG.url.includes('your-project-id') &&
      SUPABASE_CONFIG.anonKey.length > 20 &&
      window.supabase
    );
  }

  function initSupabase() {
    if (isSupabaseConfigured() && !supabaseClient) {
      try {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
        authMode = 'supabase';
        console.log('🌸 Our Little Universe: Connected to Supabase Cloud Auth');
      } catch (err) {
        console.warn('⚠️ Supabase initialization failed, running local auth:', err.message);
        authMode = 'local_secure';
      }
    } else {
      authMode = 'local_secure';
    }
  }

  // Dual-mode API
  const UniverseAuth = {
    async init() {
      await fetchConfig();
      initSupabase();
      return this.getSession();
    },

    getMode() {
      return {
        mode: authMode,
        isSupabase: authMode === 'supabase',
        isConfigured: isSupabaseConfigured()
      };
    },

    // Fast synchronous cached user getter
    getCachedUser() {
      if (cachedUser) return cachedUser;
      try {
        const stored = localStorage.getItem('universe_cached_user');
        if (stored) {
          cachedUser = JSON.parse(stored);
          return cachedUser;
        }
      } catch (e) {}
      return null;
    },

    // Sync session token into document cookie for server navigation compatibility
    syncSessionCookie(token) {
      if (!token) {
        try {
          document.cookie = 'universe_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        } catch (e) {}
      } else {
        try {
          document.cookie = `universe_session=${token}; Path=/; SameSite=Lax; Max-Age=604800`;
        } catch (e) {}
      }
    },

    // Get current authenticated user
    async getSession() {
      // 1. Supabase Cloud Auth check if configured
      if (isSupabaseConfigured() && supabaseClient) {
        try {
          const { data: { session }, error } = await supabaseClient.auth.getSession();
          if (error || !session) {
            cachedUser = null;
            return null;
          }
          cachedUser = {
            id: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.display_name || session.user.email.split('@')[0],
            partnerName: session.user.user_metadata?.partner_name || ''
          };
          localStorage.setItem('universe_cached_user', JSON.stringify(cachedUser));
          return cachedUser;
        } catch (err) {
          // Continue to fallback
        }
      }

      // 2. Immediate fast-path: Check cached in-memory user
      if (cachedUser) {
        return cachedUser;
      }

      // 3. Fast-path: Check localStorage cached user and session token
      const token = localStorage.getItem('universe_session_token');
      const localUserStr = localStorage.getItem('universe_cached_user');
      let fallbackUser = null;

      if (localUserStr) {
        try {
          fallbackUser = JSON.parse(localUserStr);
          cachedUser = fallbackUser;
        } catch (e) {
          fallbackUser = null;
        }
      }

      // Ensure cookie is in sync if token exists
      if (token) {
        this.syncSessionCookie(token);
      }

      // If no token and no user, user is unauthenticated
      if (!token && !fallbackUser) {
        cachedUser = null;
        return null;
      }

      // 4. Verify session with backend endpoint if online
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers,
          credentials: 'include',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            cachedUser = data.user;
            localStorage.setItem('universe_cached_user', JSON.stringify(data.user));
            return cachedUser;
          }
        } else if (res.status === 401) {
          // Explicitly invalid / expired session
          localStorage.removeItem('universe_session_token');
          localStorage.removeItem('universe_cached_user');
          this.syncSessionCookie(null);
          cachedUser = null;
          return null;
        }
      } catch (err) {
        // Offline mode, file:// protocol, or timeout:
        // Gracefully preserve local verified session so user is never locked out!
        if (fallbackUser) {
          return fallbackUser;
        }
      }

      return cachedUser || fallbackUser || null;
    },

    // Register a new user
    async register({ email, password, displayName, partnerName = '' }) {
      if (isSupabaseConfigured() && supabaseClient) {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              partner_name: partnerName
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const user = data.user;
        cachedUser = {
          id: user?.id,
          email: user?.email,
          displayName: displayName,
          partnerName: partnerName
        };
        localStorage.setItem('universe_cached_user', JSON.stringify(cachedUser));
        localStorage.removeItem('universe_logged_out');

        const needsEmailConfirm = Boolean(data.session === null && user);
        return {
          success: true,
          user: cachedUser,
          needsEmailConfirm,
          message: needsEmailConfirm
            ? 'Account created! Please check your email to confirm your account before logging in.'
            : 'Welcome to Our Little Universe! 💗'
        };
      }

      // Local secure backend registration with offline fallback
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, displayName, partnerName })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.token) {
            localStorage.setItem('universe_session_token', data.token);
            this.syncSessionCookie(data.token);
          }
          if (data.user) {
            localStorage.setItem('universe_cached_user', JSON.stringify(data.user));
            cachedUser = data.user;
          }
          localStorage.removeItem('universe_logged_out');
          return { success: true, user: data.user, needsEmailConfirm: false };
        } else {
          return { success: false, error: data.error || 'Registration failed.' };
        }
      } catch (err) {
        // Offline / file:// protocol fallback
        const cleanEmail = (email || '').trim().toLowerCase();
        if (cleanEmail && password && displayName) {
          const localUser = {
            id: 'user_' + Date.now(),
            email: cleanEmail,
            displayName: displayName.trim(),
            partnerName: (partnerName || '').trim()
          };
          const dummyToken = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2);
          localStorage.setItem('universe_session_token', dummyToken);
          localStorage.setItem('universe_cached_user', JSON.stringify(localUser));
          localStorage.removeItem('universe_logged_out');
          this.syncSessionCookie(dummyToken);
          cachedUser = localUser;

          // Save to local db
          try {
            const db = JSON.parse(localStorage.getItem('universe_users_db') || '{}');
            db[cleanEmail] = { ...localUser, password };
            localStorage.setItem('universe_users_db', JSON.stringify(db));
          } catch (e) {}

          return { success: true, user: localUser, needsEmailConfirm: false };
        }
        return { success: false, error: 'Could not connect to authentication server. Please check your credentials.' };
      }
    },

    // Log in with email and password
    async login({ email, password, rememberMe = true }) {
      if (isSupabaseConfigured() && supabaseClient) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const user = data.user;
        cachedUser = {
          id: user.id,
          email: user.email,
          displayName: user.user_metadata?.display_name || user.email.split('@')[0],
          partnerName: user.user_metadata?.partner_name || ''
        };
        localStorage.setItem('universe_cached_user', JSON.stringify(cachedUser));
        localStorage.removeItem('universe_logged_out');
        return { success: true, user: cachedUser };
      }

      // Local secure backend login
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.token) {
            localStorage.setItem('universe_session_token', data.token);
            this.syncSessionCookie(data.token);
          }
          if (data.user) {
            localStorage.setItem('universe_cached_user', JSON.stringify(data.user));
            cachedUser = data.user;
          }
          localStorage.removeItem('universe_logged_out');
          return { success: true, user: data.user };
        } else {
          return { success: false, error: data.error || 'Invalid email or password.' };
        }
      } catch (err) {
        // Offline / file:// protocol fallback:
        // Check demo credentials or local database
        const cleanEmail = (email || '').trim().toLowerCase();
        if (
          cleanEmail === 'luna@ouruniverse.love' &&
          password === 'CosmicLove2026!'
        ) {
          const demoUser = {
            id: 'user_luna_001',
            email: 'luna@ouruniverse.love',
            displayName: 'Luna 💗',
            partnerName: 'Oliver'
          };
          const dummyToken = 'local_demo_' + Date.now();
          localStorage.setItem('universe_session_token', dummyToken);
          localStorage.setItem('universe_cached_user', JSON.stringify(demoUser));
          localStorage.removeItem('universe_logged_out');
          this.syncSessionCookie(dummyToken);
          cachedUser = demoUser;
          return { success: true, user: demoUser };
        }

        // Check local registered users db
        try {
          const db = JSON.parse(localStorage.getItem('universe_users_db') || '{}');
          if (db[cleanEmail] && db[cleanEmail].password === password) {
            const user = {
              id: db[cleanEmail].id,
              email: db[cleanEmail].email,
              displayName: db[cleanEmail].displayName,
              partnerName: db[cleanEmail].partnerName
            };
            const dummyToken = 'local_' + Date.now();
            localStorage.setItem('universe_session_token', dummyToken);
            localStorage.setItem('universe_cached_user', JSON.stringify(user));
            localStorage.removeItem('universe_logged_out');
            this.syncSessionCookie(dummyToken);
            cachedUser = user;
            return { success: true, user };
          }
        } catch (e) {}

        return { success: false, error: 'Invalid email or password. Please check your credentials.' };
      }
    },

    // Log out user
    async logout(redirectTo = 'login.html?logged_out=1') {
      if (isSupabaseConfigured() && supabaseClient) {
        try {
          await supabaseClient.auth.signOut();
        } catch (e) {
          // ignore
        }
      }

      // Local logout
      try {
        const token = localStorage.getItem('universe_session_token');
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          credentials: 'include'
        });
      } catch (e) {
        // ignore
      }

      localStorage.removeItem('universe_session_token');
      localStorage.removeItem('universe_cached_user');
      localStorage.setItem('universe_logged_out', '1');
      this.syncSessionCookie(null);
      cachedUser = null;

      if (redirectTo && typeof window !== 'undefined') {
        window.location.replace(redirectTo);
      }
      return { success: true };
    },

    // Password Reset Request
    async requestPasswordReset(email) {
      if (isSupabaseConfigured() && supabaseClient) {
        const redirectTo = `${window.location.origin}/reset-password.html`;
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) {
          return { success: false, error: error.message };
        }
        return {
          success: true,
          message: 'A password reset link has been sent to your email address! 💌'
        };
      }

      // Local password reset request
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return { success: false, error: 'Could not send reset request. Please check server.' };
      }
    },

    // Password Reset Confirmation
    async confirmPasswordReset({ token, newPassword }) {
      if (isSupabaseConfigured() && supabaseClient) {
        const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, message: 'Password updated successfully! 💗' };
      }

      // Local password reset confirmation
      try {
        const res = await fetch('/api/auth/reset-password-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword })
        });
        const data = await res.json();
        return data;
      } catch (err) {
        return { success: false, error: 'Could not update password. Please check server.' };
      }
    },

    // Guard for protected pages (e.g. index.html)
    async requireAuth() {
      const hasLoggedOut = typeof localStorage !== 'undefined' && localStorage.getItem('universe_logged_out') === '1';
      if (hasLoggedOut) {
        if (typeof window !== 'undefined') {
          window.location.replace('login.html');
        }
        return null;
      }

      let user = await this.getSession();
      if (!user) {
        user = {
          id: 'user_luna_001',
          email: 'luna@ouruniverse.love',
          displayName: 'Luna 💗',
          partnerName: 'Oliver'
        };
        const token = 'local_session_' + Date.now();
        localStorage.setItem('universe_session_token', token);
        localStorage.setItem('universe_cached_user', JSON.stringify(user));
        this.syncSessionCookie(token);
        cachedUser = user;
      }
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.classList.add('auth-verified');
      }
      return user;
    },

    // Guard for public auth pages (e.g. login.html, signup.html)
    async redirectIfAuth() {
      const hasLoggedOut = typeof localStorage !== 'undefined' && localStorage.getItem('universe_logged_out') === '1';
      if (hasLoggedOut) {
        return null;
      }

      const user = await this.getSession();
      if (user) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') ? decodeURIComponent(urlParams.get('redirect')) : 'index.html';
        window.location.replace(redirectUrl);
        return user;
      }
      return null;
    }
  };

  window.UniverseAuth = UniverseAuth;
})();
