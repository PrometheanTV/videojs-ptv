import document from 'global/document';
import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';
import plugin from '../src/plugin';
import { ApiHosts, EmbedHosts, PlayerEvents, SdkEvents } from '../src/constants';

/**
 * A mock iframe data url to pass to plugin so that we isolate tests to this library
 * and ensure that tests don't fail due to environmental issues
 * @type {string}
 */
const mockIframeContent = encodeURI(`<html></html>`);
/**
 * The mock local origin that the mock iframe content will load from.
 * It is basically the URL of the test runner.
 * @type {string}
 */
const mockOrigin = 'http://localhost:9999';

const config = {
  // Test channel and stream
  apiHost: ApiHosts.PRODUCTION,
  embedHost: `data:text/html;charset=utf-8,${mockIframeContent}`,
  channelId: '5c701be7dc3d20080e4092f4',
  streamId: '5de7e7c2a6adde5211684519',
  debug: true
};

const reParam = (key, value) => new RegExp(`\\?.*&${key}=${value}(&|$)`);

const Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

const setupPlugin = function() {
  const self = this;
  return new Promise((resolve, _) => {
    self.fixture = document.getElementById('qunit-fixture');
    self.video = document.createElement('video');
    self.fixture.appendChild(self.video);
    self.player = videojs(self.video);
    self.ptv = self.player.ptv(config);
    self.player.ready(() => {
      return resolve()
    });
  });
};

const teardownPlugin = function() {
  return new Promise((resolve, _) => {
    this.player.ptv().dispose();
    setTimeout(() => resolve(), 1);
  })
}

QUnit.module('videojs-ptv', function(hooks) {
  hooks.beforeEach(setupPlugin);
  hooks.afterEach(teardownPlugin);

  QUnit.test('registers itself with video.js', function(assert) {
    //console.log('this', this);
    assert.strictEqual(
      typeof Player.prototype.ptv,
      'function',
      'videojs-ptv plugin was registered'
    );
    assert.ok(
      this.player.hasClass('vjs-ptv'),
      'the plugin adds a class to the player'
    );
  });

  QUnit.test('creates the embed', function(assert) {
    const iframe = this.fixture.querySelector('iframe.ptv-iframe');
    assert.strictEqual(iframe, this.ptv.embed.el_, 'creates plugin\'s embed');

    assert.ok(iframe, 'adds embed to DOM');
    assert.ok(
      iframe.src.startsWith(`https://${config.embedHost}`),
      `loads from config.embedHost = ${config.embedHost}`
    );

    assert.ok(
      reParam('apiHost', config.apiHost),
      `uses config.apiHost = ${config.apiHost}`
    );

    assert.ok(
      reParam('channelId', config.channelId).test(iframe.src),
      `uses config.channelId = ${config.channelId}`
    );

    assert.ok(
      reParam('streamId', config.streamId).test(iframe.src),
      `uses config.streamId = ${config.streamId}`
    );

    assert.ok(
      reParam('excludePlayer', true).test(iframe.src),
      'uses excludePlayer = true'
    );

    assert.ok(reParam('iframe', true).test(iframe.src), 'uses iframe = true');

  });
});



QUnit.module('api', function(hooks) {
  hooks.beforeEach(setupPlugin);
  hooks.afterEach(teardownPlugin);

  QUnit.test(
    'ptv.hide() posts correct postMessage',
    function(assert) {
      this.ptv.hide();
      assert.equal(this.ptv.embed.preloadState.visible, false);
    }
  );

  QUnit.test(
    'ptv.load() posts correct postMessage',
    function(assert) {
      this.ptv.load('url');
      assert.equal(this.ptv.embed.preloadState.config, 'url');
    }
  );

  QUnit.test(
    'ptv.show() posts correct postMessage',
    function(assert) {
      this.ptv.show();
      assert.equal(this.ptv.embed.preloadState.visible, true);
    }
  );

  QUnit.test(
    'ptv.start() posts correct postMessage',
    function(assert) {
      this.ptv.start();
      assert.equal(this.ptv.embed.preloadState.started, true);
    }
  );

  QUnit.test(
    'ptv.stop() posts correct postMessage',
    function(assert) {
      this.ptv.stop();
      assert.equal(this.ptv.embed.preloadState.started, false);
    }
  );

  QUnit.test(
    'ptv.timeUpdate() posts correct postMessage',
    function (assert) {
      this.ptv.timeUpdate(5);
      assert.equal(this.ptv.embed.preloadState.time, 5);
    }
  );
});

QUnit.module('player events', function(hooks) {
  hooks.beforeEach(setupPlugin);
  hooks.afterEach(teardownPlugin);

  const testFactory = (event, apiMethod) =>
    function(assert) {
      const spy = sinon.spy(this.ptv, apiMethod);
      this.player.trigger(event);
      assert.ok(spy.calledOnce, 'api called');
      this.player.trigger(event);
      assert.ok(spy.calledTwice, 'api called twice');
    };

  QUnit.test('play starts plugin only once', function(assert) {
    const spy = sinon.spy(this.ptv, 'start');

    this.player.trigger(PlayerEvents.PLAY);
    assert.ok(spy.calledOnce, 'api called');
    this.player.trigger(PlayerEvents.PLAY);
    assert.ok(spy.calledOnce, 'api called only once');
  });

  QUnit.test('play shows plugin', testFactory(PlayerEvents.PLAY, 'show'));

  QUnit.test('ended stops plugin', testFactory(PlayerEvents.ENDED, 'stop'));

  QUnit.test('error stops plugin', testFactory(PlayerEvents.ERROR, 'stop'));

  QUnit.test('pause hides plugin', testFactory(PlayerEvents.PAUSE, 'hide'));

  QUnit.test(
    'time update notifies plugin',
    testFactory(PlayerEvents.TIME_UPDATE, 'timeUpdate')
  );
});

QUnit.module('plugin state', function(hooks) {
  // The message that we would expect to receive from iframe SDK when it has
  // loaded the config
  let mockConfigReadyMessage = {
    data: JSON.stringify({
      type: SdkEvents.CONFIG_READY,
      data: {
        poster: { loading: '' },
        src: '',
        type: ''
      }
    }),
    origin: mockOrigin
  };
  // The message that we would expect to receive from iframe SDK when it has
  // failed to the load the config
  let mockConfigFailMessage = {
    data: JSON.stringify({
      type: SdkEvents.CONFIG_FAILURE
    }),
    origin: mockOrigin
  };

  hooks.beforeEach(setupPlugin);
  hooks.afterEach(teardownPlugin);

  QUnit.test('config ready', function(assert) {
    this.ptv.embed.handleMessage_(mockConfigReadyMessage);
    assert.equal(this.ptv.state.configReady, true, 'configReady = true');
    assert.equal(this.ptv.state.configFailure, false, 'configFailure = false');
  });

  QUnit.test('config failure', function(assert) {
    this.ptv.embed.handleMessage_(mockConfigFailMessage);
    assert.equal(this.ptv.state.configReady, false, 'configReady = false');
    assert.equal(this.ptv.state.configFailure, true, 'configFailure = true');
  });
});
