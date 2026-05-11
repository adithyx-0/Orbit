"""Authenticates with the Prosit backend and pushes usage records.

Failed records are saved to queue.json and retried on the next upload cycle
so no data is lost when the network is temporarily unavailable.
"""

import datetime
import json
import logging
import os

import requests

log = logging.getLogger(__name__)

QUEUE_FILE = os.path.join(os.path.dirname(__file__), 'queue.json')


class Uploader:

    def __init__(self, api_url: str, email: str, password: str) -> None:
        self.api_url  = api_url.rstrip('/')
        self.email    = email
        self.password = password
        self._token: str | None = None

    # ── Auth ──────────────────────────────────────────────────────────────────

    def _login(self) -> None:
        resp = requests.post(
            f'{self.api_url}/auth/login',
            json={'email': self.email, 'password': self.password},
            timeout=15,
        )
        resp.raise_for_status()
        self._token = resp.json()['token']
        log.info('Authenticated as %s', self.email)

    def _headers(self) -> dict[str, str]:
        if not self._token:
            self._login()
        return {'Authorization': f'Bearer {self._token}'}

    # ── Single record ─────────────────────────────────────────────────────────

    def _post(self, payload: dict) -> None:
        resp = requests.post(
            f'{self.api_url}/usage',
            json=payload,
            headers=self._headers(),
            timeout=15,
        )
        if resp.status_code == 401:
            self._token = None
            self._login()
            resp = requests.post(
                f'{self.api_url}/usage',
                json=payload,
                headers=self._headers(),
                timeout=15,
            )
        resp.raise_for_status()

    # ── Offline queue ─────────────────────────────────────────────────────────

    def _load_queue(self) -> list[dict]:
        try:
            if os.path.exists(QUEUE_FILE):
                with open(QUEUE_FILE, encoding='utf-8') as f:
                    return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
        return []

    def _save_queue(self, items: list[dict]) -> None:
        try:
            with open(QUEUE_FILE, 'w', encoding='utf-8') as f:
                json.dump(items, f, indent=2)
        except OSError as e:
            log.warning('Could not write queue file: %s', e)

    def _clear_queue(self) -> None:
        try:
            if os.path.exists(QUEUE_FILE):
                os.remove(QUEUE_FILE)
        except OSError:
            pass

    # ── Public ────────────────────────────────────────────────────────────────

    def upload(self, records: list[dict], date: str | None = None) -> tuple[int, int]:
        """Upload records + any previously-queued records.

        Each record: {'app_name': str, 'category': str, 'minutes': int}
        Returns (success_count, fail_count).
        """
        if date is None:
            date = datetime.date.today().isoformat()

        # Build payloads for this batch
        new_payloads = [
            {
                'date':     date,
                'category': r['category'],
                'minutes':  r['minutes'],
                'app_name': r['app_name'],
                'source':   'windows',
            }
            for r in records
        ]

        # Prepend any previously-queued payloads
        queued = self._load_queue()
        all_payloads = queued + new_payloads

        if not all_payloads:
            return 0, 0

        success, fail = 0, 0
        still_queued: list[dict] = []

        for payload in all_payloads:
            try:
                self._post(payload)
                success += 1
                log.debug(
                    'Uploaded: %-30s | %-15s | %d min',
                    payload['app_name'], payload['category'], payload['minutes'],
                )
            except requests.RequestException as exc:
                fail += 1
                log.warning('Failed to upload %s: %s — queued for retry', payload['app_name'], exc)
                still_queued.append(payload)

        if still_queued:
            self._save_queue(still_queued)
            log.info('Queued %d record(s) for next retry', len(still_queued))
        else:
            self._clear_queue()

        return success, fail

    @property
    def queued_count(self) -> int:
        return len(self._load_queue())
