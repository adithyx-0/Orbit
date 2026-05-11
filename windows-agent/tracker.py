"""Tracks the active foreground window and accumulates usage time."""

from collections import defaultdict

import psutil
import win32gui
import win32process

from categorizer import should_skip


class WindowTracker:
    """Polls the active foreground window every poll_sec seconds.

    flush() returns a list of records ready to upload, each containing
    app_name, minutes, and the most-recently-seen window title (used by
    the categorizer to distinguish e.g. YouTube vs Gmail in Chrome).
    """

    def __init__(self, poll_sec: int = 5) -> None:
        self.poll_sec = poll_sec
        self._usage: dict[str, int] = defaultdict(int)   # app_name → seconds
        self._titles: dict[str, str] = {}                 # app_name → latest title
        self._current_date: str = _today()

    # ── internal ──────────────────────────────────────────────────────────────

    def _active_window(self) -> tuple[str, str]:
        """Return (process_name.lower(), window_title) for the foreground window."""
        try:
            hwnd = win32gui.GetForegroundWindow()
            if not hwnd:
                return '', ''
            title = win32gui.GetWindowText(hwnd) or ''
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            proc  = psutil.Process(pid)
            return proc.name().lower(), title
        except (psutil.NoSuchProcess, psutil.AccessDenied, OSError):
            return '', ''

    # ── public ────────────────────────────────────────────────────────────────

    def tick(self) -> bool:
        """Record one polling interval for the active window.

        Returns True if the calendar date just rolled over (caller should
        flush and upload the previous day's data before continuing).
        """
        today = _today()
        date_changed = today != self._current_date
        self._current_date = today

        app, title = self._active_window()
        if app and not should_skip(app):
            self._usage[app] += self.poll_sec
            self._titles[app] = title

        return date_changed

    def flush(self) -> list[dict]:
        """Return accumulated usage as a list of records and reset counters.

        Each record: {'app_name': str, 'minutes': int, 'title': str}
        Only apps with at least 1 full minute are included.
        """
        records = []
        for app, secs in self._usage.items():
            minutes = round(secs / 60)
            if minutes > 0:
                records.append({
                    'app_name': app,
                    'minutes':  minutes,
                    'title':    self._titles.get(app, ''),
                })
        self._usage.clear()
        self._titles.clear()
        return records

    def peek(self) -> list[dict]:
        """Return current accumulated minutes without resetting (for tray tooltip)."""
        return [
            {'app_name': app, 'minutes': round(secs / 60, 1), 'title': self._titles.get(app, '')}
            for app, secs in self._usage.items()
            if secs > 0
        ]


def _today() -> str:
    import datetime
    return datetime.date.today().isoformat()
