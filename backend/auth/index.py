"""Аутентификация: login, refresh, me, logout"""
import json
import os
import hashlib
import hmac
import base64
import time
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
JWT_SECRET = os.environ.get("JWT_SECRET", "geocontent-secret-key-change-in-prod")
ACCESS_TTL = 3600
REFRESH_TTL = 86400 * 30

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization",
}

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def make_jwt(payload: dict) -> str:
    header = b64url(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    body = b64url(json.dumps(payload).encode())
    sig = b64url(hmac.new(JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest())
    return f"{header}.{body}.{sig}"

def verify_jwt(token: str) -> dict | None:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, body, sig = parts
        expected = b64url(hmac.new(JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(base64.urlsafe_b64decode(body + "=="))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def get_db():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    conn.autocommit = True
    return conn

def check_password(plain: str, hashed: str) -> bool:
    import crypt as _crypt
    try:
        return _crypt.crypt(plain, hashed) == hashed
    except Exception:
        return hashlib.sha256(plain.encode()).hexdigest() == hashed

def handler(event: dict, context) -> dict:
    """Аутентификация пользователей: login, refresh, me"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}

    def resp(code, data):
        return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data)}

    # POST /login
    if path.endswith("/login") and method == "POST":
        body = json.loads(event.get("body") or "{}")
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, email, password_hash, role_name, is_active FROM {SCHEMA}.users WHERE email=%s", (email,))
        row = cur.fetchone()
        conn.close()
        if not row or not row[4]:
            return resp(401, {"error": "Invalid credentials"})
        uid, uemail, phash, role, _ = row
        if not check_password(password, phash):
            return resp(401, {"error": "Invalid credentials"})
        now = int(time.time())
        access = make_jwt({"sub": str(uid), "email": uemail, "role": role, "type": "access", "iat": now, "exp": now + ACCESS_TTL})
        refresh = make_jwt({"sub": str(uid), "type": "refresh", "iat": now, "exp": now + REFRESH_TTL})
        return resp(200, {"access_token": access, "refresh_token": refresh, "token_type": "bearer", "user": {"id": str(uid), "email": uemail, "role": role}})

    # POST /refresh
    if path.endswith("/refresh") and method == "POST":
        body = json.loads(event.get("body") or "{}")
        token = body.get("refresh_token", "")
        payload = verify_jwt(token)
        if not payload or payload.get("type") != "refresh":
            return resp(401, {"error": "Invalid refresh token"})
        uid = payload["sub"]
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, email, role_name, is_active FROM {SCHEMA}.users WHERE id=%s", (uid,))
        row = cur.fetchone()
        conn.close()
        if not row or not row[3]:
            return resp(401, {"error": "User not found"})
        _, uemail, role, _ = row
        now = int(time.time())
        access = make_jwt({"sub": uid, "email": uemail, "role": role, "type": "access", "iat": now, "exp": now + ACCESS_TTL})
        return resp(200, {"access_token": access, "token_type": "bearer"})

    # GET /me
    if path.endswith("/me") and method == "GET":
        token = (headers.get("x-authorization") or headers.get("authorization") or "").replace("Bearer ", "").replace("bearer ", "")
        payload = verify_jwt(token)
        if not payload or payload.get("type") != "access":
            return resp(401, {"error": "Unauthorized"})
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, email, role_name, is_active, created_at FROM {SCHEMA}.users WHERE id=%s", (payload["sub"],))
        row = cur.fetchone()
        conn.close()
        if not row:
            return resp(404, {"error": "Not found"})
        return resp(200, {"id": str(row[0]), "email": row[1], "role": row[2], "is_active": row[3], "created_at": str(row[4])})

    return resp(404, {"error": "Not found"})
