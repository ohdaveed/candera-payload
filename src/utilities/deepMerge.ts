/** True for plain-object-like values (not arrays, not null). */
export function isObject(item: unknown): item is Record<string, unknown> {
  return typeof item === 'object' && item !== null && !Array.isArray(item)
}

/**
 * Deep merge two objects: `source` values win, nested plain objects merge
 * recursively, arrays and scalars are replaced wholesale.
 */
export default function deepMerge<T, R>(target: T, source: R): T {
  const output = { ...target } as Record<string, unknown>
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key]
      const targetValue = (target as Record<string, unknown>)[key]
      if (isObject(sourceValue) && key in target && isObject(targetValue)) {
        output[key] = deepMerge(targetValue, sourceValue)
      } else {
        output[key] = sourceValue
      }
    })
  }

  return output as T
}
