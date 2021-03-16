export type None = [];
export type Some<T> = [T];
export type Maybe<T> = Some<T> | None;

export interface Lazy<T> {
    exec(): Promise<T>;
    map<U>(fn: (x: T) => U): Lazy<U>;
    flatMap<U>(fn: (x: T) => Lazy<U>): Lazy<U>;
}

export function Box<T>(x?: T): Maybe<T> {
    return x ? [x] : [];
}

export function Lazy<T>(exec: () => Promise<T>): Lazy<T> {
    // @ts-ignore
    return new Proxy(Box(exec), {
        get(obj, key) {
            let trap = {
                exec,
                flatMap<U>(fn: (x: T) => Lazy<U>) {
                    return Lazy(
                        () => exec().then((x) => fn(x).exec()),
                    );
                },
                map<U>(fn: (x: T) => U) {
                    return Lazy(() => exec().then(fn));
                },
            }
            return Reflect.get(trap, key) || Reflect.get(obj, key);
        },
    });
}

Lazy.of = Lazy;
