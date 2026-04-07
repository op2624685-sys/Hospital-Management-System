-- PostgreSQL migration: harden department_patient relation for scale and race safety

-- 1) Deduplicate existing rows, keeping one row per (department_id, patient_id)
DELETE FROM department_patient a
USING department_patient b
WHERE a.department_id = b.department_id
  AND a.patient_id = b.patient_id
  AND a.ctid < b.ctid;

-- 2) Add unique constraint idempotently
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_department_patient_pair'
    ) THEN
        ALTER TABLE department_patient
            ADD CONSTRAINT uk_department_patient_pair
            UNIQUE (department_id, patient_id);
    END IF;
END $$;

-- 3) Add lookup index idempotently (useful for explicit exists checks)
CREATE INDEX IF NOT EXISTS idx_department_patient_department_patient
    ON department_patient (department_id, patient_id);
