CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS atlas_states (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  leader TEXT NOT NULL,
  capital TEXT NOT NULL,
  color TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  geometry geometry(Polygon, 4326) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (year, slug)
);

CREATE TABLE IF NOT EXISTS atlas_events (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'battle',
  related_states TEXT[] NOT NULL DEFAULT '{}',
  coordinates JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS atlas_states_year_idx ON atlas_states (year);
CREATE INDEX IF NOT EXISTS atlas_states_slug_idx ON atlas_states (slug);
CREATE INDEX IF NOT EXISTS atlas_states_geom_idx ON atlas_states USING GIST (geometry);
