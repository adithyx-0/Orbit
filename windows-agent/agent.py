"""PROSIT Windows Desktop Agent

Tracks foreground window usage, categorizes it, and pushes aggregated
data to the PROSIT backend every UPLOAD_INTERVAL_MINUTES.
"""

import logging
import os
import sys
import time
import datetime

from dotenv import load_dotenv

from categorizer import categorize, load_custom
from tracker import WindowTracker
from uploader import Uploader

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S',
)
log = logging.getLogger('prosit')


def _require_env(key: str) -> str:
    val = os.getenv(key, '').strip()
    if not val:
        log.error('Missing required env var: %s  (check your .env file)', key)
        sys.exit(1)
    return val


def main() -> None:
    api_url  = os.getenv('API_URL', 'http://localhost:5000/api')
    email    = _require_env('USER_EMAIL')
    password = _require_env('USER_PASSWORD')
    upload_interval_min = int(os.getenv('UPLOAD_INTERVAL_MINUTES', '60'))
    poll_sec            = int(os.getenv('POLL_INTERVAL_SECONDS', '5'))

    load_custom('categories.json')

    tracker  = WindowTracker(poll_sec=poll_sec)
    uploader = Uploader(api_url, email, password)

    polls_per_upload = max(1, (upload_interval_min * 60) // poll_sec)
    poll_count = 0

    log.info('PROSIT agent started — polling every %ds, uploading every %d min',
             poll_sec, upload_interval_min)

    while True:
        tracker.tick()
        poll_count += 1

        if poll_count >= polls_per_upload:
            _do_upload(tracker, uploader, upload_interval_min)
            poll_count = 0

        time.sleep(poll_sec)


def _do_upload(tracker: WindowTracker, uploader: Uploader, interval_min: int) -> None:
    usage = tracker.flush()  # {app_name: minutes}
    if not usage:
        log.info('No usage recorded in the last %d min — skipping upload', interval_min)
        return

    records = [
        {'app_name': app, 'category': categorize(app), 'minutes': mins}
        for app, mins in usage.items()
    ]

    total_min = sum(r['minutes'] for r in records)
    log.info(
        'Uploading %d app(s), %d total minutes — %s',
        len(records), total_min,
        datetime.datetime.now().strftime('%Y-%m-%d'),
    )

    ok, fail = uploader.upload(records)

    if fail == 0:
        log.info('Upload complete: %d record(s) saved', ok)
    else:
        log.warning('Upload partial: %d ok, %d failed', ok, fail)


if __name__ == '__main__':
    main()
