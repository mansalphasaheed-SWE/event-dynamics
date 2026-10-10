\set ON_ERROR_STOP on

BEGIN;
DO $$
BEGIN
  IF current_database() <> 'event_dynamics_dev' OR current_user <> 'event_dynamics_admin' THEN
    RAISE EXCEPTION 'Use event_dynamics_admin in event_dynamics_dev';
  END IF;
END $$;

REVOKE CREATE ON DATABASE event_dynamics_dev FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

CREATE SCHEMA kernel AUTHORIZATION event_dynamics_migrator;

CREATE SCHEMA outbox AUTHORIZATION event_dynamics_migrator;

COMMIT;