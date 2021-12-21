import { Merge } from "type-fest";

export type AsyncFunction = (...args: any[]) => Promise<any>;
/**
 * 扩展对象联合类型的每一项
 */
export type ExpandObjectUnion<
  Union,
  Item extends Record<string, unknown>
> = Union extends unknown ? Merge<Union, Item> : never;
export type NonNullableAll<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
export type ArrayItem<T> = T extends (infer P)[] ? P : never;
