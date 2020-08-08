import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import MockDate from 'mockdate';
import { useMediaSet } from './';

// advances both global time and the jest timers
// (lodash debounce uses both timers and the actual
// clock value for some reason 🤷🏼‍♂️)
function advance(ms) {
  act(() => {
    const now = Date.now();
    MockDate.set(now + ms);
    jest.advanceTimersByTime(ms);
  });
}

describe('useMediaSet', () => {
  describe('when mediaMatch is not available', () => {
    it('just returns a constant empty set if no SSR defaults are given', () => {
      const { result } = renderHook(() => useMediaSet());
      expect(result.current instanceof Set).toBe(true);
      expect(result.current.size).toBe(0);
    });

    it('returns the SSR defaults if specified', () => {
      const defaults = new Set(['tv']);
      const { result } = renderHook(() =>
        useMediaSet({ type: 'tv' }, defaults)
      );
      expect(result.current instanceof Set).toBe(true);
      expect(result.current.size).toBe(1);
      expect(result.current.has('tv')).toBe(true);
    });

    it('throws an error if the specified SSR default is not a Set', () => {
      const { result } = renderHook(() =>
        useMediaSet({ type: 'tv' }, ['1', '2', '3'])
      );
      expect(result.error?.message).toMatch(/ssrset .* must be of type set/i);
    });
  });

  describe('when mediaMatch is available', () => {
    const mediaMatches = new Map();
    const listeners = new Map();
    const initialTrueMatches = new Set();
    const savedUseState = React.useState;
    let setStateCalls;

    // Change the match value of the given media query, and
    // trigger the corresponding event listener
    function change(query, newValue) {
      mediaMatches.get(query).matches = newValue;
      listeners.get(query)();
    }

    beforeAll(() => {
      jest.useFakeTimers();

      // JS-DOM doesn't know anything about matchMedia so we'll
      // cobble up an implementation of it that's good enough
      // to run these tests.
      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn().mockImplementation(function (query) {
          const mm = {
            matches: initialTrueMatches.has(query),
            media: query,
            onchange: null,
            addListener: function (handler) {
              listeners.set(query, handler);
            },
            addEventListener: function (_ev, handler) {
              listeners.set(query, handler);
            },
            removeEventListener: jest.fn(),
            removeListener: jest.fn(),
            dispatchEvent: Function.prototype,
          };
          mediaMatches.set(query, mm);
          return mm;
        }),
        writable: true,
      });
    });

    beforeEach(() => {
      // need to spy on how often a React state is getting set
      setStateCalls = 0;
      React.useState = function (init) {
        const [val, setVal] = savedUseState(init);
        const mockedSetVal = function (newVal) {
          setStateCalls += 1;
          setVal(newVal);
        };
        return [val, mockedSetVal];
      };
    });

    afterEach(() => {
      listeners.clear();
      mediaMatches.clear();
      initialTrueMatches.clear();
      React.useState = savedUseState;
    });

    it('returns the correct initial state with the default queries', () => {
      // "small" and "large" according to the default breakpoints
      initialTrueMatches.add('(max-width: 592px)');
      initialTrueMatches.add('(min-width: 897px)');
      const { result } = renderHook(() => useMediaSet());
      expect(result.current.size).toBe(2);
      expect(result.current.has('small')).toBe(true);
      expect(result.current.has('medium')).toBe(false);
      expect(result.current.has('large')).toBe(true);
    });

    it('registers a listener for each media match', () => {
      renderHook(() => useMediaSet());
      expect(listeners.size).toBe(3);
    });

    it('uses the passed-in breakpoints when provided', () => {
      const bps = { one: '1', two: '2' };
      initialTrueMatches.add('2');
      const { result } = renderHook(() => useMediaSet(bps));
      expect(result.current.has('one')).toBe(false);
      expect(result.current.has('two')).toBe(true);
    });

    it('responds to a change in a media match by updating', () => {
      const bps = { one: '1', two: '2', three: '3' };
      initialTrueMatches.add('2');
      const { result, rerender } = renderHook(() => useMediaSet(bps));
      expect(result.current.size).toBe(1);
      change('3', true);
      advance(51);
      rerender();
      expect(result.current.size).toBe(2);
      expect(result.current.has('two')).toBe(true);
      expect(result.current.has('three')).toBe(true);
    });

    it('responds to two near-simultaneous changes only once', () => {
      const bps = { one: '1', two: '2', three: '3' };
      initialTrueMatches.add('1');
      const { result, rerender } = renderHook(() => useMediaSet(bps));
      expect(result.current.size).toBe(1);
      change('3', true);
      change('1', false);
      advance(51);
      rerender();
      expect(result.current.size).toBe(1);
      expect(result.current.has('three')).toBe(true);
      expect(setStateCalls).toBe(1);
    });

    it('unregisters all the listeners on unmount', () => {
      const { unmount } = renderHook(() => useMediaSet());
      unmount();
      for (const m of mediaMatches.values()) {
        expect(m.removeListener).toHaveBeenCalledTimes(1);
      }
    });
  });
});
