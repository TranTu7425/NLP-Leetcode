/* API client + auth state. Shared across all pages. */

(function () {
  const TOKEN_KEY = "nlp-leetcode:token";
  const USER_KEY = "nlp-leetcode:user";

  const api = {
    // ---------- auth state ----------
    getToken() {
      return localStorage.getItem(TOKEN_KEY);
    },
    getUser() {
      try {
        return JSON.parse(localStorage.getItem(USER_KEY) || "null");
      } catch {
        return null;
      }
    },
    setAuth(token, user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    clearAuth() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    isAuthenticated() {
      return !!this.getToken();
    },

    // ---------- fetch wrapper ----------
    async _fetch(path, options = {}) {
      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };
      const token = this.getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res;
      try {
        res = await fetch(path, { ...options, headers });
      } catch (networkErr) {
        throw new Error("Không kết nối được backend. Đảm bảo `docker compose up` đang chạy.");
      }

      if (res.status === 401) {
        this.clearAuth();
        if (!/\/(login|register)\.html$/.test(location.pathname)) {
          const next = encodeURIComponent(location.pathname + location.search);
          location.href = `login.html?next=${next}`;
        }
        throw new Error("Unauthorized");
      }

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok) {
        const msg = data?.detail || data?.message || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
      return data;
    },

    // ---------- endpoints ----------
    register(email, username, password) {
      return this._fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      });
    },
    login(email, password) {
      return this._fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    me() {
      return this._fetch("/api/me");
    },
    listProgress() {
      return this._fetch("/api/progress");
    },
    saveProgress(problem_id, status, code = null) {
      return this._fetch("/api/progress", {
        method: "POST",
        body: JSON.stringify({ problem_id, status, code }),
      });
    },
    clearProgress() {
      return this._fetch("/api/progress", { method: "DELETE" });
    },
    runCode(code, problem_id = null) {
      return this._fetch("/api/run", {
        method: "POST",
        body: JSON.stringify({ code, problem_id }),
      });
    },
  };

  // Require auth on protected pages (call from page scripts)
  api.requireAuth = function () {
    if (!api.isAuthenticated()) {
      const next = encodeURIComponent(location.pathname + location.search);
      location.href = `login.html?next=${next}`;
      return false;
    }
    return true;
  };

  window.api = api;
})();
