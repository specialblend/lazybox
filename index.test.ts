import { Box, Lazy } from './index';

let add = (y: any) => (x: any) => x + y;
let sub = (y: any) => (x: any) => x - y;
let mul = (y: any) => (x: any) => x * y;

test('Box().map', () => {
    let x = 1;
    let box = Box(x);
    let [y] = [x]
        .map(add(1))
        .map(mul(7))
        .map((x) => x)
        .map(sub(13));
    let [z] = box
        .map(add(1))
        .map(mul(7))
        .map((x) => x)
        .map(sub(13));

    expect(y).toBe((x + 1) * 7 - 13);
    expect(z).toBe((x + 1) * 7 - 13);
});

test('Box().flatMap', () => {
    let x = 1;
    let box = Box(x);
    let [y] = [x]
        .flatMap(add(1))
        .flatMap(mul(7))
        .flatMap((x) => x)
        .flatMap(sub(13));
    let [z] = box
        .flatMap(add(1))
        .flatMap(mul(7))
        .flatMap((x) => x)
        .flatMap(sub(13));

    expect(y).toBe((x + 1) * 7 - 13);
    expect(z).toBe((x + 1) * 7 - 13);
});

test('lazyFetch(1)', async () => {
    let x = 42;
    let _fetch = async (url: string) => x;
    let lazyFetch = (url: string) => Lazy(() => _fetch(url));

    let y = lazyFetch('https://example.com')
        .map(add(1))
        .map(sub(7))
        .map(add(13))
        .exec();

    expect(await y).toBe(x + 1 - 7 + 13);
});

describe('lazyElection', () => {
    let Red = Symbol('Red');
    let Blue = Symbol('Blue');

    type Player = typeof Red | typeof Blue;
    type News = [Player, string];

    let randomWinner = [Red, Blue][Math.round(Math.random())];

    let election = (): Player => randomWinner;
    let lazyElection = () => Lazy(async () => election());

    let complain = (winner: Player) =>
        Lazy(async (): Promise<News> => [winner, '💩']);

    let celebrate = (winner: Player) =>
        Lazy(async (): Promise<News> => [winner, '🎉']);

    let report = (winner: Player, news: string) =>
        Lazy(async () => {
            console.log(news);
            return winner;
        });

    test('without flatMap', async () => {
        // don't try this at home
        let someFutureElection = lazyElection()
            .map((winner) => complain(winner))
            .map((result) =>
                Lazy(async () => {
                    let [winner, news] = await result.exec();
                    return report(winner, news);
                }),
            )
            .map((result) =>
                Lazy(async () => {
                    const winner = await (await result.exec()).exec();
                    return celebrate(winner);
                }),
            )
            .map((result) =>
                Lazy(async () => {
                    let [winner, news] = await (await result.exec()).exec();
                    return report(winner, news);
                }),
            );

        let winner = await (
            await (await someFutureElection.exec()).exec()
        ).exec();

        expect(winner).toBe(randomWinner);
    });

    test('with flatMap', async () => {
        let someFutureElection = lazyElection()
            .flatMap((winner) => complain(winner))
            .flatMap(([winner, news]) => report(winner, news))
            .flatMap((winner) => celebrate(winner))
            .flatMap(([winner, news]) => report(winner, news));

        expect(await someFutureElection.exec()).toBe(randomWinner);
    });
});

test('lazyClock', async () => {
    let now = new Date();
    let x = now.valueOf();

    let clock = () => x;
    let lazyClock = () => async () => clock();

    let deferredClock = Lazy(lazyClock());

    let futureClock = deferredClock.map(add(42)).map(sub(13));

    let y = futureClock.exec();

    expect(await y).toBe(x + 42 - 13);
});
