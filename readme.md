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

Runs an async factory and exposes its outcome as an `Optional<{ value?, error? }>` from `@rolster/commons`. The state is empty while pending, and results arriving after unmount are ignored. Pass a dependency list to run the factory again; the state resets to empty on each run.

```tsx
import { usePromise } from '@rolster/react';

function Profile({ userId }: { userId: string }) {
  const state = usePromise(() => fetchUser(userId), [userId]);

  return state.when(
    ({ value, error }) => (error ? <Failure /> : <User user={value} />),
    () => <Loading />
  );
}
```

### useScreenDisplay

Tracks whether the viewport is `mobile` or `web` and returns a `ScreenDisplayState` (a `SealedPartial` from `@rolster/commons`). The state instance only changes when the viewport crosses the breakpoint, so it is safe to use as a dependency. Default breakpoint is `640px`.

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

Returns the time elapsed since a date as `{ minutes, chronometer, timestamp }`, where `chronometer` is formatted `HH:MM`. It refreshes every minute by default; pass a second argument to change the interval in milliseconds. Recalculates when the date changes.

```tsx
import { useElapsedTime } from '@rolster/react';

function OrderTimer({ createdAt }: { createdAt: Date }) {
  const { chronometer, minutes } = useElapsedTime(createdAt);

  return <span title={`${minutes} min`}>{chronometer}</span>;
}
```

### useSelectionSet

Manages a multi-selection of values on top of `SelectionSet` from `@rolster/commons`. Accepts an optional equality function to match values by identity (for example by `uuid`). `toggleAll` selects the missing values, or unselects them all when every value is already selected; `refresh` prunes the selection so it only keeps values still present in the given list. Action callbacks are stable across renders.

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

Connects a paginated list to its scroll container. Every `PaginationEvent` forwards its `suggestions` to your callback, and when the page changes the container scrolls back to top. The `PaginationEvent<E>` type is structural (`{ currentPage, lastPage, suggestions }`) and compatible with the one emitted by `@rolster/react-components`.

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

Extends `usePaginationNavigation` with memory: it stores the current `keyword`, `page` and `scrollTop` in `CatalogNavigationStore`, and restores page and scroll when the user comes back from a detail route of the same catalog. It is router agnostic: pass the current `pathname` from your router of choice and call `store.track(pathname)` on every route change (usually once, at the application shell).

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
