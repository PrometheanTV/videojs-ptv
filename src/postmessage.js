import window from 'global/window';

/**
 * Parse a message received from postMessage.
 *
 * @param {*} data The data received from postMessage.
 * @return {Object} Return parsed object
 */
export function parseMessageData(data) {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  return data;
}

/**
 * Post a message to the specified target.
 *
 * @param {HTMLElement} iframe The player object to use.
 * @param {string} method The API method to call.
 * @param {Object} params The parameters to send to the player.
 * @return {void}
 */
export function postMessage(iframe, method, params) {
  if (
    !iframe ||
    !iframe.el ||
    !iframe.el.contentWindow ||
    !iframe.el.contentWindow.postMessage
  ) {
    return;
  }

  let message = { method };

  if (params !== undefined) {
    message.value = params;
  }

  // IE 8 and 9 do not support passing messages, so stringify them.
  const ieVersion = parseFloat(window.navigator.userAgent.toLowerCase().replace(/^.*msie (\d+).*$/, '$1'));

  if (ieVersion >= 8 && ieVersion < 10) {
    message = JSON.stringify(message);
  }

  iframe.el.contentWindow.postMessage(message, iframe.origin);
}
