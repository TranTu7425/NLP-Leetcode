/* Problem-list page: table render, filters, progress via backend API. */

(function () {
  const THEME_KEY = "nlp-leetcode:theme";

  if (!api.requireAuth()) return;

  const state = {
    search: "",
    difficulty: "",
    category: "",
    status: "",
    progress: new Map(),   // problem_id -> "solved" | "attempted"
  };

  // ---------- theme ----------
  function applyTheme(theme) {
    const html = document.documentElement;
    html.classList.toggle("dark", theme !== "light");
    html.classList.toggle("light", theme === "light");
    document.getElementById("icon-sun").classList.toggle("hidden", theme !== "light");
    document.getElementById("icon-moon").classList.toggle("hidden", theme === "light");
  }
  function initTheme() {
    applyTheme(localStorage.getItem(THEME_KEY) || "dark");
    document.getElementById("theme-toggle").addEventListener("click", () => {
      const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  // ---------- user chip ----------
  function renderUser() {
    const user = api.getUser();
    if (!user) return;
    const chip = document.getElementById("user-chip");
    chip.classList.remove("hidden");
    document.getElementById("user-name").textContent = user.username;
    document.getElementById("user-avatar").textContent = (user.username[0] || "?").toUpperCase();
    const btn = document.getElementById("logout-btn");
    btn.classList.remove("hidden");
    btn.addEventListener("click", () => {
      api.clearAuth();
      location.href = "login.html";
    });
  }

  // ---------- stats ----------
  function updateStats() {
    const total = PROBLEMS.length;
    let solved = 0, easy = 0, medium = 0, attempted = 0;
    for (const p of PROBLEMS) {
      const s = state.progress.get(p.id);
      if (s === "solved") {
        solved++;
        if (p.difficulty === "Easy") easy++;
        else medium++;
      } else if (s === "attempted") {
        attempted++;
      }
    }
    document.getElementById("stat-solved").textContent = solved;
    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-easy").textContent = easy;
    document.getElementById("stat-medium").textContent = medium;
    document.getElementById("stat-attempted").textContent = attempted;
    document.getElementById("stat-bar").style.width = total ? Math.round((solved / total) * 100) + "%" : "0%";
  }

  // ---------- filters ----------
  function getProblemStatus(id) {
    return state.progress.get(id) || "todo";
  }
  function filteredProblems() {
    const q = state.search.trim().toLowerCase();
    return PROBLEMS.filter((p) => {
      if (state.difficulty && p.difficulty !== state.difficulty) return false;
      if (state.category && !p.tags.includes(state.category)) return false;
      if (state.status && state.status !== getProblemStatus(p.id)) return false;
      if (q) {
        const haystack = `${p.id} ${p.title} ${p.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  // ---------- rendering ----------
  function badgeHtml(p) {
    const cls = p.difficulty === "Easy" ? "badge-easy" : "badge-medium";
    return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}">${p.difficulty}</span>`;
  }
  function statusDot(s) {
    const cls = s === "solved" ? "solved" : s === "attempted" ? "attempted" : "todo";
    const title = s === "solved" ? "Solved" : s === "attempted" ? "Attempted" : "Not started";
    return `<span class="status-dot ${cls}" title="${title}" aria-label="${title}"></span>`;
  }
  function renderRows() {
    const tbody = document.getElementById("problem-rows");
    const empty = document.getElementById("empty-state");
    const list = filteredProblems();

    if (list.length === 0) {
      tbody.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");

    tbody.innerHTML = list.map((p) => {
      const status = getProblemStatus(p.id);
      const tagChips = p.tags
        .map((t) => `<span class="chip !py-0.5 !text-[11px]">${t}</span>`)
        .join(" ");
      return `
        <tr class="problem-row" data-id="${p.id}">
          <td class="px-4 py-3 align-middle">${statusDot(status)}</td>
          <td class="px-4 py-3 align-middle font-mono text-xs text-muted">#${p.id}</td>
          <td class="px-4 py-3 align-middle">
            <a href="problem.html?id=${p.id}" class="font-medium text-text hover:text-brand">${p.title}</a>
          </td>
          <td class="px-4 py-3 align-middle">
            <div class="flex flex-wrap gap-1.5">${tagChips}</div>
          </td>
          <td class="px-4 py-3 align-middle">${badgeHtml(p)}</td>
          <td class="px-4 py-3 align-middle text-right font-mono text-sm text-muted">${p.marks}</td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll("tr.problem-row").forEach((row) => {
      row.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        location.href = `problem.html?id=${row.dataset.id}`;
      });
    });
  }

  function renderCategoryChips() {
    const wrap = document.getElementById("category-chips");
    const all = [{ label: "All", value: "" }, ...ALL_CATEGORIES.map((c) => ({ label: c, value: c }))];
    wrap.innerHTML = all
      .map((c) => `<button class="chip ${state.category === c.value ? "active" : ""}" data-category="${c.value}">${c.label}</button>`)
      .join("");
    wrap.querySelectorAll("button.chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.category = btn.dataset.category;
        document.getElementById("filter-category").value = state.category;
        renderCategoryChips();
        renderRows();
      });
    });
  }

  function populateCategorySelect() {
    const sel = document.getElementById("filter-category");
    ALL_CATEGORIES.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
  }

  function bindFilters() {
    document.getElementById("search").addEventListener("input", (e) => {
      state.search = e.target.value;
      renderRows();
    });
    document.getElementById("filter-difficulty").addEventListener("change", (e) => {
      state.difficulty = e.target.value;
      renderRows();
    });
    document.getElementById("filter-category").addEventListener("change", (e) => {
      state.category = e.target.value;
      renderCategoryChips();
      renderRows();
    });
    document.getElementById("filter-status").addEventListener("change", (e) => {
      state.status = e.target.value;
      renderRows();
    });
    document.getElementById("reset-progress").addEventListener("click", async () => {
      if (!confirm("Xoá toàn bộ tiến độ đã lưu trên server?")) return;
      try {
        await api.clearProgress();
        state.progress.clear();
        updateStats();
        renderRows();
      } catch (err) {
        alert("Không xoá được: " + err.message);
      }
    });
  }

  async function fetchProgress() {
    try {
      const rows = await api.listProgress();
      state.progress = new Map(rows.map((r) => [r.problem_id, r.status]));
    } catch (err) {
      console.error("Failed to load progress:", err);
    }
  }

  async function init() {
    initTheme();
    renderUser();
    populateCategorySelect();
    renderCategoryChips();
    bindFilters();
    renderRows();          // render immediately
    updateStats();
    await fetchProgress(); // then hydrate with real data
    renderRows();
    updateStats();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
