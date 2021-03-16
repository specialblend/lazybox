export type None = [];
export type Some<T> = [T];
export type Maybe<T> = Some<T> | None;

export interface Lazy<T> {
    exec(): Promise<T>;
    map<U>(fn: (x: T) => U): Lazy<U>;
    flatMap<U>(fn: (x: T) => Lazy<U>): Lazy<U>;
}

export function Box<T>(x?: T): Maybe<T>;
export function Lazy<T>(exec: () => Promise<T>): Lazy<T>;
