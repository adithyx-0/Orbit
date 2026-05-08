import datetime
import logging

import requests

log = logging.getLogger(__name__)


class Uploader:
    """Authenticates with the PROSIT backend and pushes usage records."""

    def __init__(self, api_url: str, email: str, password: str) -> None:
        self.api_url = api_url.rstrip('/')
        self.email = email
        self.password = password
        self._token: str | None = None

    def _login(self) -> None:
        resp = requests.post(
            f'{self.api_url}/auth/login',
            json={'email': self.email, 'password': self.password},
            timeout=15,
        )
        resp.raise_for_status()
        self._token = resp.json()['token']
        log.info('Authenticated as %s', self.email)

    def _auth_headers(self) -> dict[str, str]:
        if not self._token:
            self._login()
        return {'Authorization': f'Bearer {self._token}'}

    def _post_record(self, record: dict, date: str) -> None:
        payload = {
            'date': date,
            'category': record['category'],
            'minutes': record['minutes'],
            'app_name': record['app_name'],
            'source': 'windows',
        }
        resp = requests.post(
            f'{self.api_url}/usage',
            json=payload,
            headers=self._auth_headers(),
            timeout=15,
        )
        if resp.status_code == 401:
            # Token expired — re-login and retry once
            self._token = None
            self._login()
            resp = requests.post(
                f'{self.api_url}/usage',
                json=payload,
                headers=self._auth_headers(),
                timeout=15,
            )
        resp.raise_for_status()

    def upload(self, records: list[dict]) -> tuple[int, int]:
        """Upload a list of {app_name, category, minutes} records.

        Returns (success_count, fail_count).
        """
        if not records:
            return 0, 0

        date = datetime.date.today().isoformat()
        success, fail = 0, 0

        for record in records:
            try:
                self._post_record(record, date)
                success += 1
                log.debug(
                    'Uploaded: %s — %s min (%s)',
                    record['app_name'], record['minutes'], record['category'],
                )
            except requests.RequestException as exc:
                fail += 1
                log.warning('Failed to upload %s: %s', record['app_name'], exc)

        return success, fail
