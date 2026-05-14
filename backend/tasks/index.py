"""Управление заданиями: CRUD + мок-полинг дашборда"""
import json
import os
import time
import random
import psycopg2
import hashlib
import hmac
import base64

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

def resp(code, data, headers=None):
    h = {**CORS, "Content-Type": "application/json"}
    if headers:
        h.update(headers)
    return {"statusCode": code, "headers": h, "body": json.dumps(data, default=str)}

def auth_user(event):
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    token = (headers.get("x-authorization") or headers.get("authorization") or "").replace("Bearer ", "").replace("bearer ", "")
    return verify_jwt(token)

MOCK_THEMES = [
    {"theme": "Как GEO-оптимизация увеличивает цитируемость бренда в ChatGPT", "required_angle": "практические советы", "key_entities": "GeoContent Publisher", "priority": "high", "target_tone": "экспертный", "suggested_keywords": "GEO, цитируемость, ChatGPT, LLM"},
    {"theme": "E-E-A-T факторы для контента, который цитируют ИИ-ассистенты", "required_angle": "технический разбор", "key_entities": "GeoContent Publisher", "priority": "high", "target_tone": "образовательный", "suggested_keywords": "E-E-A-T, доверие, экспертность, ИИ"},
    {"theme": "Почему структура статьи важнее ключевых слов для LLM-цитирования", "required_angle": "сравнительный анализ", "key_entities": "GeoContent Publisher", "priority": "medium", "target_tone": "аналитический", "suggested_keywords": "структура, FAQ, H2, LLM"},
]

def handler(event: dict, context) -> dict:
    """CRUD заданий на генерацию статей + мок-полинг дашборда"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    user = auth_user(event)
    if not user:
        return resp(401, {"error": "Unauthorized"})

    conn = get_db()
    cur = conn.cursor()

    try:
        # GET /poll-dashboard — мок опроса внешнего дашборда
        if path.endswith("/poll-dashboard") and method == "POST":
            if user.get("role") != "admin":
                return resp(403, {"error": "Forbidden"})
            created = []
            for mock in MOCK_TASKS_FROM_DASHBOARD():
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.content_tasks (topic_id, theme, required_angle, key_entities, priority, target_tone, suggested_keywords, source)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 'dashboard')
                    RETURNING id
                """, (mock["topic_id"], mock["theme"], mock["required_angle"], mock["key_entities"],
                      mock["priority"], mock["target_tone"], mock["suggested_keywords"]))
                row = cur.fetchone()
                created.append(str(row[0]))
            return resp(200, {"created": len(created), "task_ids": created})

        # GET / — список заданий
        if method == "GET" and (path.endswith("/tasks") or path == "/"):
            priority = params.get("priority")
            status = params.get("status")
            where = []
            args = []
            if priority:
                where.append("priority=%s")
                args.append(priority)
            if status:
                where.append("status=%s")
                args.append(status)
            where_sql = ("WHERE " + " AND ".join(where)) if where else ""
            cur.execute(f"SELECT id, topic_id, theme, required_angle, key_entities, priority, target_tone, suggested_keywords, status, source, created_at, updated_at FROM {SCHEMA}.content_tasks {where_sql} ORDER BY created_at DESC LIMIT 100", args)
            rows = cur.fetchall()
            cols = ["id","topic_id","theme","required_angle","key_entities","priority","target_tone","suggested_keywords","status","source","created_at","updated_at"]
            return resp(200, [dict(zip(cols, [str(v) if v is not None else None for v in r])) for r in rows])

        # POST / — создать задание
        if method == "POST" and (path.endswith("/tasks") or path == "/"):
            body = json.loads(event.get("body") or "{}")
            theme = body.get("theme", "").strip()
            if not theme:
                return resp(400, {"error": "theme required"})
            cur.execute(f"""
                INSERT INTO {SCHEMA}.content_tasks (topic_id, theme, required_angle, key_entities, priority, target_tone, suggested_keywords, source)
                VALUES (%s,%s,%s,%s,%s,%s,%s,'manual') RETURNING id
            """, (body.get("topic_id"), theme, body.get("required_angle"), body.get("key_entities"),
                  body.get("priority","medium"), body.get("target_tone"), body.get("suggested_keywords")))
            row = cur.fetchone()
            return resp(201, {"id": str(row[0]), "theme": theme})

        # PUT /{id} — обновить статус
        if method == "PUT":
            task_id = path.split("/")[-1]
            body = json.loads(event.get("body") or "{}")
            fields = []
            args = []
            for f in ["status","priority","theme","required_angle","key_entities","target_tone","suggested_keywords"]:
                if f in body:
                    fields.append(f"{f}=%s")
                    args.append(body[f])
            if not fields:
                return resp(400, {"error": "No fields to update"})
            fields.append("updated_at=NOW()")
            args.append(task_id)
            cur.execute(f"UPDATE {SCHEMA}.content_tasks SET {', '.join(fields)} WHERE id=%s", args)
            return resp(200, {"updated": True})

        # DELETE /{id}
        if method == "DELETE":
            task_id = path.split("/")[-1]
            if user.get("role") != "admin":
                return resp(403, {"error": "Forbidden"})
            cur.execute(f"UPDATE {SCHEMA}.content_tasks SET status='failed', updated_at=NOW() WHERE id=%s", (task_id,))
            return resp(200, {"deleted": True})

        return resp(404, {"error": "Not found"})
    finally:
        conn.close()

def MOCK_TASKS_FROM_DASHBOARD():
    items = []
    for i, t in enumerate(random.sample(MOCK_THEMES, min(2, len(MOCK_THEMES)))):
        items.append({
            "topic_id": f"mock-{int(time.time())}-{i}",
            **t,
        })
    return items
