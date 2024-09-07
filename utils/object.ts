export const omit = <T extends Record<string, any>, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> => {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    result[key] = obj[key];
  }

  return result;
};

export const entriesToObject = (entries: [string, unknown][]): Record<string, string | string[]> => entries
  .reduce((obj, [key, value]) => {
    if (key in obj) {
      obj[key] = Array.isArray(obj[key]) ? [...obj[key], value] : [obj[key], value];
    } else {
      obj[key] = value;
    }
    return obj;
  }, {} as any);
