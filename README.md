# lazybox

tiny JS/TS Maybe & IO monads for the lazy functional programmer

- `Box`: monadic [Maybe](https://en.wikipedia.org/wiki/Monad_(functional_programming)#An_example:_Maybe) wrapper around JS `Array`
- `Lazy`: monadic [IO](https://en.wikipedia.org/wiki/Monad_(functional_programming)#IO_monad_(Haskell)) wrapper around JS `Promise`

### install

- **node**: `npm i @specialblend/lazybox`

- **deno** (optional): `deno install https://github.com/specialblend/lazybox/raw/main/lazybox.ts`

## example

### node

```typescript
import { Lazy, Box } from '@specialblend/lazybox';

let add = (y: any) => (x: any) => x + y;
let sub = (y: any) => (x: any) => x - y;
let mul = (y: any) => (x: any) => x * y;

test('Box', () => {
  let x;
  let fallback = 42;
  let [unsafeResult = fallback] = [x].map(add(1)).map(mul(7)).map(sub(13));
  let [safeResult = fallback] = Box(x).map(add(1)).map(mul(7)).map(sub(13));

  expect(safeResult).toEqual(fallback);
  expect(unsafeResult).not.toEqual(fallback);
  expect(unsafeResult).toEqual(NaN);
});

test('lazyFetch', async () => {
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
```

### deno

```typescript
import { Lazy, Box } from 'https://github.com/specialblend/lazybox/raw/main/lazybox.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

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

Deno.test('lazyFetch', async () => {
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
```
