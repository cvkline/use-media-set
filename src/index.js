import { useCallback, useState, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';

const DELAY = 50;

// default media types based on window size:
//   small <= 37em < medium <= 56em < large
const DEFAULT_BREAKPOINTS = {
  small: '(max-width: 592px)', // = 37em
  medium: '(min-width: 593px) and (max-width: 896px)', // = 56em
  large: '(min-width: 897px)',
};

export function useMediaSet(breakpoints = DEFAULT_BREAKPOINTS) {
  const initialRender = useRef(true);
  const queryLists = new Map();

  // for each named breakpoint, create a media query for it
  function makeNewQueryLists() {
    queryLists.clear();
    Object.keys(breakpoints).forEach(function (k) {
      queryLists.set(k, window.matchMedia(breakpoints[k]));
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
        queryLists.forEach(v => v.removeEventListener('change', onChange));
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

      queryLists.forEach(v => v.addEventListener('change', onChange));

      return cleanup;
    },
    [JSON.stringify(breakpoints)]
  );

  return mediaSet;
}
