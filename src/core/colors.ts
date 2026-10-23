/**
 * Checks that a resolved variable value actually is an rgb/rgba color
 * (finite numeric channels). Shared guard for the write-back paths, which
 * must never push non-color or out-of-gamut values into setValueForMode -
 * alias chains can resolve to FLOAT/STRING values, published-library
 * variables, or Display-P3 channels outside 0..1.
 */
export function isColorValue(value: unknown): value is RGBA {
  const v = value as Partial<RGB> | null | undefined;

  return (
    typeof v === 'object' &&
    v !== null &&
    [v.r, v.g, v.b].every((c) => typeof c === 'number' && Number.isFinite(c))
  );
}
