-- PostgreSQL migration: prevent double booking for the same doctor/time slot
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_appointment_doctor_time'
    ) THEN
        ALTER TABLE appointment
            ADD CONSTRAINT uk_appointment_doctor_time
            UNIQUE (doctor_id, appointment_time);
    END IF;
END $$;
