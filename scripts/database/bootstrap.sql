\set ON_ERROR_STOP on

BEGIN;
DO $$
BEGIN
  IF current_database() <> 'event_dynamics_dev' OR current_user <> 'event_dynamics_admin' THEN
    RAISE EXCEPTION 'Use event_dynamics_admin in event_dynamics_dev';
  END IF;
END $$;

CREATE ROLE event_dynamics_migrator
  LOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS;

GRANT CONNECT ON DATABASE event_dynamics_dev
  TO event_dynamics_migrator;

COMMIT;