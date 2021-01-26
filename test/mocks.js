import { SdkEvents } from '../src/constants';

/**
 * Iframe content for mocking SDK behaviour.
 * @type {string}
 */
export const iframeMarkup = `<!DOCTYPE html>
<html>
<head>
<script>
console.log('setting up iframe test target');
window.addEventListener('message', msg => console.log('iframe test target received', msg));
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
