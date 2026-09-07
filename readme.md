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
