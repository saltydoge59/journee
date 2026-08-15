#!/usr/bin/env python3
"""Phase 3: turn the Phase 1 JSON export into D1 INSERT statements.
Usage: python3 scripts/generate-import-sql.py <backup-dir> > migrations/0002_import.sql
"""
import json, sys, pathlib

def esc(v):
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"

def rows_to_sql(table, cols, rows, col_map=None):
    col_map = col_map or {}
    out_cols = [col_map.get(c, c) for c in cols]
    lines = [f"-- {table}: {len(rows)} rows"]
    for r in rows:
        vals = ", ".join(esc(r[c]) for c in cols)
        lines.append(f"INSERT INTO {table} ({', '.join(out_cols)}) VALUES ({vals});")
    return "\n".join(lines)

def main():
    backup = pathlib.Path(sys.argv[1])
    users = json.loads((backup / "users.json").read_text())
    trips = json.loads((backup / "trips.json").read_text())
    logs = json.loads((backup / "logs.json").read_text())
    photos = json.loads((backup / "photos.json").read_text())

    print("-- Generated from Phase 1 export. Do not edit by hand — regenerate instead.")
    print(rows_to_sql("users", ["id", "username", "created_at"], users,
                       {"id": "user_id"}))
    print(rows_to_sql("trips", ["id", "trip_name", "start_date", "end_date", "image_url"], trips,
                       {"id": "user_id"}))
    print(rows_to_sql("logs", ["id", "trip", "date", "day", "entry", "title", "location"], logs,
                       {"id": "user_id"}))
    print(rows_to_sql("photos", ["id", "trip_name", "day", "imageURL", "lat", "long", "area"], photos,
                       {"id": "user_id"}))

if __name__ == "__main__":
    main()
