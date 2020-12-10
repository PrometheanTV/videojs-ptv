import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/plugin';
import { ApiHosts, EmbedHosts } from '../src/constants';

const config = {
  // Test channel and stream
  apiHost: ApiHosts.PRODUCTION,
  embedHost: EmbedHosts.COMDEV,
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

QUnit.module('videojs-ptv', {
  beforeEach() {
    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  },

  afterEach() {
    this.player.dispose();
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

  this.player.ptv();

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
    this.player.dispose();
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
