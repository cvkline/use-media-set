# use-media-set

> Custom hook to make components responsive to media query changes

[![NPM](https://img.shields.io/npm/v/use-media-set.svg)](https://www.npmjs.com/package/use-media-set) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-media-set
```

## Example Usage

```jsx
import React from 'react';
import DesktopVersion from './DesktopVersion';
import MobileVersion from './MobileVersion';
import { useMediaSet } from 'use-media-set';

const widthBreaks = {
  mobile: '(max-width: 600px)',
  tablet: '(min-width: 600px) and (max-width: 1024px)',
  desktop: '(min-width: 1024px)'
}

const Example = () => {
  const mediaStates = useMediaSet(widthBreaks);

  if (mediaStates.has('desktop')) {
    return <DesktopVersion>;
  } else {
    return <MobileVersion>;
  }
}
```

## API

```javascript
const result = useMediaSet(queries);
```

* `queries` is an object where the keys are arbitrary names for a list of media query expressions (see [Using Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries) from MDN). If `queries` is not specified or `undefined`, a default set of width breakpoints will be used to implement `small`, `medium`, and `large` result values, which may or may not be useful to you:

      const DEFAULT_BREAKPOINTS = {
        small: '(max-width: 592px)', // = 37em
        medium: '(min-width: 593px) and (max-width: 896px)', // = 56em
        large: '(min-width: 897px)'
      };

* `result` is returned and will be a Javascript `Set` containing the keys (as strings) from `queries` for which the corresponding query matches. There can be zero, one, or multiple matching queries, so `Set` is an appropriate data type here.

If the window is resized or the matching queries otherwise change, your component will automatically re-render and the new matching queries will be available in `result`. This allows you to write multiple renderings for your component for different media and it will automatically respond to changes in the matching queries.

## Considerations for tests

Some testing frameworks (most notably Jest with JSDOM) do not implement `matchMedia` on `window` so this hook cannot function. If `matchMedia` is not present, the hook's fallback behavior is just to return an empty Set, and it will never trigger a re-render.

If your component tests will work without the responsive behavior, you can just use that fallback behavior. If you need to test different responsive codepaths, however, you have a couple of choices.

You can mock out the hook itself and use the mock to return the appropriate result Sets.

Or you can mock an implementation for `window.matchMedia` so that the hook functions normally, and then control that mock to get your component to change behavior. For a start, see the test for this hook itself in `src/index.test.js`.

## License

MIT © [Charley Kline](https://github.com/cvkline)

---

This hook was created using [create-react-hook](https://github.com/hermanya/create-react-hook).
