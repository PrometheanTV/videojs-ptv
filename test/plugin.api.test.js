import document from 'global/document';
import QUnit from 'qunit';
import videojs from 'video.js';
import sinon from 'sinon';
import { ApiHosts, EmbedHosts, SdkEvents } from '../src/constants';
import {iframeMarkup} from './mocks';

const config = {
  // Test channel and stream
  apiHost: ApiHosts.PRODUCTION,
  embedHost: iframeMarkup,
  //embedHost: EmbedHosts.COMDEV,
  channelId: '5c701be7dc3d20080e4092f4',
  streamId: '5de7e7c2a6adde5211684519',
  debug: true
};

QUnit.module('api', function(hooks) {
  let ptv;
  let spyPostMessage;

  hooks.beforeEach(function() {
    return new Promise((resolve, _) => {
      this.fixture = document.getElementById('qunit-fixture');
      this.video = document.createElement('video');
      this.fixture.appendChild(this.video);
      this.player = videojs(this.video);
      ptv = this.player.ptv(config);
      const waitForEmbedReady = () => setTimeout(() => {
        if (ptv.embed && ptv.embed.ready) {
          // This test may not be good enough due to postMessage origin.
          spyPostMessage = sinon.spy(ptv.embed.el.contentWindow, 'postMessage');
          return resolve();
        }
        waitForEmbedReady();
      }, 10);

      waitForEmbedReady();
    });
  });

  hooks.afterEach(function(assert) {
    ptv.dispose();
    if (spyPostMessage) {
      spyPostMessage.restore();
    }
  });

  const testFactory = (apiMethod, apiArgs) =>
    function(assert) {
      ptv[apiMethod](apiArgs);

      // assert.expect(apiArgs ? 4 : 3);
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
