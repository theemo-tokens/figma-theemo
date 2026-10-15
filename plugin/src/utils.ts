export function serialize(data: unknown) {
  if (typeof data === 'object') {
    const ret = {};

    for (const prop in data) {
      if (typeof data[prop] === 'symbol') {
        // values like `figma.mixed` can't be serialized for postMessage
        continue;
      }

      if (Array.isArray(data[prop])) {
        ret[prop] = data[prop].map(flatSerialize);
      } else if (typeof data[prop] === 'object') {
        ret[prop] = serialize(data[prop]);
      } else {
        ret[prop] = data[prop];
      }
    }

    return ret;
  }

  return data;
}

function flatSerialize(data: unknown) {
  if (typeof data === 'object') {
    const ret = {};

    for (const prop in data) {
      if (typeof data[prop] === 'symbol') {
        continue;
      }

      ret[prop] = data[prop];
    }

    return ret;
  }

  return data;
}