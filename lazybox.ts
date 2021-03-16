export type None = [];
export type Some<T> = [T];
export type Maybe<T> = Some<T> | None;

export interface Lazy<T> {
    exec(): Promise<T>;
    map<U>(fn: (x: T) => U): Lazy<U>;
    flatMap<U>(fn: (x: T) => Lazy<U>): Lazy<U>;
}

export function Box<T>(x?: T): Maybe<T> {
    return typeof x === 'undefined' ? [] : [x];
}

export function Lazy<T>(exec: () => Promise<T>): Lazy<T> {
    let trap: Lazy<T> = {
        exec,
        flatMap(fn) {
            return Lazy(() => exec().then((x) => fn(x).exec()));
        },
        map(fn) {
            return Lazy(() => exec().then(fn));
        },
    };
    let proxy = new Proxy([exec], {
        get(target, key) {
            return Reflect.get(trap, key) || Reflect.get(target, key);
        },
    });
    return Object.assign({}, trap, proxy);
}

Lazy.of = function of<T>(x: T): Lazy<T> {
    return Lazy(async () => x);
};
