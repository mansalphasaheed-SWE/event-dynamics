\set ON_ERROR_STOP on
BEGIN;
-- Administrator only. Never silently take ownership of an existing schema.
DO $$
BEGIN
  IF current_database() <> 'event_dynamics_dev' OR current_user <> 'event_dynamics_admin' THEN
    RAISE EXCEPTION 'Use event_dynamics_admin in event_dynamics_dev';
  END IF;
  IF (SELECT count(*) FROM pg_namespace WHERE nspname IN ('kernel', 'outbox')
      AND nspowner = 'event_dynamics_migrator'::regrole) <> 2 THEN
    RAISE EXCEPTION 'Missing schema or incorrect schema ownership';
  END IF;
END $$;
REVOKE ALL ON DATABASE event_dynamics_dev FROM PUBLIC;
REVOKE ALL ON DATABASE event_dynamics_dev FROM event_dynamics_migrator,
  event_dynamics_runtime, event_dynamics_dispatcher, event_dynamics_retention;
GRANT CONNECT ON DATABASE event_dynamics_dev TO event_dynamics_migrator,
  event_dynamics_runtime, event_dynamics_dispatcher, event_dynamics_retention;
REVOKE ALL ON SCHEMA public FROM PUBLIC, event_dynamics_migrator,
  event_dynamics_runtime, event_dynamics_dispatcher, event_dynamics_retention;
REVOKE ALL ON SCHEMA kernel, outbox FROM PUBLIC, event_dynamics_runtime,
  event_dynamics_dispatcher, event_dynamics_retention;
GRANT USAGE ON SCHEMA kernel, outbox TO event_dynamics_runtime;
GRANT USAGE ON SCHEMA outbox TO event_dynamics_dispatcher;
-- Schema defaults cannot undo global defaults. No blanket table grants.
ALTER DEFAULT PRIVILEGES FOR ROLE event_dynamics_migrator REVOKE EXECUTE ON ROUTINES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE event_dynamics_migrator REVOKE USAGE ON TYPES FROM PUBLIC;
-- Unexpected ownership, memberships or default grants roll back this step.
\ir verify-permissions.sql
COMMIT;
