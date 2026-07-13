// A minimal trailing-edge debounce: `fn` is invoked once, `delay` ms after
// the most recent call. The returned function exposes a `.cancel()` that
// drops any pending invocation (used on effect cleanup).
export default function debounce(fn, delay) {
  let timer;

  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, delay);
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };

  return debounced;
}
