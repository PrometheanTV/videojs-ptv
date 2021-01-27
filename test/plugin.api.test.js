import document from 'global/document';
import window from 'global/window';
import QUnit from 'qunit';
import videojs from 'video.js';
import { ApiHosts } from '../src/constants';
import { iframeMarkup, PTV_TEST_CALLBACK } from './mocks';
import PtvEmbed from '../src/embed';

// Supply mock implementations of PtvEmbed static functions.
// (easier than mocking the module!)
//
// Override `assignIframeSource` so that we can load our test iframe content.
PtvEmbed.assignIframeSource = (el) => el.setAttribute('srcdoc', iframeMarkup);
// Override `getOrigin` so that we can set the correct origin for the mock iframeMarkup.
// This should match the origin that the tests are run from
PtvEmbed.getOrigin = () => 'http://localhost:9999';

const config = {
  // Test channel and stream
  apiHost: ApiHosts.PRODUCTION,
  embedHost: iframeMarkup,
  channelId: '5c701be7dc3d20080e4092f4',
  streamId: '5de7e7c2a6adde5211684519',
  debug: true
};

/**
 * Performs an asynchronous test for the API on the videojs-ptv host iframe
 * Each public API method is called before the iframe target has loaded.
 * The tests then wait for the (mock) iframe target to echo the message that
 * it received (via its own `window.onmessage`) back to the host window for
 * test assertions.
 * Messages are echoed back to the host window via a function assigned to
 * window[PTV_TEST_CALLBACK] on the host's Window object.
 *
 * This allows the following tests to assert the expected behaviour of the
 * preload state mechanism of the PtvEmbed which tries to ensure that any
 * API methods called before the SDK has loaded are then correctly applied to
 * the SDK once it ready.
 */
QUnit.module.only('communication with target iframe', function(hooks) {

  hooks.beforeEach(function() {
    return new Promise((resolve, _) => {
      this.fixture = document.getElementById('qunit-fixture');
      this.video = document.createElement('video');
      this.fixture.appendChild(this.video);
      this.player = videojs(this.video);
      this.ptv = this.player.ptv(config);
      this.player.ready(()=>resolve());
    });
  });

  hooks.afterEach(function() {
    this.ptv.dispose();
  });

  hooks.after(function() {
    delete window[PTV_TEST_CALLBACK];
  });

  const testFactory = (apiMethod, apiArgs) =>
    function(assert) {
      const done = assert.async(1);

      window[PTV_TEST_CALLBACK] = (payload) => {
        const { method, value } = payload;

        assert.equal(apiMethod, method, `iframe received ${method}`);
        assert.equal(
          JSON.stringify(value),
          JSON.stringify(apiArgs),
          `${method} payload data is correct `
        );
        done();
      };
      this.ptv[apiMethod](apiArgs);
    };

  QUnit.test('ptv.hide() posts correct postMessage', testFactory('hide'));

  QUnit.test('ptv.load() posts correct postMessage', testFactory(
    'load',
    {
      channelId: 'test-channel'
    }
  ));

  QUnit.test('ptv.show() posts correct postMessage', testFactory('show'));

  QUnit.test('ptv.start() posts correct postMessage', testFactory('start'));

  QUnit.test('ptv.stop() posts correct postMessage', testFactory('stop'));

  QUnit.test(
    'ptv.timeUpdate() posts correct postMessage',
    testFactory('timeUpdate', 0)
  );
});
