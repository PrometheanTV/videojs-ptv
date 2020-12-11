import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/plugin';
import { ApiHosts, EmbedHosts, PlayerEvents } from '../src/constants';

const config = {
  // Test channel and stream
  apiHost: ApiHosts.PRODUCTION,
  embedHost: EmbedHosts.COMDEV,
  channelId: '5c701be7dc3d20080e4092f4',
  streamId: '5de7e7c2a6adde5211684519',
  debug: true
};

const configFailure = {
  apiHost: config.apiHost,
  embedHost: config.embedHost,
  channelId: 'non-existent',
  streamId: 'non-existent',
  debug: config.debug
};

const reParam = (key, value) => new RegExp(`\\?.*&${key}=${value}(&|$)`);

const Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-ptv', {
  beforeEach() {
    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  },

  afterEach() {
    this.player.ptv().dispose();
  }
});

QUnit.test('registers itself with video.js', function(assert) {
  const done = assert.async();

  assert.expect(2);

  assert.strictEqual(
    typeof Player.prototype.ptv,
    'function',
    'videojs-ptv plugin was registered'
  );

  this.player.ptv(config);

  setTimeout(() => {
    assert.ok(
      this.player.hasClass('vjs-ptv'),
      'the plugin adds a class to the player'
    );
    done();
  });
});

QUnit.test('creates the embed', function(assert) {
  const done = assert.async();

  assert.expect(8);

  const ptv = this.player.ptv(config);

  setTimeout(() => {
    const iframe = this.fixture.querySelector('iframe.ptv-iframe');

    assert.strictEqual(iframe, ptv.embed.el_, "creates plugin's embed");

    assert.ok(iframe, 'adds embed to DOM');

    assert.ok(
      iframe.src.startsWith(`https://${config.embedHost}/?`),
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

    done();
  });
});

QUnit.module('api', function(hooks) {
  let ptv;
  let spyPostMessage;

  hooks.beforeEach(assert => {
    const done = assert.async();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
    ptv = this.player.ptv(config);

    setTimeout(() => {
      spyPostMessage = sinon.spy(ptv.embed.el.contentWindow, 'postMessage');
      done();
    });
  });

  hooks.afterEach(assert => {
    ptv.dispose();
    spyPostMessage.restore();
  });

  const testFactory = (apiMethod, apiArgs) =>
    function(assert) {
      ptv[apiMethod](apiArgs);

      assert.expect(apiArgs ? 4 : 3);
      const [{ method, source, value }, origin] = spyPostMessage.lastCall.args;

      assert.equal(origin, ptv.embed.origin, `origin is ${ptv.embed.origin}`);
      assert.equal(method, apiMethod, `method is ${apiMethod}`);
      assert.equal(source, '@ptv-host', 'source is @ptv-host');
      if (apiArgs) {
        assert.equal(value, apiArgs, 'args is payload');
      }
    };

  QUnit.test('ptv.hide() posts correct postMessage', testFactory('hide'));

  QUnit.test('ptv.load() posts correct postMessage', testFactory('load'));

  QUnit.test('ptv.show() posts correct postMessage', testFactory('show'));

  QUnit.test('ptv.start() posts correct postMessage', testFactory('start'));

  QUnit.test('ptv.stop() posts correct postMessage', testFactory('stop'));

  QUnit.test(
    'ptv.timeUpdate() posts correct postMessage',
    testFactory('timeUpdate', 'payload')
  );
});

QUnit.module('player events', function(hooks) {
  let ptv;

  hooks.beforeEach(function(assert) {
    const done = assert.async();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
    ptv = this.player.ptv(config);

    setTimeout(() => {
      done();
    });
  });

  hooks.afterEach(function(assert) {
    ptv.dispose();
  });

  const testFactory = (event, apiMethod) =>
    function(assert) {
      const spy = sinon.spy(ptv, apiMethod);

      this.player.trigger(event);
      assert.ok(spy.calledOnce, 'api called');
      this.player.trigger(event);
      assert.ok(spy.calledTwice, 'api called twice');
    };

  QUnit.test('play starts plugin only once', function(assert) {
    const spy = sinon.spy(ptv, 'start');

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
  let ptv;

  hooks.beforeEach(function(assert) {
    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  });

  hooks.afterEach(function(assert) {
    ptv.dispose();
  });

  QUnit.test('config ready', function(assert) {
    const done = assert.async();

    ptv = this.player.ptv(config);

    setTimeout(() => {
      assert.equal(ptv.state.configReady, true, 'configReady = true');
      assert.equal(ptv.state.configFailure, false, 'configFailure = false');
      done();
    }, 500);
  });

  QUnit.test('config failure', function(assert) {
    const done = assert.async();

    ptv = this.player.ptv(configFailure);

    setTimeout(() => {
      assert.equal(ptv.state.configReady, false, 'configReady = false');
      assert.equal(ptv.state.configFailure, true, 'configFailure = true');
      done();
    }, 500);
  });
});
