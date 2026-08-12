const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns true when value is a valid UUID v4-style string safe for Postgres @db.Uuid columns. */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
