INSERT INTO users (email, password_hash, role_name)
SELECT 'admin@example.com', '$2a$06$rBnqhOFtXMNTEiXMtOMPpubN6GlXPdHvW9KJBe3nKFTK4D0qUoiKu', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='admin@example.com');

INSERT INTO platform_settings (platform, is_mock)
SELECT 'habr', TRUE WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE platform='habr');
INSERT INTO platform_settings (platform, is_mock)
SELECT 'vc', TRUE WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE platform='vc');
INSERT INTO platform_settings (platform, is_mock)
SELECT 'dzen', TRUE WHERE NOT EXISTS (SELECT 1 FROM platform_settings WHERE platform='dzen');

INSERT INTO app_settings (key, value)
SELECT 'auto_approve_threshold', '85' WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE key='auto_approve_threshold');
INSERT INTO app_settings (key, value)
SELECT 'dashboard_poll_enabled', 'true' WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE key='dashboard_poll_enabled');
INSERT INTO app_settings (key, value)
SELECT 'dashboard_poll_interval', '300' WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE key='dashboard_poll_interval');
INSERT INTO app_settings (key, value)
SELECT 'llm_model', 'gpt-4o' WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE key='llm_model');

INSERT INTO prompt_templates (name, platform, template)
SELECT 'default_geo', NULL, 'Ты эксперт. Напиши статью для {platform} длиной 800-1500 слов, оптимизированную для цитирования LLM.
Тема: {theme}. Угол: {required_angle}. Сущности бренда: {key_entities}. Тональность: {target_tone}. Ключевые слова: {suggested_keywords}.
Требования:
1. Первый абзац - прямой ответ на главный вопрос (сниппет для LLM).
2. Заголовки H2/H3, списки, таблицы, FAQ-блок (3+ вопросов).
3. Конкретные цифры, даты, ссылки на источники, примеры из практики.
4. Запрещены: вода, прямая реклама, keyword stuffing, выдуманные факты.
5. В конце - дисклеймер и ссылка на сайт бренда.

Верни JSON: {"title": "...", "content": "..."}'
WHERE NOT EXISTS (SELECT 1 FROM prompt_templates WHERE name='default_geo');