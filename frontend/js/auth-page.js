/* Handles the login + register forms. */

(function () {
  // If already logged in, bounce to index (or ?next=)
  if (api.isAuthenticated()) {
    const next = new URLSearchParams(location.search).get("next");
    location.replace(next && next.startsWith("/") ? next : "index.html");
    return;
  }

  const form = document.querySelector("form");
  if (!form) return;

  const errBox = document.getElementById("form-error");
  const submitBtn = document.getElementById("submit-btn");
  const btnLabel = submitBtn.querySelector(".btn-label");
  const isRegister = form.id === "register-form";

  function showError(msg) {
    errBox.textContent = msg;
    errBox.classList.remove("hidden");
  }
  function clearError() {
    errBox.textContent = "";
    errBox.classList.add("hidden");
  }
  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnLabel.textContent = isLoading
      ? (isRegister ? "Creating..." : "Signing in...")
      : (isRegister ? "Create account" : "Sign in");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    let result;
    setLoading(true);
    try {
      if (isRegister) {
        const username = form.username.value.trim();
        const confirm = form.confirm.value;
        if (password !== confirm) {
          showError("Password xác nhận không khớp.");
          setLoading(false);
          return;
        }
        if (!/^[A-Za-z0-9_.\-]{3,32}$/.test(username)) {
          showError("Username chỉ gồm chữ, số, _ . - (3–32 ký tự).");
          setLoading(false);
          return;
        }
        result = await api.register(email, username, password);
      } else {
        result = await api.login(email, password);
      }
    } catch (err) {
      showError(err.message || "Đã có lỗi xảy ra.");
      setLoading(false);
      return;
    }

    api.setAuth(result.access_token, result.user);
    const next = new URLSearchParams(location.search).get("next");
    location.replace(next && next.startsWith("/") ? next : "index.html");
  });
})();
