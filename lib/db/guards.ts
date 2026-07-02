/**
 * Light guard for agent-issued SQL. This protects the app's meta tables
 * (prefixed with `_`) from agent mistakes — it is not a defense against an
 * adversary, and deliberately not a SQL parser.
 */

const WRITE_VERBS = /^(insert|update|delete|drop|alter|truncate|replace|create)\b/i
const BLOCKED_ANYWHERE = /^(attach|detach|vacuum)\b/i

/** Strip string literals and comments so identifier checks don't false-match. */
function stripLiterals(sql: string): string {
  return sql
    .replace(/'(?:[^']|'')*'/g, "''")
    .replace(/"(?:[^"]|"")*"/g, '""')
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
}

export class SqlGuardError extends Error {}

export function assertSqlAllowed(sql: string): void {
  const statements = stripLiterals(sql)
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)

  if (statements.length === 0) {
    throw new SqlGuardError("Empty SQL statement.")
  }

  for (const statement of statements) {
    if (BLOCKED_ANYWHERE.test(statement)) {
      throw new SqlGuardError(
        `Statement type not allowed: ${statement.split(/\s/)[0].toUpperCase()}.`,
      )
    }

    if (/^pragma\b/i.test(statement) && statement.includes("=")) {
      throw new SqlGuardError("PRAGMA writes are not allowed.")
    }

    // Writes and DDL must not touch app meta tables (names starting with _).
    if (WRITE_VERBS.test(statement)) {
      // Find identifiers that start with underscore (quoted ones were stripped
      // to "" above, so check the raw statement for those separately).
      if (/(^|[\s(,."])_[a-z0-9_]*/i.test(statement.replace(/''|""/g, " "))) {
        throw new SqlGuardError(
          "Writes and schema changes on app tables (names starting with _) are not allowed. Reading them with SELECT is fine.",
        )
      }
    }
  }
}
