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
  return uuid.validate(input) && uuid.version(input) == version;
}
