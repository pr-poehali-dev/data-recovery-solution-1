"""Настройки: площадки, промпты, app_settings, дашборд GEO-метрики"""
import json
import os
import time
import random
import hashlib
import hmac
import base64
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
JWT_SECRET = os.environ.get("JWT_SECRET", "geocontent-secret-key-change-in-prod")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization",
}

def b64url_decode(s):
    s += "=="
    return base64.urlsafe_b64decode(s)

def verify_jwt(token: str):
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, body, sig = parts
        expected = base64.urlsafe_b64encode(
            hmac.new(JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()
        ).rstrip(b"=").decode()
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(b64url_decode(body))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def get_db():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    conn.autocommit = True
    return conn

def resp(code, data):
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, default=str)}

def auth_user(event):
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    token = (headers.get("x-authorization") or headers.get("authorization") or "").replace("Bearer ", "").replace("bearer ", "")
    return verify_jwt(token)

def handler(event: dict, context) -> dict:
    """Настройки площадок, промптов, app_settings и GEO-метрики дашборда"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")

    user = auth_user(event)
    if not user:
        return resp(401, {"error": "Unauthorized"})

    conn = get_db()
    cur = conn.cursor()

    try:
        # GET /dashboard — статистика и GEO-метрики
        if path.endswith("/dashboard") and method == "GET":
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.articles")
            total_articles = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.articles WHERE status='published'")
            published = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.articles WHERE status='approved'")
            approved = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.articles WHERE status='draft'")
            drafts = cur.fetchone()[0]
            cur.execute(f"SELECT AVG(geo_rating) FROM {SCHEMA}.articles WHERE geo_rating IS NOT NULL")
            avg_geo = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.content_tasks")
            total_tasks = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.content_tasks WHERE status='new'")
            pending_tasks = cur.fetchone()[0]
            cur.execute(f"SELECT platform, COUNT(*) as cnt FROM {SCHEMA}.articles GROUP BY platform")
            by_platform = {row[0]: row[1] for row in cur.fetchall()}

            # Мок GEO-метрики цитируемости
            geo_metrics = {
                "citation_rate": round(random.uniform(2.1, 8.7), 1),
                "voice_share": round(random.uniform(12, 34), 1),
                "sentiment_positive": round(random.uniform(70, 92), 1),
                "llm_mentions_week": random.randint(15, 87),
                "trend": random.choice(["up", "up", "stable"]),
            }

            return resp(200, {
                "articles": {"total": total_articles, "published": published, "approved": approved, "drafts": drafts, "by_platform": by_platform},
                "tasks": {"total": total_tasks, "pending": pending_tasks},
                "avg_geo_rating": float(avg_geo) if avg_geo else 0,
                "geo_metrics": geo_metrics,
            })

        # GET /platforms — список настроек площадок
        if path.endswith("/platforms") and method == "GET":
            cur.execute(f"SELECT id, platform, is_mock, extra_config, created_at, updated_at FROM {SCHEMA}.platform_settings ORDER BY platform")
            rows = cur.fetchall()
            cols = ["id","platform","is_mock","extra_config","created_at","updated_at"]
            return resp(200, [dict(zip(cols, [str(v) if v is not None else None for v in r])) for r in rows])

        # PUT /platforms/{platform} — обновить настройки площадки (только admin)
        if "/platforms/" in path and method == "PUT":
            if user.get("role") != "admin":
                return resp(403, {"error": "Forbidden"})
            platform = path.split("/platforms/")[-1].split("/")[0]
            body = json.loads(event.get("body") or "{}")
            is_mock = body.get("is_mock", True)
            extra = body.get("extra_config", {})
            cur.execute(f"""
                UPDATE {SCHEMA}.platform_settings SET is_mock=%s, extra_config=%s, updated_at=NOW() WHERE platform=%s
            """, (is_mock, json.dumps(extra), platform))
            return resp(200, {"updated": True, "platform": platform})

        # GET /app-settings
        if path.endswith("/app-settings") and method == "GET":
            cur.execute(f"SELECT key, value FROM {SCHEMA}.app_settings ORDER BY key")
            rows = cur.fetchall()
            return resp(200, {r[0]: r[1] for r in rows})

        # PUT /app-settings — обновить настройки (только admin)
        if path.endswith("/app-settings") and method == "PUT":
            if user.get("role") != "admin":
                return resp(403, {"error": "Forbidden"})
            body = json.loads(event.get("body") or "{}")
            for k, v in body.items():
                cur.execute(f"""
                    UPDATE {SCHEMA}.app_settings SET value=%s, updated_at=NOW() WHERE key=%s
                """, (str(v), k))
                if cur.rowcount == 0:
                    cur.execute(f"INSERT INTO {SCHEMA}.app_settings (key, value) VALUES (%s,%s)", (k, str(v)))
            return resp(200, {"updated": True})

        # GET /prompt-templates
        if path.endswith("/prompt-templates") and method == "GET":
            cur.execute(f"SELECT id, name, platform, template, is_active, created_at FROM {SCHEMA}.prompt_templates ORDER BY name")
            rows = cur.fetchall()
            cols = ["id","name","platform","template","is_active","created_at"]
            return resp(200, [dict(zip(cols, [str(v) if v is not None else None for v in r])) for r in rows])

        # PUT /prompt-templates/{id}
        if "/prompt-templates/" in path and method == "PUT":
            if user.get("role") != "admin":
                return resp(403, {"error": "Forbidden"})
            tmpl_id = path.split("/prompt-templates/")[-1]
            body = json.loads(event.get("body") or "{}")
            fields = []
            args = []
            for f in ["name","platform","template","is_active"]:
                if f in body:
                    fields.append(f"{f}=%s")
                    args.append(body[f])
            if fields:
                args.append(tmpl_id)
                cur.execute(f"UPDATE {SCHEMA}.prompt_templates SET {', '.join(fields)} WHERE id=%s", args)
            return resp(200, {"updated": True})

        return resp(404, {"error": "Not found"})
    finally:
        conn.close()
