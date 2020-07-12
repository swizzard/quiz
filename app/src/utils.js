import { cloneDeep, get, set } from 'lodash';

export function deepSet(old, val, path) {
  return set(cloneDeep(old), path, val);
}

export function removeAt(arr, ix) {
  return filterBy(arr, (_, aix) => aix !== ix);
}

export function filterBy(arr, pred) {
  return arr.reduce((acc, v, aix) => {
    if (pred(v, aix)) {
      acc.push(v);
    }
    return acc;
  }, []);
}

export function filterOutBy(arr, pred) {
  return filterBy(arr, (v, aix) => !pred(v, aix));
}

export function reorder(obj, ix, step, path) {
  const arr = [...get(obj, path)];
  if (ix + step < 0 || ix + step >= arr.length) {
    return obj;
  }
  const o = arr[ix + step];
  const v = arr[ix];
  arr[ix + step] = v;
  arr[ix] = o;
  return deepSet(obj, arr, path);
}
