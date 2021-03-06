import * as uuid from 'uuid';

export function equalSet<T>(setA: Set<T>, setB: Set<T>): boolean {
  if (setA.size !== setB.size) {
    return false;
  }

  for (const valueA of setA) {
    if (!setB.has(valueA)) {
      return false;
    }
  }

  return true;
}

export function isValidUUID(input: string, version: number): boolean {
  return uuid.validate(input) && uuid.version(input) === version;
}

export function toArray<T = string>(string: string): T[] {
  return (string.split(',') as unknown) as T[];
}

export function toSet<T = string>(string: string): Set<T> {
  return new Set(toArray(string));
}

export function toBoolean(string: string): boolean {
  if (string === 'true') return true;
  if (string === 'false') return false;

  throw new TypeError('NOT_A_BOOLEAN');
}
