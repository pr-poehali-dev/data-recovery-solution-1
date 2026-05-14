"""Публикация статей на площадках: мок-адаптеры Habr, VC.ru, Dzen + retry"""
import json
import os
import time
import uuid
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

PLATFORM_URLS = {
    "habr": "https://habr.com/ru/articles/{id}/",
    "vc": "https://vc.ru/content/{id}",
    "dzen": "https://dzen.ru/media/id/{id}",
}

def mock_publish(platform: str, title: str, content: str) -> dict:
    """Мок-публикация: возвращает fake external_id и URL"""
    fake_id = f"mock-{platform}-{int(time.time())}-{str(uuid.uuid4())[:8]}"
    url_template = PLATFORM_URLS.get(platform, "https://{platform}.example.com/{id}")
    fake_url = url_template.format(id=fake_id)
    return {"external_id": fake_id, "external_url": fake_url, "platform": platform, "mock": True}

def adapt_content_for_platform(platform: str, title: str, content: str) -> dict:
    """Адаптация контента под формат каждой площадки"""
    if platform == "habr":
        return {"title": title, "text_html": content, "hubs": ["content_management"], "tags": ["GEO", "контент", "LLM"]}
    elif platform == "vc":
        return {"title": title, "blocks": [{"type": "text", "data": {"text": content}}], "subsite_id": 199699}
    elif platform == "dzen":
        return {"title": title, "content": content, "tags": ["GEO", "ИИ", "контент-маркетинг"]}
    return {"title": title, "content": content}

def handler(event: dict, context) -> dict:
    """Публикация статей на Habr, VC.ru и Dzen (mock-режим)"""
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
        # POST /publish — опубликовать статью
        if path.endswith("/publish") and method == "POST":
            body = json.loads(event.get("body") or "{}")
            article_id = body.get("article_id")
            platforms = body.get("platforms", ["habr"])
            if isinstance(platforms, str):
                platforms = [platforms]

            cur.execute(f"SELECT id, title, content, status FROM {SCHEMA}.articles WHERE id=%s", (article_id,))
            row = cur.fetchone()
            if not row:
                return resp(404, {"error": "Article not found"})
            _, title, content, status = row

            if status not in ("approved", "ready_to_publish"):
                return resp(400, {"error": f"Article status is '{status}', must be approved or ready_to_publish"})

            results = []
            for platform in platforms:
                # Проверить настройки площадки
                cur.execute(f"SELECT is_mock FROM {SCHEMA}.platform_settings WHERE platform=%s", (platform,))
                ps_row = cur.fetchone()
                is_mock = ps_row[0] if ps_row else True

                attempt = 0
                max_attempts = 5
                pub_result = None
                error_msg = None

                while attempt < max_attempts:
                    attempt += 1
                    try:
                        adapted = adapt_content_for_platform(platform, title, content)
                        if is_mock:
                            pub_result = mock_publish(platform, title, content)
                        else:
                            # Здесь будет реальный API-вызов при наличии ключей
                            pub_result = mock_publish(platform, title, content)
                        break
                    except Exception as e:
                        error_msg = str(e)
                        time.sleep(0.1 * attempt)

                if pub_result:
                    cur.execute(f"""
                        UPDATE {SCHEMA}.articles
                        SET status='published', published_at=NOW(), external_id=%s, external_url=%s, updated_at=NOW()
                        WHERE id=%s
                    """, (pub_result["external_id"], pub_result["external_url"], article_id))

                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.publish_logs (article_id, platform, action, status, response_data)
                        VALUES (%s, %s, 'publish', 'success', %s)
                    """, (article_id, platform, json.dumps(pub_result)))

                    results.append({"platform": platform, "success": True, "external_id": pub_result["external_id"], "external_url": pub_result["external_url"], "mock": pub_result.get("mock", False), "attempts": attempt})
                else:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.publish_logs (article_id, platform, action, status, error_message)
                        VALUES (%s, %s, 'publish', 'failed', %s)
                    """, (article_id, platform, error_msg))
                    results.append({"platform": platform, "success": False, "error": error_msg, "attempts": attempt})

            return resp(200, {"article_id": article_id, "results": results})

        # GET /logs — история публикаций
        if path.endswith("/logs") and method == "GET":
            cur.execute(f"""
                SELECT l.id, l.article_id, a.title, l.platform, l.action, l.status, l.error_message, l.created_at
                FROM {SCHEMA}.publish_logs l
                LEFT JOIN {SCHEMA}.articles a ON a.id = l.article_id
                ORDER BY l.created_at DESC LIMIT 100
            """)
            rows = cur.fetchall()
            cols = ["id","article_id","title","platform","action","status","error_message","created_at"]
            return resp(200, [dict(zip(cols, [str(v) if v is not None else None for v in r])) for r in rows])

        # GET /calendar — статьи по расписанию
        if path.endswith("/calendar") and method == "GET":
            cur.execute(f"""
                SELECT id, title, platform, status, scheduled_at, published_at, external_url
                FROM {SCHEMA}.articles WHERE scheduled_at IS NOT NULL OR status='published'
                ORDER BY scheduled_at ASC NULLS LAST LIMIT 200
            """)
            rows = cur.fetchall()
            cols = ["id","title","platform","status","scheduled_at","published_at","external_url"]
            return resp(200, [dict(zip(cols, [str(v) if v is not None else None for v in r])) for r in rows])

        return resp(404, {"error": "Not found"})
    finally:
        conn.close()
