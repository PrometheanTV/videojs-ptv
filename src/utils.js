/**
 * Converts object to query string.
 *
 * @param {Object} obj Object to serialize
 * @return {string} Query string
 */
export const serialize = (obj) =>
  Object.keys(obj)
    .filter((k) => obj[k] !== null)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join('&');
