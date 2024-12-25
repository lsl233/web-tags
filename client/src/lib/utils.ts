import { clsx, type ClassValue } from "clsx";
import { Tag, TagWithLevel } from "shared/tag";
import { TagWithChildrenAndParentAndLevel } from "shared/tag";
import { twMerge } from "tailwind-merge";

export function mapTagsWithLevels(
  tags: TagWithChildrenAndParentAndLevel[],
  level: number = 1
): TagWithChildrenAndParentAndLevel[] {
  return tags.map((tag, index) => {
    const result = {
      ...tag,
      level: level,
      children: mapTagsWithLevels(tag.children, level + 1),
    }
    if (!result.sortOrder) {
      result.sortOrder = index
    }
    return result
  });
}

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
    result.unshift(...flattenParentKey(obj.parent, key))
  }
  return result
}

export function flatten(
  arr: TagWithChildrenAndParentAndLevel[],
  parentName = ""
): TagWithLevel[] {
  return arr.flatMap((item) => {
    const fullName = parentName ? `${parentName}/${item.name}` : item.name;
    const { children, name, ...rest } = item;
    return [{ ...rest, name: fullName }, ...flatten(children || [], fullName)];
  });
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export function uniqueArrayByKey<T>(arr: T[], key: keyof T) {
  const seen = new Set();
  return arr.filter(item => {
    if (seen.has(item[key])) {
      return false;
    }
    seen.add(item[key]);
    return true;
  });
}

export const isInternalPage = (url: string) => {
  return url.startsWith("chrome://") || url.startsWith("chrome-extension://");
};