# Rolster React

Package containing generic hooks and utilities for React projects.

## Installation

```
npm i @rolster/react
```

## Configuration

You must install the `@rolster/types` package to define package data types, which are configured by adding them to the `files` property of the `tsconfig.json` file.

```json
{
  "files": ["node_modules/@rolster/types/index.d.ts"]
}
```

## Hooks

### usePromise

Runs an async factory and exposes its outcome as a `PromiseState<T>`, an `Optional<PromiseValue<T>>` from `@rolster/commons` where `PromiseValue<T>` is `{ value?: T, error?: unknown }`. The state is empty while pending, and results arriving after unmount are ignored. Pass a dependency list to run the factory again; the state resets to empty on each run.

```tsx
import { usePromise } from '@rolster/react';

function Profile({ userId }: { userId: string }) {
  const state = usePromise(() => fetchUser(userId), [userId]);

  return state.when(
    ({ value, error }) =>
      value ? <User user={value} /> : <Failure error={error} />,
    () => <Loading />
  );
}
```

### useScreenDisplay

Tracks whether the viewport is `mobile` or `web` and returns a `ScreenDisplayState` (a `SealedPartial` from `@rolster/commons`). The state instance only changes when the viewport crosses the breakpoint, so it is safe to use as a dependency. Default breakpoint is `640px`, exported as the constant `SCREEN_DISPLAY_BREAKPOINT`.

```tsx
import { useScreenDisplay } from '@rolster/react';

function Layout() {
  const display = useScreenDisplay(); // or useScreenDisplay(1024)

  return display.when({
    mobile: () => <MobileNavbar />,
    web: () => <Sidebar />
  });
}
```

### useElapsedTime

Returns the time elapsed since a date as an `ElapsedTime` (`{ minutes, chronometer, timestamp }`), where `chronometer` is formatted `HH:MM`. It refreshes every minute by default; pass a second argument to change the interval in milliseconds. Recalculates when the date changes.

```tsx
import { useElapsedTime } from '@rolster/react';

function OrderTimer({ createdAt }: { createdAt: Date }) {
  const { chronometer, minutes } = useElapsedTime(createdAt);

  return <span title={`${minutes} min`}>{chronometer}</span>;
}
```

The calculation is also exported as `calculateElapsedTime(dateAt: Date): ElapsedTime` for use outside components:

```ts
import { calculateElapsedTime } from '@rolster/react';

const { chronometer } = calculateElapsedTime(order.createdAt); // '01:05'
```

### useSelectionSet

Manages a multi-selection of values on top of `SelectionSet` from `@rolster/commons` and returns a `SelectionSetController<T>`. Accepts an optional `SelectionEquals<T>` function (`(a, b) => boolean`) to match values by identity (for example by `uuid`). `toggleAll` selects the missing values, or unselects them all when every value is already selected; `refresh` prunes the selection so it only keeps values still present in the given list. Action callbacks are stable across renders.

| Member                | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `selecteds`           | `T[]` with the selected values                           |
| `size` / `isEmpty`    | number of selected values / whether none is selected     |
| `contains(value)`     | whether the value is selected                            |
| `containsAll(values)` | whether every given value is selected                    |
| `containsAny(values)` | whether at least one of the given values is selected     |
| `toggle(value)`       | selects or unselects the value                           |
| `toggleAll(values)`   | selects the missing values, or unselects all of them     |
| `refresh(values)`     | keeps only the selected values present in the given list |
| `clear()`             | unselects everything                                     |

```tsx
import { useSelectionSet } from '@rolster/react';

function Catalog({ items }: { items: Item[] }) {
  const selection = useSelectionSet<Item>([], (a, b) => a.uuid === b.uuid);

  return (
    <>
      <Checkbox
        checked={selection.containsAll(items)}
        onChange={() => selection.toggleAll(items)}
      />
      {items.map((item) => (
        <Row
          key={item.uuid}
          selected={selection.contains(item)}
          onClick={() => selection.toggle(item)}
        />
      ))}
      <Footer count={selection.size} onClear={selection.clear} />
    </>
  );
}
```

### usePaginationNavigation

Connects a paginated list to its scroll container and returns a `PaginationNavigation<E>` (`{ containerRef, onPagination }`). Every `PaginationEvent` forwards its `suggestions` to your callback, and when the page changes the container scrolls back to top. The `PaginationEvent<E>` type (`{ currentPage, firstPage, lastPage, suggestions }`) is the same shape emitted by `RlsPagination` in `@rolster/react-components`.

