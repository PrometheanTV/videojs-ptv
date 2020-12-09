import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/plugin';

const config = {
  // Test channel and stream
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

  assert.expect(6);

  this.player.ptv(config);

  setTimeout(() => {
    const iframe = this.fixture.querySelector('iframe.ptv-iframe');

    assert.ok(iframe, 'ptv-iframe created');

    const domainRE = new RegExp('^https://embed.promethean.tv/??');

    assert.ok(
      domainRE.test(iframe.src),
      'loads from https://embed.promethean.tv'
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
