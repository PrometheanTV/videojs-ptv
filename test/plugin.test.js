import document from 'global/document';
import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';
import plugin from '../src/plugin';
import { ApiHosts, PlayerEvents, SdkEvents } from '../src/constants';
import { iframeMarkup } from './mocks';

const config = {
  // Test channel and stream
  apiHost: ApiHosts.PRODUCTION,
  embedHost: iframeMarkup,
  channelId: '5c701be7dc3d20080e4092f4',
  streamId: '5de7e7c2a6adde5211684519',
  debug: true
};

const configWithDataUrl = Object.assign(
  {},
  config,
  { embedHost: 'data:text/html;charset=utf-8,' + encodeURIComponent(iframeMarkup) }
);

const reParam = (key, value) => new RegExp(`\\?.*&${key}=${value}(&|$)`);

const Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

const setupPlugin = function() {
  return new Promise((resolve, _) => {
    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
    this.ptv = this.player.ptv(configWithDataUrl);
    this.player.ready(() => {
      return resolve();
    });
  });
};

const teardownPlugin = function() {
  return new Promise((resolve, _) => {
    this.ptv.dispose();
    setTimeout(() => resolve(), 1);
  });
};

QUnit.module('videojs-ptv', function(hooks) {
  hooks.beforeEach(setupPlugin);
  hooks.afterEach(teardownPlugin);

  QUnit.test('registers itself with video.js', function(assert) {
    // console.log('this', this);
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
  });

  QUnit.test('applies configuration to iframe URL params', function(assert) {
    const iframe = this.fixture.querySelector('iframe.ptv-iframe');

    assert.ok(
      iframe.src.startsWith(`https://${configWithDataUrl.embedHost}`),
      `loads from config.embedHost = ${configWithDataUrl.embedHost}`
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

QUnit.module('preload state', function(hooks) {
  hooks.beforeEach(setupPlugin);
  hooks.afterEach(teardownPlugin);

  QUnit.test(
    'ptv.hide()',
    function(assert) {
      this.ptv.hide();
      assert.equal(this.ptv.embed.preloadState_.visible, false);
    }
  );

  QUnit.test(
    'ptv.load() call is added to state if SDK is not ready',
    function(assert) {
      this.ptv.load('url');
      assert.equal(this.ptv.embed.preloadState_.config, 'url');
    }
  );

  QUnit.test(
    'ptv.show() call is added to state if SDK is not ready',
    function(assert) {
      this.ptv.show();
      assert.equal(this.ptv.embed.preloadState_.visible, true);
    }
  );

  QUnit.test(
    'ptv.start() call is added to state if SDK is not ready',
    function(assert) {
      this.ptv.start();
      assert.equal(this.ptv.embed.preloadState_.started, true);
    }
  );

  QUnit.test(
    'ptv.stop() call is added to state if SDK is not ready',
    function(assert) {
      this.ptv.stop();
      assert.equal(this.ptv.embed.preloadState_.started, false);
    }
  );

  QUnit.test(
    'ptv.timeUpdate() call is added to state if SDK is not ready',
    function(assert) {
      this.ptv.timeUpdate(5);
      assert.equal(this.ptv.embed.preloadState_.time, 5);
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
  const origin = 'https://' + configWithDataUrl.embedHost;
  // The message that we would expect to receive from iframe SDK when it has
  // loaded the config
  const mockConfigReadyMessage = {
    data: JSON.stringify({
      type: SdkEvents.CONFIG_READY,
      data: {
        poster: { loading: '' },
        src: '',
        type: ''
      }
    }),
    origin
  };
  // The message that we would expect to receive from iframe SDK when it has
  // failed to the load the config
  const mockConfigFailMessage = {
    data: JSON.stringify({
      type: SdkEvents.CONFIG_FAILURE
    }),
    origin
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
