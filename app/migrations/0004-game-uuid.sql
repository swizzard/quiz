ALTER TABLE quiz ADD COLUMN IF NOT EXISTS quiz_code uuid UNIQUE NOT NULL DEFAULT gen_random_uuid();
