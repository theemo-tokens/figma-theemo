const SKIPPED_SERIALIZATION_FIELDS = ['consumers'];

export function serialize(object: Object) {
  const ret = {};

  for (const prop in object) {
    if (SKIPPED_SERIALIZATION_FIELDS.indexOf(prop) !== -1) {
      continue;
    }

    if (typeof object[prop] === 'object') {
      ret[prop] = serialize(object[prop]);
    } else {
      ret[prop] = object[prop];
    }
  }

  return ret;
}

export function getIdFromChange(change: StyleCreateChange | StylePropertyChange | StyleDeleteChange) {
  const { id } = change;
  const parts = id.split(',');
  return `${parts[0]},`;
}