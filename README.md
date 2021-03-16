# lazybox

tiny JS/TS Maybe & IO monads for the lazy functional programmer

## install

### Node

```
npm i @specialblend/lazybox
```

```typescript
import { Lazy, Box } from '@specialblend/lazybox';

let add = (y: any) => (x: any) => x + y;
let sub = (y: any) => (x: any) => x - y;
let mul = (y: any) => (x: any) => x * y;

test('Box', () => {
  let x = 1;
  let box = Box(x);
  let [y] = box
    .map(add(1))
    .map(mul(7))
    .map((x) => x)
    .map(sub(13));

  expect(y).toBe((x + 1) * 7 - 13);
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

### Deno

```typescript
import { Lazy, Box } from 'https://github.com/specialblend/lazybox/raw/main/lazybox.ts';

let add = (y: any) => (x: any) => x + y;
let sub = (y: any) => (x: any) => x - y;
let mul = (y: any) => (x: any) => x * y;

Deno.test('Box', () => {
  let x = 1;
  let box = Box(x);
  let [y] = box
    .map(add(1))
    .map(mul(7))
    .map((x) => x)
    .map(sub(13));

  expect(y).toBe((x + 1) * 7 - 13);
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
