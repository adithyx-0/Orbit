"""Minimal mock of the PROSIT backend — for local agent testing only.
Accepts login and usage POSTs, prints received data, requires no database.
"""

import json
import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer

MOCK_TOKEN = "mock-jwt-token-for-testing"
received_records = []


class Handler(BaseHTTPRequestHandler):
    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length)) if length else {}

    def _send(self, code, body):
        data = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(data))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/health":
            self._send(200, {"status": "ok"})
        elif self.path == "/api/usage/received":
            self._send(200, {"records": received_records, "count": len(received_records)})
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        body = self._read_body()

        if self.path == "/api/auth/login":
            print(f"  [AUTH] login attempt: {body.get('email')}")
            self._send(200, {"token": MOCK_TOKEN, "user": {"id": 1, "email": body.get("email")}})

        elif self.path == "/api/auth/register":
            print(f"  [AUTH] register: {body.get('email')}")
            self._send(201, {"token": MOCK_TOKEN, "user": {"id": 1, "email": body.get("email")}})

        elif self.path == "/api/usage":
            auth = self.headers.get("Authorization", "")
            if not auth.startswith("Bearer "):
                self._send(401, {"error": "unauthorized"})
                return
            record = {**body, "received_at": datetime.datetime.now().isoformat()}
            received_records.append(record)
            print(f"  [USAGE] {body.get('app_name'):30s} | {body.get('category'):15s} | "
                  f"{body.get('minutes')} min | source={body.get('source')}")
            self._send(201, {"log": record})

        else:
            self._send(404, {"error": "not found"})

    def log_message(self, *_):
        pass  # suppress default access log noise


if __name__ == "__main__":
    server = HTTPServer(("localhost", 5001), Handler)
    print("Mock PROSIT backend running on http://localhost:5001")
    print("Endpoints: POST /api/auth/login  |  POST /api/usage  |  GET /api/usage/received\n")
    server.serve_forever()
