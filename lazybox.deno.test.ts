import {
    assertEquals,
    assertNotEquals,
} from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { Box, Lazy } from './lazybox.ts';

let pitch = (err: any) => {
    throw err;
};

let add = (y: any) => (x: any) => x + y;
let sub = (y: any) => (x: any) => x - y;
let mul = (y: any) => (x: any) => x * y;

Deno.test('Box(1)', () => {
    let x = 1;

    let plus1 = add(1);
    let times7 = mul(7);
    let minus13 = sub(13);

    let [y] = [x].map(plus1).map(times7).map(minus13);
    let [z] = Box(x).map(plus1).map(times7).map(minus13);

    assertEquals(y, (x + 1) * 7 - 13);
    assertEquals(z, (x + 1) * 7 - 13);
});

Deno.test('Box(undefined)', () => {
    let x;
    let fallback = 42;
    let [unsafeResult = fallback] = [x].map(add(1)).map(mul(7)).map(sub(13));
    let [safeResult = fallback] = Box(x).map(add(1)).map(mul(7)).map(sub(13));

    assertEquals(safeResult, fallback);
    assertNotEquals(unsafeResult, fallback);
    assertEquals(unsafeResult, NaN);
});

Deno.test('Box().flatMap', () => {
    let x = 1;
    let box = Box(x);
    let [y] = [x].flatMap(add(1)).flatMap(mul(7)).flatMap(sub(13));
    let [z] = box.flatMap(add(1)).flatMap(mul(7)).flatMap(sub(13));

    assertEquals(y, (x + 1) * 7 - 13);
    assertEquals(z, (x + 1) * 7 - 13);
});

Deno.test('lazyFetch', async () => {
    let x = 42;
    let _fetch = async (url: string) => x;
    let lazyFetch = (url: string) => Lazy(() => _fetch(url));

    let y = lazyFetch('https://example.com')
        .map(add(1))
        .map(sub(7))
        .map(add(13))
        .exec();

    assertEquals(await y, x + 1 - 7 + 13);
});

(async function testLazyElection() {
    let Red = Symbol('Red');
    let Blue = Symbol('Blue');

    type Player = typeof Red | typeof Blue;
    type News = [Player, string];

    let randomWinner = [Red, Blue][Math.round(Math.random())];

    let election = (): Player => randomWinner;
    let lazyElection = (): Lazy<Player> => Lazy(async () => election());

    let complain = (winner: Player) =>
        Lazy(async (): Promise<News> => [winner, '💩']);

    let celebrate = (winner: Player) =>
        Lazy(async (): Promise<News> => [winner, '🎉']);

    let report = (winner: Player, news: string) =>
        Lazy(async () => {
            console.log(news);
            return winner;
        });

    Deno.test('without flatMap', async () => {
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

        assertEquals(winner, randomWinner);
    });

    Deno.test('with flatMap', async () => {
        let someFutureElection = lazyElection()
            .flatMap((winner) => complain(winner))
            .flatMap(([winner, news]) => report(winner, news))
            .flatMap((winner) => celebrate(winner))
            .flatMap(([winner, news]) => report(winner, news));

        assertEquals(await someFutureElection.exec(), randomWinner);
    });
})().catch(pitch);

Deno.test('lazyClock', async () => {
    let now = new Date();
    let x = now.valueOf();

    let clock = () => x;
    let lazyClock = () => async () => clock();

    let deferredClock = Lazy(lazyClock());

    let futureClock = deferredClock.map(add(42)).map(sub(13));

    let y = futureClock.exec();

    assertEquals(await y, x + 42 - 13);
});
