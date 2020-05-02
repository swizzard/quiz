import { cloneDeep, set } from 'lodash';

export function deepSet(old, val, path) {
  return set(cloneDeep(old), path, val);
}

export function removeAt(arr, ix) {
  return arr.reduce((acc, v, aix) => {
    if (aix === ix) {
      return acc;
    } else {
      acc.push(v);
      return acc;
    }
  }, []);
}
