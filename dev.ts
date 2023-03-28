const METADATA = new Map<any, any>();

function has(keySet: any[]) {
  let map = METADATA;

  for (let i = 0; i < keySet.length; i++) {
    const key = keySet[i];

    if (i === keySet.length - 1) {
      return map.has(key);
    } else {
      if (map.has(key)) {
        map = map.get(key);
      } else {
        return false;
      }
    }
  }
}

function set(keySet: any[], value: any) {
  let map = METADATA;

  for (let i = 0; i < keySet.length; i++) {
    const key = keySet[i];

    if (i === keySet.length - 1) {
      map.set(key, value);
      return value;
    } else {
      if (!map.has(key)) {
        const newMap = new Map();
        map.set(key, newMap);
        map = newMap;
      } else {
        map = map.get(key);
      }
    }
  }
}

function get(keySet: any[]) {
  let map = METADATA;

  for (let i = 0; i < keySet.length; i++) {
    const key = keySet[i];

    if (i === keySet.length - 1) {
      return map.get(key) || null;
    } else {
      if (map.has(key)) {
        map = map.get(key);
      } else {
        return null;
      }
    }
  }
}
