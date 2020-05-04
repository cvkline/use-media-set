import { useCallback, useState, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { asMediaQuery } from './asMediaQuery';

const DELAY = 50;

// default media types based on window size:
//   small <= 37em < medium <= 56em < large
const DEFAULT_BREAKPOINTS = {
  small: { width: '..592' }, // = 37em
  medium: { width: '593..896' }, // = 56em
  large: { width: '897..' },
};

export function useMediaSet(breakpoints = DEFAULT_BREAKPOINTS) {
  // If matchMedia is not present (as in some test environments),
  // just return a constant empty set. This early return is technically
  // a violation of the Rules of Hooks but since the early return will
  // either always happen or never happen, the behavior is safe.
  if (!window.matchMedia) return new Set();

  const initialRender = useRef(true);
  const queryLists = new Map();

  // for each named breakpoint, create a media query for it
  function makeNewQueryLists() {
    queryLists.clear();
    Object.keys(breakpoints).forEach(function (k) {
      try {
        const bkp = asMediaQuery(breakpoints[k]);
        queryLists.set(k, window.matchMedia(bkp));
      } catch (e) {
        console.error(e.toString());
      }
    });
  }

  // returns a Set of the names of queries in the list that currently match
  function matchingBreakpoints() {
    const result = new Set();
    for (const [k, v] of queryLists) {
      if (v.matches) result.add(k);
    }
    return result;
  }

  // prime the initial query list so we can determine the initial state
  if (initialRender.current) makeNewQueryLists();

  const [mediaSet, setMediaSet] = useState(matchingBreakpoints);
  const debouncedSet = useCallback(debounce(setMediaSet, DELAY), []);

  useEffect(
    function () {
      function onChange() {
        debouncedSet(matchingBreakpoints);
      }

      function cleanup() {
        queryLists.forEach(v => v.removeListener(onChange));
        debouncedSet.cancel();
      }

      // don't make new query lists on the initial render because it just
      // got done up above
      if (initialRender.current) {
        initialRender.current = false;
      } else {
        makeNewQueryLists();
        setMediaSet(matchingBreakpoints);
      }

      queryLists.forEach(v => v.addListener(onChange));

      return cleanup;
    },
    [JSON.stringify(breakpoints)]
  );

  return mediaSet;
}
