/* Individual problem page: CodeMirror editor + backend /api/run + tabs + progress. */

(function () {
  const THEME_KEY = "nlp-leetcode:theme";
  const CODE_KEY = (id) => `nlp-leetcode:code:${id}`;
  const NOTES_KEY = (id) => `nlp-leetcode:notes:${id}`;

  // Apply saved theme early
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  document.documentElement.classList.toggle("dark", savedTheme !== "light");
  document.documentElement.classList.toggle("light", savedTheme === "light");

  if (!api.requireAuth()) return;

  // ---------- problem selection ----------
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get("id") || "1", 10);
  const index = PROBLEMS.findIndex((p) => p.id === id);
  const problem = PROBLEMS[index] || PROBLEMS[0];

  // ---------- header fill ----------
  document.title = `#${problem.id} · ${problem.title} — NLP LeetCode`;
  document.getElementById("breadcrumb").textContent = `#${problem.id} / ${problem.tags[0] || ""}`;
  document.getElementById("problem-title").textContent = `${problem.id}. ${problem.title}`;

  const diffEl = document.getElementById("problem-difficulty");
  diffEl.textContent = problem.difficulty;
  diffEl.classList.add(problem.difficulty === "Easy" ? "badge-easy" : "badge-medium");

  document.getElementById("problem-marks").textContent = `${problem.marks} marks`;
  document.getElementById("problem-tags").innerHTML = problem.tags.map((t) => `<span class="chip">${t}</span>`).join("");
  document.getElementById("problem-description").innerHTML = problem.description;
  document.getElementById("problem-input").textContent = problem.input;
  document.getElementById("problem-output").textContent = problem.output;

  // The legacy libraryNotice was for Pyodide. Backend has nltk/spacy/gensim,
  // so we no longer need to warn about them. Keep the DOM node for layout.

  // ---------- user chip & logout ----------
  (function renderUser() {
    const user = api.getUser();
    if (!user) return;
    document.getElementById("user-chip").classList.remove("hidden");
    document.getElementById("user-name").textContent = user.username;
    document.getElementById("user-avatar").textContent = (user.username[0] || "?").toUpperCase();
    const btn = document.getElementById("logout-btn");
    btn.classList.remove("hidden");
    btn.addEventListener("click", () => {
      api.clearAuth();
      location.href = "login.html";
    });
  })();

  // ---------- runner status indicator ----------
  function setRunnerStatus(label, tone = "ready") {
    const wrap = document.getElementById("runner-status");
    const dot = document.getElementById("runner-dot");
    const lbl = document.getElementById("runner-label");
    wrap.classList.remove("hidden");
    lbl.textContent = label;
    dot.classList.remove("bg-muted", "bg-medium", "bg-brand", "bg-hard");
    dot.classList.add(
      tone === "ready" ? "bg-brand" :
      tone === "running" ? "bg-medium" :
      tone === "error" ? "bg-hard" : "bg-muted"
    );
  }
  setRunnerStatus("Runner: ready", "ready");

  // ---------- prev/next ----------
  const prev = PROBLEMS[(index - 1 + PROBLEMS.length) % PROBLEMS.length];
  const next = PROBLEMS[(index + 1) % PROBLEMS.length];
  document.getElementById("prev-problem").addEventListener("click", () => {
    location.href = `problem.html?id=${prev.id}`;
  });
  document.getElementById("next-problem").addEventListener("click", () => {
    location.href = `problem.html?id=${next.id}`;
  });

  // ---------- tabs ----------
  function switchTab(tab) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      const active = btn.dataset.tab === tab;
      btn.classList.toggle("border-brand", active);
      btn.classList.toggle("text-text", active);
      btn.classList.toggle("border-transparent", !active);
      btn.classList.toggle("text-muted", !active);
    });
    ["description", "solution", "notes"].forEach((name) => {
      document.getElementById(`tab-${name}`).classList.toggle("hidden", name !== tab);
    });
  }
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // ---------- solution reveal ----------
  document.getElementById("solution-code").textContent = problem.solution;
  if (problem.explanation) {
    document.getElementById("solution-explanation").innerHTML = problem.explanation;
  }
  document.getElementById("reveal-solution").addEventListener("click", () => {
    document.getElementById("solution-gate").classList.add("hidden");
    document.getElementById("solution-body").classList.remove("hidden");
  });
  document.getElementById("copy-solution").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(problem.solution);
      flashStatus("Solution copied");
    } catch {
      flashStatus("Copy failed", true);
    }
  });
  document.getElementById("load-into-editor").addEventListener("click", () => {
    if (confirm("Replace your current code with the reference solution?")) {
      editor.setValue(problem.solution);
    }
  });

  // ---------- CodeMirror editor ----------
  const textarea = document.getElementById("code-editor");
  const savedCode = localStorage.getItem(CODE_KEY(problem.id));
  textarea.value = savedCode || problem.starter;

  const editor = CodeMirror.fromTextArea(textarea, {
    mode: { name: "python", version: 3, singleLineStringErrors: false },
    theme: "material-darker",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    lineWrapping: false,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: {
      "Ctrl-Enter": () => runCode(),
      "Cmd-Enter": () => runCode(),
      "Ctrl-/": "toggleComment",
      "Cmd-/": "toggleComment",
      Tab: (cm) => cm.replaceSelection("    ", "end"),
    },
  });
  editor.on("change", debounce(() => {
    localStorage.setItem(CODE_KEY(problem.id), editor.getValue());
  }, 300));

  document.getElementById("reset-code").addEventListener("click", () => {
    if (confirm("Reset to starter code?")) editor.setValue(problem.starter);
  });
  document.getElementById("format-code").addEventListener("click", () => {
    const cleaned = editor
      .getValue()
      .split("\n")
      .map((l) => l.replace(/[ \t]+$/g, ""))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    editor.setValue(cleaned);
  });

  // ---------- notes ----------
  const notesArea = document.getElementById("notes-area");
  notesArea.value = localStorage.getItem(NOTES_KEY(problem.id)) || "";
  notesArea.addEventListener("input", debounce(() => {
    localStorage.setItem(NOTES_KEY(problem.id), notesArea.value);
    document.getElementById("notes-status").textContent = "Saved · " + new Date().toLocaleTimeString();
  }, 250));

  // ---------- Run / Submit ----------
  const runBtn = document.getElementById("run-code");
  const submitBtn = document.getElementById("submit-code");
  const consoleEl = document.getElementById("console-output");
  const testResultEl = document.getElementById("test-result");
  const runStatus = document.getElementById("run-status");

  function showRunStatus(msg) { runStatus.textContent = msg; }

  function showTestResult(kind, title, body) {
    const colorMap = {
      success: "border-brand/40 bg-brand/10 text-brand",
      fail: "border-hard/40 bg-hard/10 text-hard",
      info: "border-medium/40 bg-medium/10 text-medium",
    };
    testResultEl.className = `rounded-xl border p-4 text-sm ${colorMap[kind]}`;
    testResultEl.classList.remove("hidden");
    testResultEl.innerHTML = `<p class="font-semibold">${title}</p><div class="mt-1 text-text/90">${body}</div>`;
  }

  async function runCode() {
    runBtn.disabled = true;
    submitBtn.disabled = true;
    showRunStatus("Running…");
    setRunnerStatus("Runner: running…", "running");
    consoleEl.textContent = "";
    testResultEl.classList.add("hidden");

    // Mark attempted (fire-and-forget)
    api.saveProgress(problem.id, "attempted", editor.getValue()).catch(() => {});

    let result;
    try {
      result = await api.runCode(editor.getValue(), problem.id);
    } catch (err) {
      consoleEl.textContent = String(err.message || err);
      showRunStatus("Request failed");
      setRunnerStatus("Runner: offline", "error");
      runBtn.disabled = false;
      submitBtn.disabled = false;
      return null;
    }

    const { stdout, stderr, status, duration_ms } = result;
    if (status === "ok") {
      consoleEl.textContent = stdout || "(no output)";
      showRunStatus(`Done in ${duration_ms} ms`);
      setRunnerStatus("Runner: ready", "ready");
    } else if (status === "timeout") {
      consoleEl.textContent = (stdout ? stdout + "\n" : "") + stderr;
      showRunStatus("Timeout");
      setRunnerStatus("Runner: timeout", "error");
    } else {
      consoleEl.textContent = (stdout ? stdout + "\n" : "") + stderr;
      showRunStatus("Error");
      setRunnerStatus("Runner: error", "error");
      showTestResult("fail", "Runtime error", "Xem console bên dưới để biết traceback.");
    }
    runBtn.disabled = false;
    submitBtn.disabled = false;
    return result;
  }

  function normalize(s) {
    return (s || "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+$/gm, "")
      .replace(/\n+$/g, "")
      .trim();
  }

  async function submitCode() {
    const result = await runCode();
    if (!result || result.status !== "ok") return;

    if (!problem.tests || problem.tests.length === 0) {
      showTestResult(
        "info",
        "Không có auto-grader cho bài này",
        "Đối chiếu output với reference solution rồi đánh dấu thủ công nếu khớp."
      );
      return;
    }

    const expected = problem.tests[0].stdout;
    if (normalize(result.stdout) === normalize(expected)) {
      try { await api.saveProgress(problem.id, "solved", editor.getValue()); } catch {}
      showTestResult(
        "success",
        "Accepted",
        `Output khớp với expected. Nice work on <strong>#${problem.id}</strong>!`
      );
    } else {
      showTestResult(
        "fail",
        "Wrong answer",
        `<div class="mt-2 grid gap-3 sm:grid-cols-2"><div><p class="mb-1 text-xs font-semibold uppercase">Your output</p><pre class="max-h-40 overflow-auto rounded-md border border-border bg-surface/60 p-2 font-mono text-xs text-text">${escapeHtml(result.stdout) || "(empty)"}</pre></div><div><p class="mb-1 text-xs font-semibold uppercase">Expected</p><pre class="max-h-40 overflow-auto rounded-md border border-border bg-surface/60 p-2 font-mono text-xs text-text">${escapeHtml(expected)}</pre></div></div>`
      );
    }
  }

  runBtn.addEventListener("click", runCode);
  submitBtn.addEventListener("click", submitCode);
  document.getElementById("clear-console").addEventListener("click", () => {
    consoleEl.textContent = "";
    testResultEl.classList.add("hidden");
  });

  // ---------- helpers ----------
  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function flashStatus(msg, isError = false) {
    runStatus.textContent = msg;
    runStatus.classList.toggle("text-hard", !!isError);
    runStatus.classList.toggle("text-brand", !isError);
    setTimeout(() => {
      runStatus.textContent = "";
      runStatus.classList.remove("text-hard", "text-brand");
    }, 1800);
  }

  // ---------- hydrate previous code from server ----------
  (async function loadServerCode() {
    if (savedCode) return; // local draft wins
    try {
      const rows = await api.listProgress();
      const mine = rows.find((r) => r.problem_id === problem.id);
      if (mine && mine.code) editor.setValue(mine.code);
    } catch {
      /* non-fatal */
    }
  })();
})();
