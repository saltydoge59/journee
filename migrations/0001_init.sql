-- Postgres -> SQLite (D1). `id` renamed to `user_id` for clarity (every table used `id`
-- to mean "Clerk user id"). trip_name stays the join key between trips/logs/photos —
-- pre-existing design, not touched by this migration.

CREATE TABLE users (
  user_id    TEXT PRIMARY KEY,
  username   TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE trips (
  user_id    TEXT NOT NULL,
  trip_name  TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date   TEXT NOT NULL,
  image_url  TEXT
);
CREATE INDEX idx_trips_user ON trips (user_id);

CREATE TABLE logs (
  user_id  TEXT NOT NULL,
  trip     TEXT NOT NULL,
  date     TEXT NOT NULL,
  day      INTEGER NOT NULL,
  entry    TEXT,
  title    TEXT,
  location TEXT
);
CREATE INDEX idx_logs_user_trip ON logs (user_id, trip);
CREATE INDEX idx_logs_user_trip_day ON logs (user_id, trip, day);

CREATE TABLE photos (
  user_id   TEXT NOT NULL,
  trip_name TEXT NOT NULL,
  day       INTEGER NOT NULL,
  imageURL  TEXT NOT NULL,
  lat       REAL,
  long      REAL,
  area      TEXT
);
CREATE INDEX idx_photos_user_trip_day ON photos (user_id, trip_name, day);
