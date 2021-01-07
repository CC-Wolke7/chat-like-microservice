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
