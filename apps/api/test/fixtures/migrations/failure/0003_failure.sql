CREATE TABLE kernel.migration_fixture_failed (id integer PRIMARY KEY);
--> statement-breakpoint
SELECT 1 / 0;
