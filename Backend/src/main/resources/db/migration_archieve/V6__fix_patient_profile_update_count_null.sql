UPDATE patient
SET profile_update_count = 0
WHERE profile_update_count IS NULL;

ALTER TABLE patient
ALTER COLUMN profile_update_count SET DEFAULT 0;

ALTER TABLE patient
ALTER COLUMN profile_update_count SET NOT NULL;
