/** True for plain-object-like values (not arrays, not null). */
export function isObject(item: unknown): item is Record<string, unknown> {
  return typeof item === 'object' && item !== null && !Array.isArray(item)
}

/**
 * Deep merge two plain objects: `source` keys win; when a key holds a plain
 * object on BOTH sides it merges recursively, otherwise (arrays, scalars,
 * mixed types) the source value replaces the target's wholesale. If either
 * argument is not a plain object, `target` is returned unchanged.
 */
export default function deepMerge<T, R>(target: T, source: R): T {
  if (!isObject(target) || !isObject(source)) return target
  const output = { ...target } as Record<string, unknown>
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key]
    const targetValue = (target as Record<string, unknown>)[key]
    if (isObject(sourceValue) && key in target && isObject(targetValue)) {
      output[key] = deepMerge(targetValue, sourceValue)
    } else {
      output[key] = sourceValue
    }
  })

  return output as T
}
