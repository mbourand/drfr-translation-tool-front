export const binarySearch = <T>(arr: T[], compareFn: (current: T) => number): number => {
  let left = 0
  let right = arr.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const cmp = compareFn(arr[mid])
    if (cmp === 0) {
      return mid
    } else if (cmp < 0) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return -1
}
