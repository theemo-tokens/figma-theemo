export function getIdFromChange(change: StyleCreateChange | StylePropertyChange | StyleDeleteChange) {
  const { id } = change;
  const parts = id.split(',');
  return `${parts[0]},`;
}

export function filterObject(object: Record<string, unknown>, filter: string[] = []) {
  const ret: Record<string, unknown> = {};

  for (const prop in object) {
    if (filter.indexOf(prop) !== -1) {
      continue;
    }

    if (typeof object[prop] === 'object') {
      ret[prop] = filterObject(object[prop] as Record<string, unknown>, filter);
    } else {
      ret[prop] = object[prop];
    }
  }

  return ret;
}