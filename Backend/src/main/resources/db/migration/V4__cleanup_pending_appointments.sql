-- Cleanup old PENDING appointments to avoid deserialization errors in the new payment-first flow
UPDATE appointment SET status = 'CANCELLED' WHERE status = 'PENDING';

-- Cleanup old PENDING payments if they exist
UPDATE payments SET status = 'FAILED' WHERE status = 'PENDING';
