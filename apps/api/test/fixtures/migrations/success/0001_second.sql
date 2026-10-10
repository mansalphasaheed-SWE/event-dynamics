CREATE TABLE kernel.migration_fixture_second (
  id integer PRIMARY KEY,
  first_id integer REFERENCES kernel.migration_fixture_first(id)
);
