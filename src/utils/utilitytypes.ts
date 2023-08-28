export type Maybe<T> = T | null;

export type ElementOf<T> = T extends (infer E)[] ? E : never;

export type PromiseReturnType<T extends (...args: any) => any> =
  ReturnType<T> extends Promise<infer U> ? U : ReturnType<T>;
