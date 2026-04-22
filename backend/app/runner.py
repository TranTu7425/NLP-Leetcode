"""Execute user-submitted Python code in a sandboxed subprocess.

Hardening applied:
  - separate non-root user (uid 10001) via `su` if available
  - RLIMIT_AS / RLIMIT_CPU / RLIMIT_CORE via preexec_fn (Linux)
  - wallclock timeout via subprocess.run(timeout=...)
  - isolated temp directory as cwd + HOME
  - scrubbed environment (no secrets exposed)

This is NOT a full sandbox — do not expose the API to untrusted internet
traffic without adding a proper isolation layer (nsjail, firejail, gVisor, etc).
"""

import os
import pwd
import resource
import subprocess
import tempfile
import time
from typing import Any

from .config import settings


def _limit_resources() -> None:
    """Run in the child after fork, before exec. Linux only."""
    mem_bytes = settings.exec_mem_mb * 1024 * 1024
    try:
        resource.setrlimit(resource.RLIMIT_AS, (mem_bytes, mem_bytes))
    except (ValueError, OSError):
        pass
    try:
        cpu_cap = settings.exec_timeout_s + 2
        resource.setrlimit(resource.RLIMIT_CPU, (cpu_cap, cpu_cap))
    except (ValueError, OSError):
        pass
    try:
        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    except (ValueError, OSError):
        pass
    try:
        resource.setrlimit(resource.RLIMIT_NPROC, (64, 64))
    except (ValueError, OSError):
        pass

    # Drop privileges to the sandbox user if we're running as root
    if os.geteuid() == 0:
        try:
            entry = pwd.getpwnam(settings.exec_user)
            os.setgroups([])
            os.setgid(entry.pw_gid)
            os.setuid(entry.pw_uid)
        except Exception:
            pass


def run_python(code: str) -> dict[str, Any]:
    start = time.monotonic()

    with tempfile.TemporaryDirectory(prefix="nlp_run_") as tmp:
        # World-writable so we can drop privileges and still write output
        os.chmod(tmp, 0o777)
        code_path = os.path.join(tmp, "main.py")
        with open(code_path, "w", encoding="utf-8") as fh:
            fh.write(code)
        os.chmod(code_path, 0o644)

        env = {
            "PATH": "/usr/local/bin:/usr/bin:/bin",
            "LANG": "C.UTF-8",
            "LC_ALL": "C.UTF-8",
            "PYTHONUNBUFFERED": "1",
            "PYTHONDONTWRITEBYTECODE": "1",
            "NLTK_DATA": os.environ.get("NLTK_DATA", "/usr/share/nltk_data"),
            "HOME": tmp,
            "TMPDIR": tmp,
        }

        try:
            result = subprocess.run(
                ["python", code_path],
                cwd=tmp,
                env=env,
                timeout=settings.exec_timeout_s,
                capture_output=True,
                text=True,
                preexec_fn=_limit_resources if os.name == "posix" else None,
            )
            status_s = "ok" if result.returncode == 0 else "error"
            stdout = (result.stdout or "")[-50_000:]
            stderr = (result.stderr or "")[-10_000:]
            return {
                "stdout": stdout,
                "stderr": stderr,
                "status": status_s,
                "duration_ms": int((time.monotonic() - start) * 1000),
            }
        except subprocess.TimeoutExpired as err:
            out = err.stdout or b""
            if isinstance(out, bytes):
                out = out.decode("utf-8", errors="replace")
            return {
                "stdout": out[-50_000:],
                "stderr": f"TimeoutError: code ran longer than {settings.exec_timeout_s}s",
                "status": "timeout",
                "duration_ms": int((time.monotonic() - start) * 1000),
            }
        except Exception as err:  # infrastructure failure
            return {
                "stdout": "",
                "stderr": f"Runner error: {err}",
                "status": "error",
                "duration_ms": int((time.monotonic() - start) * 1000),
            }
