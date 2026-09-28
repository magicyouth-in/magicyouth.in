-- ============================================================
-- Supabase SQL — RPC function for atomic Member ID sequence
-- Run this in the Supabase SQL Editor AFTER member-portal-migration.sql
-- ============================================================

CREATE OR REPLACE FUNCTION increment_member_seq(p_unit_code TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_seq INTEGER;
BEGIN
  INSERT INTO member_id_sequences (unit_code, next_seq)
    VALUES (p_unit_code, 2)
    ON CONFLICT (unit_code)
    DO UPDATE SET next_seq = member_id_sequences.next_seq + 1
    RETURNING next_seq - 1 INTO v_seq;

  RETURN v_seq;
END;
$$;
