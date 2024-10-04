import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function flattenChildren<T extends { children: T[] }>(arr: T[]): T[] {
  return arr.flatMap((item) => [item, ...flattenChildren(item.children)]);
}

export function flattenChildrenKey<T extends { children: T[] }>(
  arr: T[],
  key: keyof T
): T[keyof T][] {
  return arr.flatMap(
    (item) => [item[key], ...flattenChildrenKey(item.children, key)]
  );
}

export function flattenParentKey<T extends { parent: T }>(
  obj: T,
  key: keyof T
) {
  const result = [obj[key]]
  if (obj.parent) {
    result.push(...flattenParentKey(obj.parent, key))
  }
  return result
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
