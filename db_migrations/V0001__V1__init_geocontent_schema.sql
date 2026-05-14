CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_name VARCHAR(20) NOT NULL DEFAULT 'editor',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id VARCHAR(255),
  theme TEXT NOT NULL,
  required_angle TEXT,
  key_entities TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  target_tone VARCHAR(100),
  suggested_keywords TEXT,
  missing_summary TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID,
  title TEXT,
  content TEXT,
  platform VARCHAR(50) NOT NULL DEFAULT 'habr',
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  geo_rating NUMERIC(5,2),
  eeat_experience NUMERIC(5,2),
  eeat_expertise NUMERIC(5,2),
  eeat_authority NUMERIC(5,2),
  eeat_trust NUMERIC(5,2),
  geo_feedback TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  external_id VARCHAR(255),
  external_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) UNIQUE NOT NULL,
  is_mock BOOLEAN NOT NULL DEFAULT TRUE,
  api_key_enc TEXT,
  extra_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  platform VARCHAR(50),
  template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publish_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID,
  platform VARCHAR(50),
  action VARCHAR(50),
  status VARCHAR(30),
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);