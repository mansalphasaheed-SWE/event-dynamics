\set ON_ERROR_STOP on
-- Read-only audit; included before the hardening transaction commits.
DO $$
DECLARE r record; s text; expected_usage boolean;
BEGIN
  IF current_database() <> 'event_dynamics_dev' THEN RAISE EXCEPTION 'Wrong database'; END IF;
  IF (SELECT count(*) FROM pg_roles WHERE rolname IN
      ('event_dynamics_migrator','event_dynamics_runtime','event_dynamics_dispatcher','event_dynamics_retention')) <> 4 THEN
    RAISE EXCEPTION 'Missing foundation roles';
  END IF;
  FOR r IN SELECT * FROM pg_roles WHERE rolname IN
    ('event_dynamics_migrator','event_dynamics_runtime','event_dynamics_dispatcher','event_dynamics_retention') LOOP
    IF NOT r.rolcanlogin OR r.rolsuper OR r.rolcreatedb OR r.rolcreaterole OR r.rolreplication OR r.rolbypassrls THEN
      RAISE EXCEPTION 'Unsafe attributes: %', r.rolname;
    END IF;
    -- No outgoing memberships means no indirect INHERIT or SET ROLE path.
    IF EXISTS (SELECT FROM pg_auth_members WHERE member = r.oid) THEN
      RAISE EXCEPTION 'Unexpected membership: %', r.rolname;
    END IF;
    IF NOT has_database_privilege(r.oid,current_database(),'CONNECT')
       OR has_database_privilege(r.oid,current_database(),'CREATE')
       OR has_database_privilege(r.oid,current_database(),'TEMP') THEN
      RAISE EXCEPTION 'Unexpected database privileges: %', r.rolname;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_database d, LATERAL aclexplode(d.datacl) a
       WHERE d.datname=current_database() AND a.grantee=r.oid AND a.privilege_type='CONNECT' AND NOT a.is_grantable) THEN
      RAISE EXCEPTION 'Missing explicit CONNECT: %', r.rolname;
    END IF;
    FOREACH s IN ARRAY ARRAY['kernel','outbox','public'] LOOP
      expected_usage := (r.rolname IN ('event_dynamics_migrator','event_dynamics_runtime') AND s<>'public')
        OR (r.rolname='event_dynamics_dispatcher' AND s='outbox');
      IF has_schema_privilege(r.oid,s,'USAGE') IS DISTINCT FROM expected_usage
        OR has_schema_privilege(r.oid,s,'CREATE') IS DISTINCT FROM (r.rolname='event_dynamics_migrator' AND s<>'public') THEN
        RAISE EXCEPTION 'Unexpected schema privileges: % / %', r.rolname,s;
      END IF;
    END LOOP;
    IF r.rolname <> 'event_dynamics_migrator' AND EXISTS (
      SELECT FROM pg_shdepend WHERE refclassid='pg_authid'::regclass AND refobjid=r.oid AND deptype='o') THEN
      RAISE EXCEPTION 'Service identity owns an object: %',r.rolname;
    END IF;
  END LOOP;
  IF (SELECT count(*) FROM pg_namespace WHERE nspname IN ('kernel','outbox')
      AND nspowner='event_dynamics_migrator'::regrole) <> 2 THEN
    RAISE EXCEPTION 'Incorrect application schema ownership';
  END IF;
  IF EXISTS (SELECT FROM pg_database d, LATERAL aclexplode(d.datacl) a
    WHERE d.datname=current_database() AND (a.grantee=0 OR a.is_grantable)) THEN
    RAISE EXCEPTION 'Unexpected PUBLIC or grant-option database access';
  END IF;
  IF EXISTS (SELECT FROM pg_namespace n, LATERAL aclexplode(n.nspacl) a
    WHERE n.nspname IN ('kernel','outbox','public') AND (a.grantee=0 OR (a.grantee<>n.nspowner AND a.is_grantable))) THEN
    RAISE EXCEPTION 'Unexpected PUBLIC or grant-option schema access';
  END IF;
  IF EXISTS (SELECT FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname IN ('kernel','outbox') AND (c.relowner<>'event_dynamics_migrator'::regrole
      OR EXISTS (SELECT FROM aclexplode(c.relacl) a WHERE a.grantee<>c.relowner)))
    OR EXISTS (SELECT FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname IN ('kernel','outbox') AND (p.proowner<>'event_dynamics_migrator'::regrole
        OR EXISTS (SELECT FROM aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a WHERE a.grantee<>p.proowner))) THEN
    RAISE EXCEPTION 'Unexpected application object owner or grants at this checkpoint';
  END IF;
  -- Audit ownership and explicit ACLs for every type. A NULL ACL on an
  -- automatically generated table-row/array type is not a standalone type
  -- grant. Standalone composites (pg_class.relkind='c') still need auditing.
  IF EXISTS (SELECT FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
    LEFT JOIN pg_class c ON c.oid=t.typrelid
    WHERE n.nspname IN ('kernel','outbox') AND (t.typowner<>'event_dynamics_migrator'::regrole
      OR EXISTS (SELECT FROM aclexplode(t.typacl) a WHERE a.grantee<>t.typowner)
      OR (t.typacl IS NULL AND (t.typrelid=0 OR c.relkind='c')
        AND NOT EXISTS (SELECT FROM pg_type element WHERE element.typarray=t.oid)
        AND EXISTS (SELECT FROM aclexplode(acldefault('T',t.typowner)) a WHERE a.grantee<>t.typowner))))
    OR EXISTS (SELECT FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
      JOIN pg_namespace n ON n.oid=c.relnamespace, LATERAL aclexplode(a.attacl) acl
      WHERE n.nspname IN ('kernel','outbox') AND acl.grantee<>c.relowner) THEN
    RAISE EXCEPTION 'Unexpected type ownership/access or column grants';
  END IF;
  IF EXISTS (SELECT FROM pg_default_acl d, LATERAL aclexplode(d.defaclacl) a
    WHERE d.defaclrole='event_dynamics_migrator'::regrole AND a.grantee<>d.defaclrole) THEN
    RAISE EXCEPTION 'Unexpected migrator default grants';
  END IF;
  IF (SELECT count(*) FROM pg_default_acl WHERE defaclrole='event_dynamics_migrator'::regrole
      AND defaclnamespace=0 AND defaclobjtype IN ('f','T')) <> 2 THEN
    RAISE EXCEPTION 'Missing private routine/type defaults';
  END IF;
END $$;
\echo PASS: role attributes, memberships, ownership, effective privileges and defaults
