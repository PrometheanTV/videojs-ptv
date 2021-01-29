import { SdkEvents } from '../src/constants';
export const PTV_TEST_CALLBACK = 'ptv_test_callback';

/*
 *
 * @type {function(string):any}
 */
export const makeIframeSource = initialEvent => `<!DOCTYPE html>
<html>
<head>
<script>
console.log('setting up iframe test target');
window.addEventListener('message', evt => {
  console.log('iframe test target received', evt);
  // evt.source provides a reference to the host page's Window
  if (typeof evt.source['${PTV_TEST_CALLBACK}'] === 'function') {
    console.log('sending to ptv_test_callback');
    evt.source['${PTV_TEST_CALLBACK}'](evt.data);
  }
});
</script>
</head>
<body>
<script>
if (window.parent) {
  console.log('iframe test target sending CONFIG_READY');
  const msg = JSON.stringify({ type: "${initialEvent}", data: {} });
  window.parent.postMessage(msg, '*')
}
</script>
</body>
</html>
`;

/*
 * This markup is injected directly into the Iframe via `srcdoc` and allows us
 * to verify messages sent via `postMessage`.
 *
 * The target (html page below) listens for messages sent by the videojs-ptv
 * plugin and echoes any received messages back to the host window via a
 * function defined at `window[PTV_TEST_CALLBACK]`
 *
 * Tests can dynamically assign functions to window[PTV_TEST_CALLBACK] allowing
 * assertions to be made about payloads received by the target window.
 * @type {*}
 */
export const iframeMarkup = makeIframeSource(SdkEvents.CONFIG_READY);

