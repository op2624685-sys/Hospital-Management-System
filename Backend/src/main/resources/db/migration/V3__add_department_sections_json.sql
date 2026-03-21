ALTER TABLE department
    ADD COLUMN IF NOT EXISTS sections_json TEXT;
