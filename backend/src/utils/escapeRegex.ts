/**
 * Escapes a user-supplied string for safe use inside a MongoDB $regex.
 *
 * Without this, a search for "(a+)+$" is compiled as a pattern rather than
 * matched literally — which both breaks the search and lets a request pin a
 * CPU core for as long as the engine backtracks.
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive "contains" filter built from untrusted input. */
export function containsFilter(input: string) {
  return { $regex: escapeRegex(input), $options: 'i' as const };
}
