"""Real PostgreSQL checkpoint tests. Python stdlib + Docker; no API dependencies.
Default: isolated disposable PostgreSQL. --development: existing Compose DB,
without bootstrap or password changes. Optional --tcp reads ED_<ROLE>_PASSWORD
from process environment; socket connections otherwise still use real logins.
"""
import argparse
import getpass
import os
from pathlib import Path
import secrets
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
SQL = Path(__file__).resolve().parent
ROLES = ['migrator', 'runtime', 'dispatcher', 'retention']
ADMIN = 'event_dynamics_admin'
DB = 'event_dynamics_dev'


def command(args, data=None):
    try:
        return subprocess.run(args, input=data, text=True, capture_output=True, cwd=ROOT, timeout=60)
    except subprocess.TimeoutExpired:
        raise RuntimeError('Docker command timed out after 60 seconds; check Docker Desktop') from None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--development', action='store_true')
    parser.add_argument('--tcp', action='store_true')
    parser.add_argument('--credentials-file', type=Path,
                        help='Optional ignored file with ED_<ROLE>_PASSWORD=value lines')
    parser.add_argument('--prompt-passwords', action='store_true',
                        help='Prompt without echo for missing development TCP passwords')
    parser.add_argument('--login-only', action='store_true',
                        help='Development TCP identity checks only; no test objects')
    parser.add_argument('--roles', nargs='+', choices=ROLES,
                        help='Roles for --login-only (default: all four)')
    args = parser.parse_args()
    if (args.credentials_file or args.prompt_passwords or args.login_only or args.roles) and not (args.development and args.tcp):
        parser.error('Credential/login options require --development --tcp')
    if args.roles and not args.login_only:
        parser.error('--roles requires --login-only; full permission suites always test all four roles')
    container = 'ed-permissions-' + secrets.token_hex(6)
    disposable = not args.development
    prefix = ['docker', 'exec', '-i', container] if disposable else [
        'docker', 'compose', 'exec', '-T', 'event_dynamics_dev']
    passwords = {r: secrets.token_urlsafe(32) for r in ROLES} if disposable else {
        r: os.environ.get('ED_' + r.upper() + '_PASSWORD') for r in ROLES}
    if args.credentials_file:
        values = dict(line.split('=', 1) for line in args.credentials_file.read_text(encoding='utf-8').splitlines()
                      if '=' in line and not line.lstrip().startswith('#'))
        for role in ROLES:
            passwords[role] = passwords[role] or values.get('ED_' + role.upper() + '_PASSWORD')
    selected_roles = args.roles or ROLES
    if args.prompt_passwords:
        for role in selected_roles:
            if not passwords[role]:
                passwords[role] = getpass.getpass('Existing event_dynamics_' + role + ' password: ')
    tcp = disposable or args.tcp
    if tcp and not all(passwords[r] for r in selected_roles):
        raise RuntimeError('Missing existing TCP credentials; use --prompt-passwords or ED_<ROLE>_PASSWORD variables')

    def sql(role, statement, deny=False, secret=False):
        user = ADMIN if role == 'admin' else 'event_dynamics_' + role
        header = '\\set ON_ERROR_STOP on\n\\set VERBOSITY verbose\n'
        if tcp and role != 'admin':
            # Password stays on stdin, never in a command argument or output.
            pw = passwords[role]
            # psql meta-command single-quoted arguments accept backslash escapes.
            escaped = pw.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
            header += "\\setenv PGPASSWORD '" + escaped + "'\n\\setenv PGCONNECT_TIMEOUT 10\n"
            header += f'\\connect {DB} {user} 127.0.0.1 5432\n'
        result = command(prefix + ['psql', '-X', '-qAt', '-U', user, '-d', DB], header + statement)
        for password in passwords.values():
            if password:
                result.stderr = result.stderr.replace(password, '[REDACTED]')
        if deny:
            if result.returncode == 0 or '42501:' not in result.stderr:
                raise RuntimeError('Expected insufficient_privilege (42501): ' + statement + '\n' + result.stderr)
        elif result.returncode:
            raise RuntimeError('SQL failed for ' + role + ('' if secret else ': ' + result.stderr))
        return result.stdout.strip()

    def script(name):
        text = (SQL / name).read_text(encoding='utf-8')
        text = text.replace('\\ir verify-permissions.sql', (SQL / 'verify-permissions.sql').read_text(encoding='utf-8'))
        sql('admin', text)

    started = False
    probe = 'permission_probe_' + secrets.token_hex(8)
    created = []
    try:
        if args.login_only:
            for role in selected_roles:
                expected = 'event_dynamics_' + role
                identity = sql(role, "SELECT session_user || '/' || current_user;")
                if not identity.endswith(expected + '/' + expected):
                    raise RuntimeError('Wrong connection identity for ' + role)
                print('PASS: development TCP login and identity: ' + role, flush=True)
            return
        if disposable:
            result = command(['docker', 'run', '--detach', '--rm', '--name', container,
                '--network', 'none', '--tmpfs', '/var/lib/postgresql',
                '-e', 'POSTGRES_USER=' + ADMIN, '-e', 'POSTGRES_DB=' + DB,
                '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:18.6-bookworm'])
            if result.returncode:
                raise RuntimeError(result.stderr)
            started = True
            for _ in range(60):
                result = command(prefix + ['pg_isready', '-U', ADMIN, '-d', DB])
                if result.returncode == 0:
                    break
                time.sleep(1)
            else:
                raise RuntimeError('Disposable PostgreSQL startup timed out')
            # Require SCRAM on loopback for restricted-role connection tests.
            result = command(prefix + ['sh', '-c', 'printf "host all all 127.0.0.1/32 scram-sha-256\\nhost all all ::1/128 scram-sha-256\\nlocal all all trust\\n" > "$PGDATA/pg_hba.conf"'])
            if result.returncode:
                raise RuntimeError('Cannot configure disposable authentication')
            sql('admin', 'SELECT pg_reload_conf();')
            for name in ['bootstrap.sql','002-schemas.sql','003-runtime-role.sql',
                         '004-runtime-schema-access.sql']:
                script(name)
            sql('admin', 'SET ROLE event_dynamics_migrator; CREATE TABLE kernel.upgrade_probe (id integer); INSERT INTO kernel.upgrade_probe VALUES (7);')
            script('005-service-roles.sql')
            script('006-permission-foundation.sql')
            if sql('admin', 'SELECT id FROM kernel.upgrade_probe;') != '7':
                raise RuntimeError('Upgrade did not preserve seed data')
            sql('admin', 'SET ROLE event_dynamics_migrator; DROP TABLE kernel.upgrade_probe;')
            for role in ROLES:
                sql('admin', f"ALTER ROLE event_dynamics_{role} PASSWORD '{passwords[role]}';", secret=True)
            # Re-applying hardening is safe; creation scripts intentionally are not.
            script('006-permission-foundation.sql')
            print('PASS: fresh install, seeded forward completion and repeatable hardening')
            audit = (SQL / 'verify-permissions.sql').read_text(encoding='utf-8')
            for mutation, reason in [
                ('ALTER ROLE event_dynamics_runtime BYPASSRLS;', 'Unsafe attributes'),
                ('GRANT event_dynamics_migrator TO event_dynamics_runtime;', 'Unexpected membership'),
                ('ALTER SCHEMA kernel OWNER TO event_dynamics_admin;', 'Unexpected schema privileges'),
                ('GRANT USAGE ON SCHEMA kernel TO PUBLIC;', 'Unexpected schema privileges'),
                ('ALTER DEFAULT PRIVILEGES FOR ROLE event_dynamics_migrator GRANT SELECT ON TABLES TO event_dynamics_runtime;', 'Unexpected migrator default grants'),
                ("SET ROLE event_dynamics_migrator; CREATE TYPE kernel.audit_enum AS ENUM ('ok'); GRANT USAGE ON TYPE kernel.audit_enum TO event_dynamics_runtime; RESET ROLE;", 'Unexpected type ownership/access'),
                ('SET ROLE event_dynamics_migrator; CREATE TYPE kernel.audit_composite AS (id integer); GRANT USAGE ON TYPE kernel.audit_composite TO PUBLIC; RESET ROLE;', 'Unexpected type ownership/access'),
                ('SET ROLE event_dynamics_migrator; CREATE TABLE kernel.audit_columns (id integer); GRANT SELECT (id) ON kernel.audit_columns TO event_dynamics_runtime; RESET ROLE;', 'Unexpected type ownership/access')]:
                try:
                    sql('admin', 'BEGIN; ' + mutation + '\n' + audit + '\nROLLBACK;')
                except RuntimeError as error:
                    if reason not in str(error):
                        raise
                else:
                    raise RuntimeError('Audit accepted deliberate permission drift: ' + reason)
            print('PASS: audit rejects attribute, membership, ownership, PUBLIC, default, enum/composite and column-grant drift', flush=True)
            # Generated row/array types and private standalone types are valid.
            sql('admin', 'BEGIN; SET ROLE event_dynamics_migrator; CREATE TABLE kernel.audit_rows (id integer); '
                "CREATE TYPE kernel.audit_enum AS ENUM ('ok'); CREATE TYPE kernel.audit_composite AS (id integer); "
                'RESET ROLE;\n' + audit + '\nROLLBACK;')
            print('PASS: generated row/array types and private standalone types accepted', flush=True)
        print('Target: ' + ('disposable PostgreSQL 18.6 / SCRAM TCP' if disposable else
                            'existing development database / ' + ('TCP' if tcp else 'local socket logins')))
        script('verify-permissions.sql')
        print('PASS: catalog audit')
        for role in ROLES:
            identity = sql(role, 'SELECT session_user || \'/\' || current_user;')
            expected = 'event_dynamics_' + role
            if not identity.endswith(expected + '/' + expected):
                raise RuntimeError('Wrong connection identity: ' + identity)
            for target in ['event_dynamics_admin','event_dynamics_migrator']:
                if target != expected:
                    sql(role, f'BEGIN; SET ROLE {target}; ROLLBACK;', deny=True)
        print('PASS: independent role connections and forbidden role switching')
        for schema in ['kernel','outbox']:
            sql('migrator', f'CREATE TABLE {schema}.{probe} (id integer PRIMARY KEY);')
            created.append(schema)
            sql('migrator', f'INSERT INTO {schema}.{probe} VALUES (1);')
            owner = sql('migrator', f"SELECT pg_get_userbyid(relowner) FROM pg_class WHERE oid='{schema}.{probe}'::regclass;")
            if not owner.endswith('event_dynamics_migrator'):
                raise RuntimeError('Incorrect probe owner')
            sql('runtime', f'SELECT * FROM {schema}.{probe};', deny=True)
            sql('migrator', f'GRANT SELECT ON {schema}.{probe} TO event_dynamics_runtime;')
            if not sql('runtime', f'SELECT id FROM {schema}.{probe};').endswith('1'):
                raise RuntimeError('Granted SELECT did not return the seeded row')
            for statement in [f'INSERT INTO {schema}.{probe} VALUES (2)',
                              f'ALTER TABLE {schema}.{probe} ADD COLUMN forbidden integer',
                              f'DROP TABLE {schema}.{probe}']:
                sql('runtime', 'BEGIN; ' + statement + '; ROLLBACK;', deny=True)
            for role in ['dispatcher','retention']:
                sql(role, f'SELECT * FROM {schema}.{probe};', deny=True)
        for role in ['runtime','dispatcher','retention']:
            for schema in ['kernel','outbox','public']:
                sql(role, f'BEGIN; CREATE TABLE {schema}.{probe}_denied (id integer); ROLLBACK;', deny=True)
            sql(role, f'BEGIN; CREATE TEMP TABLE {probe}_temp (id integer); ROLLBACK;', deny=True)
        print('PASS: migrator ownership; initial read denial; SELECT-only grant; denied INSERT/ALTER/DROP/CREATE; service restrictions')
    finally:
        try:
            for schema in created:
                sql('migrator', f'DROP TABLE {schema}.{probe};')
            if created:
                script('verify-permissions.sql')
                print('PASS: probes removed and final catalog audit')
        finally:
            if started:
                result = command(['docker', 'stop', container])
                if result.returncode:
                    raise RuntimeError('Disposable container cleanup failed: ' + container)
                print('PASS: disposable container removed (no persistent volumes)')
    print('PASS: all permission checks')


if __name__ == '__main__':
    main()
