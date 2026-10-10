\set ON_ERROR_STOP on

BEGIN;
DO $$
BEGIN
  IF current_database() <> 'event_dynamics_dev' OR current_user <> 'event_dynamics_admin' THEN
    RAISE EXCEPTION 'Use event_dynamics_admin in event_dynamics_dev';
  END IF;
END $$;

GRANT USAGE ON SCHEMA kernel
  TO event_dynamics_runtime;

GRANT USAGE ON SCHEMA outbox
  TO event_dynamics_runtime;

COMMIT;