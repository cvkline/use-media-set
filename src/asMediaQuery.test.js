import { asMediaQuery as subject, MediaQueryError } from './asMediaQuery';
import kebabCase from 'lodash/kebabCase';

describe('asMediaQuery', () => {
  describe('strings', () => {
    it('just spits a string back', () => {
      const str = 'this is a string';
      const result = subject(str);
      expect(result).toBe(str);
    });

    it('throws on a number instead of a string', () => {
      expect(() => subject(10)).toThrow(MediaQueryError);
    });
  });

  describe('objects', () => {
    it('kebab-cases feature names', () => {
      const result = subject({ minWidth: '100px' });
      expect(result).toBe('(min-width: 100px)');
    });

    it('knows about min- and max- versions of rangeable features', () => {
      let result = subject({ minWidth: 500 });
      expect(result).toBe('(min-width: 500px)');
      result = subject({ maxWidth: 500 });
      expect(result).toBe('(max-width: 500px)');
    });

    it('throws when trying to use a min- or max- on a non-rangeable feature', () => {
      expect(() => subject({ minOrientation: 'landscape' })).toThrow(MediaQueryError);
      expect(() => subject({ maxScan: 'whatever'})).toThrow(MediaQueryError);
    })

    it('adds default px to length-style features', () => {
      ['width', 'height', 'deviceWidth', 'deviceHeight'].forEach(n => {
        const result = subject({ [n]: 100 });
        expect(result).toBe(`(${kebabCase(n)}: 100px)`);
      });
    });

    it('does not add px to non-length-style features', () => {
      const result = subject({ monochrome: 8 });
      expect(result).toBe('(monochrome: 8)');
    });

    it('does the right thing with "true" features', () => {
      const result = subject({ color: true });
      expect(result).toBe('(color)');
    });

    it('does media types right', () => {
      let result = subject({ type: 'screen' });
      expect(result).toBe('screen');
      result = subject({ type: 'not screen' });
      expect(result).toBe('not screen');
      result = subject({ type: 'only screen' });
      expect(result).toBe('only screen');
    });

    it('throws on a bad media type', () => {
      expect(() => subject({ type: 'unknown' })).toThrow(MediaQueryError);
    });

    it('combines a media type with a feature', () => {
      const result = subject({ type: 'screen', resolution: '72dpi' });
      expect(result).toBe('screen and (resolution: 72dpi)');
    });

    it('combines multiple features', () => {
      const result = subject({ resolution: '72dpi', aspectRatio: '16/9' });
      expect(result).toBe('(aspect-ratio: 16/9) and (resolution: 72dpi)');
    });

    it('throws on an unknown feature name', () => {
      expect(() => subject({ resolution: '72dpi', nonsense: 255 })).toThrow(MediaQueryError);
    });
  });

  describe('ranges', () => {
    it('throws when given a range for a non-rangeable feature', () => {
      expect(() => subject({ orientation: [1, 2]})).toThrow(MediaQueryError);
    });

    it('converts a string range into two features, min and max', () => {
      const result = subject({ width: '1em..2em' });
      expect(result).toBe('(min-width: 1em) and (max-width: 2em)');
    });

    it('converts an array range into two features, min and max', () => {
      const result = subject({ height: [100, 200] });
      expect(result).toBe('(min-height: 100px) and (max-height: 200px)');
    });

    it('does not mind spaces in a string range', () => {
      const result = subject({ width: '  50 ..   100   ' });
      expect(result).toBe('(min-width: 50px) and (max-width: 100px)');
    });

    it('handles open-ended ranges in strings on either end', () => {
      let result = subject({ monochrome: '4..' });
      expect(result).toBe('(min-monochrome: 4)');
      result = subject({ monochrome: ' ..16' });
      expect(result).toBe('(max-monochrome: 16)');
    });

    it('throws when given an array of the wrong size', () => {
      expect(() => subject({ width: [1, 2, 3] })).toThrow(MediaQueryError);
      expect(() => subject({ width: [5] })).toThrow(MediaQueryError);
    });
  });

  describe('arrays', () => {
    it('comma-separates an array of strings', () => {
      const str1 = 'this is 1';
      const str2 = 'this is 2';
      const result = subject([str1, str2]);
      expect(result).toBe(`${str1}, ${str2}`);
    });

    it('comma-separates two object queries', () => {
      const result = subject([
        { type: 'screen', color: true, deviceWidth: '1920..' },
        { type: 'tv' },
      ]);
      expect(result).toBe('screen and (color) and (min-device-width: 1920px), tv');
    });

    it('allows string and object forms to be mixed', () => {
      const result = subject([
        'print and (monochrome: 8)',
        { type: 'print', color: '..16' },
      ]);
      expect(result).toBe('print and (monochrome: 8), print and (max-color: 16)');
    });
  });
});
