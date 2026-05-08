from collections import defaultdict

import psutil
import win32gui
import win32process

from categorizer import should_skip


class WindowTracker:
    """Polls the active foreground window and accumulates seconds per process."""

    def __init__(self, poll_sec: int = 5) -> None:
        self.poll_sec = poll_sec
        self._usage: dict[str, int] = defaultdict(int)  # {app_name: seconds}

    def _active_app(self) -> str | None:
        try:
            hwnd = win32gui.GetForegroundWindow()
            if not hwnd:
                return None
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            proc = psutil.Process(pid)
            return proc.name().lower()
        except (psutil.NoSuchProcess, psutil.AccessDenied, OSError):
            return None

    def tick(self) -> None:
        """Record one polling interval for the currently active app."""
        app = self._active_app()
        if app and not should_skip(app):
            self._usage[app] += self.poll_sec

    def flush(self) -> dict[str, int]:
        """Return accumulated usage as {app_name: minutes} and reset the counters.

        Only apps with at least 1 full minute of usage are included.
        """
        result: dict[str, int] = {}
        for app, secs in self._usage.items():
            minutes = round(secs / 60)
            if minutes > 0:
                result[app] = minutes
        self._usage.clear()
        return result

    def peek(self) -> dict[str, float]:
        """Return current accumulated minutes without resetting (for debugging)."""
        return {app: round(secs / 60, 1) for app, secs in self._usage.items()}
