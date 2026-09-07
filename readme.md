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
