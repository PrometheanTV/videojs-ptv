import document from 'global/document';
import window from 'global/window';
import QUnit from 'qunit';
import videojs from 'video.js';
import { ApiHosts, SdkEvents } from '../src/constants';
import { iframeMarkup, makeIframeSource, PTV_TEST_CALLBACK } from './mocks';
import PtvEmbed from '../src/embed';

const config = {
  // Test channel and stream
  apiHost: ApiHosts.PRODUCTION,
  embedHost: iframeMarkup,
  channelId: '5c701be7dc3d20080e4092f4',
  streamId: '5de7e7c2a6adde5211684519',
  debug: true
};

function setup() {
  // Store initial implementations of functions so that that they can be
  // re-assigned once these tests are complete
  this.assignIframeSource_ = PtvEmbed.assignIframeSource;
  this.getOrigin_ = PtvEmbed.getOrigin;
  // Override `assignIframeSource` so that we can load our test iframe content.
  PtvEmbed.assignIframeSource = (el) => el.setAttribute('srcdoc', iframeMarkup);
  // Override `getOrigin` so that we can set the correct origin for iframe test target,
  // this should match the origin of the test runner
  PtvEmbed.getOrigin = () => 'http://localhost:9999';
}

function teardown() {
  delete window[PTV_TEST_CALLBACK];
  PtvEmbed.assignIframeSource = this.assignIframeSource_;
  PtvEmbed.getOrigin = this.getOrigin_;
}

function makePluginSetup(configOverride = {}) {
  return function() {
    const config_ = Object.assign({}, config, configOverride)
    return new Promise((resolve, _) => {
      this.fixture = document.getElementById('qunit-fixture');
      this.video = document.createElement('video');
      this.fixture.appendChild(this.video);
      this.player = videojs(this.video);
      this.ptv = this.player.ptv(config_);
      this.player.ready(() => resolve());
    });
  }
}

function pluginTeardown() {
    this.ptv.dispose();
}

const testFactory = (apiMethod, apiArgs) =>
  function(assert) {
    const done = assert.async(1);
    // setup listener for the payloads that the iframe mock content will
    // "echo" back to the parent window (i.e. the test runner)
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
    // call the plugin API method that should reach the iframe content and
    // then be "echoed" back
    this.ptv[apiMethod](apiArgs);
  };

/**
 * Performs an asynchronous test for the API on the videojs-ptv iframe that
 * hosts the SDK
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
QUnit.module('communication with target iframe', function(hooks) {

  hooks.before(setup);
  hooks.beforeEach(makePluginSetup());
  hooks.afterEach(pluginTeardown);
  hooks.after(teardown);

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

QUnit.module('communication with iframe target after config load failure', function(hooks) {
  hooks.before(setup);
  hooks.after(teardown);

  hooks.beforeEach(makePluginSetup({
    embedHost: makeIframeSource(SdkEvents.CONFIG_FAILURE)
  }));

  hooks.afterEach(pluginTeardown);

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
