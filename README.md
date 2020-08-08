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

const queries = {
  mobile: { maxWidth: 600 },
  tablet: { width: '600..1024' },
  desktop: { minWidth: 1024 },
  printer: { type: 'print' },
  blackAndWhiteScreen: { type: 'screen', monochrome: 1 }
}

const Example = props => {
  const mediaStates = useMediaSet(queries);

  if (mediaStates.has('desktop')) {
    return <DesktopVersion {...props} />;
  } else {
    return <MobileVersion {...props} />;
  }
}
```

## API

```javascript
const result = useMediaSet(queries, [ssrDefaults]);
```

* `queries` is an object where the keys are arbitrary names for a list of media query expressions. The media query expressions can either be strings (see [Using Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries) from MDN), or an object notation (see "Media Query Object Syntax" below). If `queries` is not specified or `undefined`, a default set of width breakpoints will be used to implement `small`, `medium`, and `large` result values, which may or may not be useful to you:

      // Default media types based on window width:
      //   small <= 37em < medium <= 56em < large
      const DEFAULT_BREAKPOINTS = {
        small: { width: '..592' },
        medium: { width: '593..896' },
        large: { width: '897..' },
      };

* `ssrDefaults` is an optional second argument that can be used to specify a default set of media query matches if the component is being rendered server-side (in which case `matchMedia` is not available). It is ignored in a real browser where `matchMedia` is implemented. It defaults to the empty set. If something other than a `Set` is passed for this argument, the hook will throw an error.

* `result` is returned and will be a Javascript `Set` containing the keys (as strings) from `queries` for which the corresponding query matches. There can be zero, one, or multiple matching queries, so `Set` is an appropriate data type here.

If the window is resized or the matching queries otherwise change, your component will automatically re-render and the new matching queries will be available in `result`. This allows you to write multiple renderings for your component for different media and it will automatically respond to changes in the matching queries.

The hook tries very hard to make the component not re-render more than necessary, to improve performance.

## Media Query Object Syntax

Media queries follow a set of syntax rules that originated with CSS and can be a little awkward when writing code that needs to represent responsive breakpoints. To that end, when using this hook, you can express your media queries using a more natural syntax based on JavaScript data structures.

### Strings, Objects, or Arrays

Using a string as a media query will not get transformed in any way, for compatibility with existing syntax, if that's how you prefer to write them.

A string query is not validated in any way, merely passed down.

An object will be interpreted as a set of media features, one per key in the object. Use camelCase instead of kebab-case for the keys, for instance `deviceAspectRatio` for `device-aspect-ratio`. One special key, `type`, is used to represent the media type in the query, if something other than the default `all` is desired.

An object query undergoes some validations, such as for recognized media feature names, invalid values for features, or incorrect data structures. If a validation fails, a `console.error` message is printed, and the query becomes `not all` which never match (the browser `window.matchMedia()` function does a similar substitution if it catches an error).

To combine two or more media queries in an OR-like fashion so that any one will match, write them as multiple separate objects in an array.

### Media types

If you wish to represent a media type, do so as the value of the `type` property, such as `{ type: 'screen' }`. The `only` and `not` modifiers are supported, such as `{ type: 'not print' }` but remember that the `not` modifier negates the _entire_ query, not just that media type.

Note that only one media type can be represented this way, which is also true in the native syntax.

### Media features

Media features are specified with their name as the object key, camelCased as mentioned above.

For media features that accept sizes as their value (basically all the widths and heights), if the value is a number (or a string containing a number), it will be assumed to be a pixel value and `px` will get appended automatically.

To specify a feature with no value, use boolean `true`, for example `{ color: true }` becomes `(color)`. A boolean `false` value has no meaning and will generate an error.

For media features that accept min and max values (for instance, corresponding to `height` is `min-height` and `max-height`), you can use a range syntax instead of the min- and max- variants, which can be more readable. To specify a range, either use a two-element array or a string with two values separated by two periods (`..`). Examples:

* `{ minHeight: '30em' }` &rarr; `(min-height: 30em)`
* `{ height: 50 }` &rarr; `(height: 50px)` ...Matches only that precise value
* `{ width: '600..800' }` &rarr; `(min-width: 600px) and (max-width: 800px)` ...Specifying a range with both values expands into two features, one each for min and max
* `{ width: [600, 800] }` &rarr; ...Same as above, if an array is more convenient
* `{ width: '..960' }` &rarr; `(max-width: 960px)` ...Same as `{ maxWidth: 960 }` but writing it as a one-ended range may in certain cases convey your intent more clearly

### Longer examples

Here is the entirety of a `queries` object to pass to `useMediaSet` with several named queries, any number of which might match and get included in the result `Set`. For the sake of argument, let's say we need to know when:

* The device has a total width between 1280 and 3840 pixels
* The device is a black and white screen (monochrome with a bit-depth of 1)
* The window is 1000 pixels high or shorter, and the width is between 30 and 75 ems
* The device is either a color screen at least 1920 pixels wide, or a TV (_n.b._ not actually recommended as the `tv` media type is being deprecated)

We could call `useMediaSet` with the following object as argument in order to implement all of the above queries at once.

      {
        niceDevice: { deviceWidth: [1280, 3840] },
        bw: { type: 'screen', monochrome: 1 },
        funSize: { maxHeight: 1000, width: '30em..75em' },
        bigScreen: [
          { type: 'screen', color: true, deviceWidth: '1920..' },
          { type: 'tv' }
        ]
      }

## Considerations for Server-Side Rendering (SSR)

If you are making use of SSR to render an initial view of your application server-side and then hydrating it once the client JS loads, you will have to make a decision about which responsive view you want to render on the server, _i.e._, which set of media query matches you want to use. Once you have decided what to render by default in the SSR, you can work out the corresponding media match Set elements and specify those as the `ssrDefaults` parameter to the hook.

There's no way for the server-side renderer to know what the particulars of the client display window are, so as a developer you will simply have to try to make your best guess of what the most common browser-side configuration will be. When the client JS initializes and hydrates the DOM itself, if the server side guess was correct then no additional re-renders will need to happen; if it was wrong then the component tree will re-render just as in any responsive action.

## Considerations for tests

Some testing frameworks (most notably Jest with JSDOM) do not implement `matchMedia` on `window` so this hook cannot function. If `matchMedia` is not present, the hook's fallback behavior is just to return the `ssrDefaults` (or the empty Set if no `ssrDefaults` are specified) as if it were operating in SSR. In that case, the hook will never trigger a re-render.

If you need to test different responsive codepaths, however, you have a few choices:

* You can use the `ssrDefaults` parameter to force certain returned set elements for various responsive cases, and test those individually.
* You can mock out the hook itself and use the mock to return the appropriate result Sets.
* Or you can mock an implementation for `window.matchMedia` so that the hook functions normally, and then control that mock to get your component to change behavior. For a start, see the test for this hook itself in `src/index.test.js`.

## License

MIT © [Charley Kline](https://github.com/cvkline)

---

This hook was created using [create-react-hook](https://github.com/hermanya/create-react-hook).
