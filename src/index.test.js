import { useMediaSet } from './';
import { renderHook } from '@testing-library/react-hooks';

describe('useMediaSet', () => {
  let mockedMatches = {};

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn().mockImplementation(query => ({
        matches: mockedMatches.hasOwnProperty(query),
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
      writable: true,
    });
  });

  it('gets the initial state right', () => {
    // "small" according to the default breakpoints
    mockedMatches['(max-width: 592px)'] = true;
    const { result } = renderHook(() => useMediaSet());
    expect(result.current.size).toBe(1);
    expect(result.current.has('small')).toBeTruthy();
  });
});
