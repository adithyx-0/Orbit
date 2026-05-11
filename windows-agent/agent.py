"""Prosit Windows Desktop Agent

Tracks foreground window usage, categorizes it, and pushes aggregated
data to the Prosit backend every UPLOAD_INTERVAL_MINUTES.

Runs a system-tray icon so you can see sync status and exit cleanly
without needing to kill the console window.
"""

import datetime
import logging
import os
import sys
import threading
import time

from dotenv import load_dotenv

from categorizer import categorize, load_custom
from tracker import WindowTracker
from uploader import Uploader

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('prosit_agent.log', encoding='utf-8'),
    ],
)
log = logging.getLogger('prosit')


# ── Tray icon ─────────────────────────────────────────────────────────────────

def _make_tray_image():
    """Create a purple rounded-square icon with a white 'P'."""
    try:
        from PIL import Image, ImageDraw, ImageFont
        size = 64
        img  = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        draw.rounded_rectangle([2, 2, size - 2, size - 2], radius=14, fill='#4F46E5')
        try:
            font = ImageFont.truetype('arialbd.ttf', 38)
        except OSError:
            font = ImageFont.load_default()
        draw.text((size // 2, size // 2), 'P', fill='white', font=font, anchor='mm')
        return img
    except ImportError:
        return None


def _build_tray(state: dict, tracker: WindowTracker, uploader: Uploader,
                upload_fn) -> object | None:
    """Build and return a pystray.Icon, or None if pystray isn't installed."""
    try:
        import pystray
        from pystray import MenuItem, Menu

        img = _make_tray_image()
        if img is None:
            return None

        def status_label(icon, item):
            last = state.get('last_sync', 'Never')
            queued = uploader.queued_count
            q_str = f'  ({queued} queued)' if queued else ''
            return f'Last sync: {last}{q_str}'

        def on_upload_now(icon, item):
            log.info('Manual upload triggered from tray')
            state['force_upload'] = True

        def on_open_log(icon, item):
            os.startfile(os.path.abspath('prosit_agent.log'))

        def on_exit(icon, item):
            log.info('Exit requested from tray — uploading remaining data…')
            upload_fn(tracker, uploader, force=True)
            state['running'] = False
            icon.stop()

        icon = pystray.Icon(
            'prosit',
            img,
            'Prosit Agent',
            menu=Menu(
                MenuItem('Prosit Agent', None, enabled=False),
                MenuItem(status_label, None, enabled=False),
                Menu.SEPARATOR,
                MenuItem('Upload now', on_upload_now),
                MenuItem('Open log', on_open_log),
                Menu.SEPARATOR,
                MenuItem('Exit', on_exit),
            ),
        )
        return icon

    except ImportError:
        log.info('pystray not installed — running without system tray')
        return None


# ── Upload helper ─────────────────────────────────────────────────────────────

def _do_upload(tracker: WindowTracker, uploader: Uploader,
               interval_min: int = 0, date: str | None = None,
               force: bool = False) -> None:
    records = tracker.flush()
    if not records and not force and uploader.queued_count == 0:
        if interval_min:
            log.info('No usage in last %d min — skipping upload', interval_min)
        return

    # Attach category (title-aware)
    for r in records:
        r['category'] = categorize(r['app_name'], r.get('title', ''))

    total_min = sum(r['minutes'] for r in records)
    if records:
        log.info(
            'Uploading %d app(s), %d total minutes — %s',
            len(records), total_min,
            date or datetime.date.today().isoformat(),
        )

    ok, fail = uploader.upload(records, date=date)

    if fail == 0:
        log.info('Upload complete: %d record(s) saved', ok)
    else:
        log.warning('Upload partial: %d ok, %d failed/queued', ok, fail)


# ── Tracking loop (runs in background thread) ─────────────────────────────────

def _tracking_loop(tracker: WindowTracker, uploader: Uploader,
                   poll_sec: int, upload_interval_min: int,
                   state: dict) -> None:
    polls_per_upload = max(1, (upload_interval_min * 60) // poll_sec)
    poll_count = 0

    log.info(
        'Tracking loop started — polling every %ds, uploading every %d min',
        poll_sec, upload_interval_min,
    )

    while state.get('running', True):
        date_changed = tracker.tick()
        poll_count  += 1

        # Upload previous day's data immediately when date rolls over
        if date_changed:
            yesterday = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
            log.info('Date changed — uploading yesterday (%s) data', yesterday)
            _do_upload(tracker, uploader, date=yesterday)
            poll_count = 0
            state['last_sync'] = datetime.datetime.now().strftime('%H:%M')

        # Scheduled periodic upload
        elif poll_count >= polls_per_upload or state.pop('force_upload', False):
            _do_upload(tracker, uploader, interval_min=upload_interval_min)
            poll_count = 0
            state['last_sync'] = datetime.datetime.now().strftime('%H:%M')

        time.sleep(poll_sec)


# ── Entry point ───────────────────────────────────────────────────────────────

def _require_env(key: str) -> str:
    val = os.getenv(key, '').strip()
    if not val:
        log.error('Missing required env var: %s  (check your .env file)', key)
        sys.exit(1)
    return val


def main() -> None:
    api_url             = os.getenv('API_URL', 'http://localhost:5000/api')
    email               = _require_env('USER_EMAIL')
    password            = _require_env('USER_PASSWORD')
    upload_interval_min = int(os.getenv('UPLOAD_INTERVAL_MINUTES', '60'))
    poll_sec            = int(os.getenv('POLL_INTERVAL_SECONDS', '5'))

    load_custom('categories.json')

    tracker  = WindowTracker(poll_sec=poll_sec)
    uploader = Uploader(api_url, email, password)

    state: dict = {'running': True, 'last_sync': 'Never', 'force_upload': False}

    # Build upload closure for tray exit handler
    def upload_fn(t, u, force=False):
        _do_upload(t, u, force=force)

    # Start tracking in background thread
    bg = threading.Thread(
        target=_tracking_loop,
        args=(tracker, uploader, poll_sec, upload_interval_min, state),
        daemon=True,
    )
    bg.start()

    # Try to run system tray (blocks main thread on Windows)
    icon = _build_tray(state, tracker, uploader, upload_fn)
    if icon:
        log.info('System tray icon active — right-click the tray for options')
        icon.run()           # blocks until Exit is clicked
    else:
        # No tray — just keep main thread alive
        log.info('Press Ctrl+C to stop and upload remaining data')
        try:
            while state['running']:
                time.sleep(1)
        except KeyboardInterrupt:
            log.info('Interrupted — uploading remaining data…')
            _do_upload(tracker, uploader, force=True)
            log.info('Done. Goodbye.')


if __name__ == '__main__':
    main()
