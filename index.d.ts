export declare type None = [];
export declare type Some<T> = [T];
export declare type Maybe<T> = Some<T> | None;
export interface Lazy<T> {
    exec(): Promise<T>;
    map<U>(fn: (x: T) => U): Lazy<U>;
    flatMap<U>(fn: (x: T) => Lazy<U>): Lazy<U>;
}
export declare function Box<T>(x?: T): Maybe<T>;
export declare function Lazy<T>(exec: () => Promise<T>): Lazy<T>;
