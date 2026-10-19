export function serialize(data: unknown): unknown {
  if (typeof data === 'object') {
    const source = data as Record<string, unknown>;
    const ret: Record<string, unknown> = {};

    for (const prop in source) {
      if (typeof source[prop] === 'symbol') {
        // values like `figma.mixed` can't be serialized for postMessage
        continue;
      }

      if (Array.isArray(source[prop])) {
        ret[prop] = source[prop].map(flatSerialize);
      } else if (typeof source[prop] === 'object') {
        ret[prop] = serialize(source[prop]);
      } else {
        ret[prop] = source[prop];
      }
    }

    return ret;
  }

  return data;
}

function flatSerialize(data: unknown): unknown {
  if (typeof data === 'object') {
    const source = data as Record<string, unknown>;
    const ret: Record<string, unknown> = {};

    for (const prop in source) {
      if (typeof source[prop] === 'symbol') {
        continue;
      }

      ret[prop] = source[prop];
    }

    return ret;
  }

  return data;
}
