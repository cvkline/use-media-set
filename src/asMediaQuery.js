import kebabCase from 'lodash/kebabCase';
import flatMap from 'lodash/flatMap';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';

// Lodash's _.capitalize() won't do here, because it not only
// capitalizes the string but lowercases the rest of it, which
// we do not want here. This will work well enough.
const capitalize = s => s[0].toUpperCase() + s.slice(1);

const mediaTypes = Object.freeze([
  'all',
  'screen',
  'print',
  'aural',
  'braille',
  'handheld',
  'projection',
  'tty',
  'tv',
]);

const unrangeableFeatures = Object.freeze(['orientation', 'scan', 'grid']);

const rangeableFeatures = Object.freeze([
  'aspectRatio',
  'color',
  'colorIndex',
  'deviceAspectRatio',
  'deviceHeight',
  'deviceWidth',
  'height',
  'monochrome',
  'resolution',
  'width',
]);

// features where units are length, so we want to append a default
// unit of "px" if only numbers are provided
const hasLengthUnits = ['width', 'height', 'deviceWidth', 'deviceHeight'];
hasLengthUnits.forEach(function (v) {
  const cv = capitalize(v);
  hasLengthUnits.push('min' + cv);
  hasLengthUnits.push('max' + cv);
});
Object.freeze(hasLengthUnits);

// handy pattern matches
const matchType = new RegExp('^(not|only)\\s+(\\w+)$');
const matchRange = new RegExp('^\\s*(\\w*?)\\s*\\.\\.\\s*(\\w*?)\\s*$');
const matchNumber = new RegExp('^\\d+$');

// all the min- and max- versions of the rangeable features
const rangeFeatures = Object.freeze(
  flatMap(rangeableFeatures, feat =>
    ['min', 'max'].map(r => r + capitalize(feat))
  )
);

export class MediaQueryError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'MediaQueryError';
  }
}

// if given a range, either an array or string, return a two-element
// array of the min and max values of the range. if not a range, return null.
function getRange(x) {
  if (isArray(x) && x.length === 2) return x;
  if (isString(x)) {
    const m = x.match(matchRange);
    if (m) return [m[1], m[2]];
  }
  return null;
}

function feature(k, v) {
  const cssKey = kebabCase(k);

  if (v === true) return '(' + cssKey + ')';

  if (isString(v)) {
    const px = hasLengthUnits.includes(k) && v.match(matchNumber) ? 'px' : '';
    return `(${cssKey}: ${v}${px})`;
  }

  if (isNumber(v)) {
    const px = hasLengthUnits.includes(k) ? 'px' : '';
    return `(${cssKey}: ${v}${px})`;
  }

  throw new MediaQueryError(`feature ${k} invalid value ${v}`);
}

function convertObj(obj) {
  if (isString(obj)) return obj;
  if (!isPlainObject(obj))
    throw new MediaQueryError('argument is not an object or string');

  const keys = new Set(Object.keys(obj));
  let query = [];

  // First see if any media type is present
  if (keys.has('type')) {
    let mediaType;
    const modifierMatch = obj.type.match(matchType);
    keys.delete('type');
    if (modifierMatch) {
      mediaType = modifierMatch[2];
    } else {
      mediaType = obj.type;
    }
    if (mediaTypes.includes(mediaType)) {
      query.push(obj.type);
    } else {
      throw new MediaQueryError(`Invalid media type: ${mediaType}`);
    }
  }

  // Now do the things that can have only one value
  [...unrangeableFeatures, ...rangeFeatures].forEach(feat => {
    if (!keys.has(feat)) return;

    keys.delete(feat);
    query.push(feature(feat, obj[feat]));
  });

  // Now do things that can have either one value or a range
  rangeableFeatures.forEach(feat => {
    if (!keys.has(feat)) return;

    keys.delete(feat);

    const rng = getRange(obj[feat]);
    if (rng) {
      if (rng[0]) query.push(feature('min' + capitalize(feat), rng[0]));
      if (rng[1]) query.push(feature('max' + capitalize(feat), rng[1]));
      return;
    }

    query.push(feature(feat, obj[feat]));
  });

  if (keys.size > 0) {
    const unused = Array.from(keys).join(', ');
    throw new MediaQueryError(`Unrecognized media query keys: ${unused}`);
  }

  return query.join(' and ');
}

export function asMediaQuery(query) {
  const queries = isArray(query) ? query : [query];
  return queries.map(q => convertObj(q)).join(', ');
}