```tsx
import { usePaginationNavigation } from '@rolster/react';

function Catalog({ items }: { items: Item[] }) {
  const [visibles, setVisibles] = useState<Item[]>([]);

  const { containerRef, onPagination } = usePaginationNavigation(setVisibles);

  return (
    <div ref={containerRef} className="catalog">
      {visibles.map((item) => (
        <Row key={item.uuid} item={item} />
      ))}
      <RlsPagination suggestions={items} onPagination={onPagination} />
    </div>
  );
}
```

### useCatalogNavigation

Extends `usePaginationNavigation` with memory: it stores the current `keyword`, `page` and `scrollTop` (a `CatalogNavigationState`) in `CatalogNavigationStore`, and restores page and scroll when the user comes back from a detail route of the same catalog. It takes a `CatalogNavigationProps` (`{ pathname, onLastPage, keyword? }`) and returns a `CatalogNavigation<E>` (`{ containerRef, onPagination, onScroll, records, position? }`). It is router agnostic: pass the current `pathname` from your router of choice and call `store.track(pathname)` on every route change (usually once, at the application shell).

```tsx
import { useCatalogNavigation } from '@rolster/react';
import { useLocation } from 'react-router';

function Catalog({ items, keyword }: { items: Item[]; keyword: string }) {
  const { pathname } = useLocation();

  const { containerRef, onPagination, onScroll, position, records } =
    useCatalogNavigation<Item>({
      pathname,
      keyword,
      onLastPage: () => repository.requestPagination()
    });

  return (
    <div ref={containerRef} className="catalog" onScroll={onScroll}>
      {records.map((item) => (
        <Row key={item.uuid} item={item} />
      ))}
      <RlsPagination
        suggestions={items}
        position={position}
        onPagination={onPagination}
      />
    </div>
  );
}
```

### useStore

Creates a local state container with the same shape as the `Store` from `@rolster/nexus`, backed by `useState`: the state is a `LiteralObject`, it is kept frozen, and every update re-renders the component. There is no `subscribe` or `listen` because React already reacts to the change. `setValue` merges partially, `reduce` replaces the state with the reducer result, `select` derives a value from the current state and `reset` restores the initial state of the first render. It returns a `ReactStore<T>`; the reducer and selector callbacks are typed as `StoreReducer<T>` (`(state: Readonly<T>) => T`) and `StoreSelector<T, V>` (`(state: Readonly<T>) => V`). The returned store keeps the same identity while the state does not change, so it is safe to pass down as a prop or dependency.

```tsx
import { useStore } from '@rolster/react';

interface CartState {
  items: Product[];
  total: number;
}

function Cart() {
  const cart = useStore<CartState>({ items: [], total: 0 });

  const addItem = (product: Product) => {
    cart.reduce((state) => ({
      items: [...state.items, product],
      total: state.total + product.price
    }));
  };

  return (
    <div>
      <span>{cart.select((state) => state.items.length)} items</span>
      <span>{cart.value.total}</span>
      <button onClick={cart.reset}>Clear</button>
    </div>
  );
}
```

### createStoreContext

Shares one `useStore` between the components of a subtree. It returns a `StoreContext<T>` with a `StoreProvider` that owns the state and a `useStoreContext` hook that reads it; every consumer under the same provider receives the same store, and different providers keep isolated states. The provider props (`StoreProviderProps<T>`) accept `children` and an optional `initial` that overrides the default given at creation. Using the hook outside its provider throws.

```tsx
import { createStoreContext } from '@rolster/react';

const { StoreProvider, useStoreContext } = createStoreContext<CartState>({
  items: [],
  total: 0
});

function CartTotal() {
  const cart = useStoreContext();

  return <span>{cart.value.total}</span>;
}

function App() {
  return (
    <StoreProvider>
      <Catalog />
      <CartTotal />
    </StoreProvider>
  );
}
```

## Stores

### CatalogNavigationStore

Remembers the navigation state of a catalog (`keyword`, `page`, `scrollTop`) so it can be restored when the user comes back from a detail route. A route counts as a detail when its next segment after the catalog path is a UUID. The store is registered as a singleton in `@rolster/invertly`; call `reset()` when the session ends. `useCatalogNavigation` uses it under the hood.

```ts
import { invertly } from '@rolster/invertly';
import { CatalogNavigationStore } from '@rolster/react';

const store = invertly(CatalogNavigationStore);

store.track(pathname); // call on every route change
store.remember('/products', { keyword: 'shirt', page: 2, scrollTop: 480 });

store.restorable('/products'); // state when coming back from /products/<uuid>
store.reset(); // on logout
```

## Helpers

### scrollToPosition

Scrolls a container to the given position, honoring the user's `prefers-reduced-motion` setting. Does nothing when the element is `null` or `undefined`.

```ts
import { scrollToPosition } from '@rolster/react';

scrollToPosition(containerRef.current); // top
scrollToPosition(containerRef.current, 240);
```

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
