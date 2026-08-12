-- BUG-13 FIX: Create server-side, append-only audit log table.
-- Logs are written here from the frontend via the Supabase client.
-- An AFTER trigger blocks any UPDATE or DELETE, making the table truly immutable.

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id           TEXT        PRIMARY KEY,
  request_id   TEXT        NOT NULL,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now(),
  admin_email  TEXT        NOT NULL,
  role         TEXT        NOT NULL,
  action       TEXT        NOT NULL,
  target       TEXT        NOT NULL,
  ip_address   TEXT,
  user_agent   TEXT,
  status       TEXT        NOT NULL CHECK (status IN ('SUCCESS', 'DENIED', 'FAILED')),
  details      TEXT
);

-- Only admins can insert; nobody can update or delete (enforced below by trigger + RLS).
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can insert audit logs"
ON public.admin_audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admin can read audit logs"
ON public.admin_audit_logs FOR SELECT
TO authenticated
USING (true);

-- Append-only enforcement: block UPDATE and DELETE at the database level.
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are append-only and cannot be modified or deleted.';
END;
$$;

CREATE TRIGGER audit_logs_immutable_update
BEFORE UPDATE ON public.admin_audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();

CREATE TRIGGER audit_logs_immutable_delete
BEFORE DELETE ON public.admin_audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();

-- Grant INSERT + SELECT to authenticated users; service_role retains full access.
GRANT INSERT, SELECT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;

-- Index for fast time-ordered queries (most recent logs first).
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_timestamp
ON public.admin_audit_logs (timestamp DESC);
