import { SdkEvents } from '../src/constants';
export const PTV_TEST_CALLBACK = 'ptv_test_callback';

/**
 * Iframe content that allows us to verify messages sent via `postMessage`.
 * The mock target listens for messages sent by videojs-ptv and echoes them
 * back to the host window to a global function at window[PTV_TEST_CALLBACK]()
 *
 * Tests can assign a function to window[PTV_TEST_CALLBACK] and assert the
 * payload that was received by the target via the window 'message' evt.
 * @type {string}
 */
export const iframeMarkup = `<!DOCTYPE html>
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
  const msg = JSON.stringify({ type: "${SdkEvents.CONFIG_READY}", data: {} });
  window.parent.postMessage(msg, '*')
}
</script>
</body>
</html>
`;
