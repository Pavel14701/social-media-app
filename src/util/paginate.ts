export function paginate<T>(array: T[], pageSize: number, pageNumber: number): T[] {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}
