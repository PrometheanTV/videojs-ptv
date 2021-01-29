import { describe, beforeAll } from '@jest/globals';
import 'core-js';
import 'expect-puppeteer';
import 'puppeteer';

const GLOBALS = {
  mediaFile: 'video-960x540-5s.webm'
};

/*describe('Video player', () => {
  let pubPort;
  let adPort;
  let pubserver;
  let adserver;

  beforeAll(async () => {
  });

  afterAll(() => {
  });

  beforeEach(async () => {
    GLOBALS.mediaFile = "video-960x540-5s.webm";
    await page.goto(`http://localhost:${pubPort}/index.html`);
  });

  it('should play preroll', async () => {
    await waitForVideo();

    await clickVideo();

    await page.waitForFunction('window.test.playedSources.length > 1');

    const result = await page.evaluate(() => window.test.playedSources);

    expect(result.length).toEqual(2);
    expect(result[0]).toMatch("video-960x540-5s");
    expect(result[1]).toMatch("big_buck_bunny_720p_surround");
  });

  it('should play content video when media file does not exist', async () => {
    GLOBALS.mediaFile = "no-such-file-exists";

    await waitForVideo();

    await clickVideo();

    await page.waitFor(() => window.test.playedSources.length > 0, {timeout: 3000});

    const result = await page.evaluate(() => window.test.playedSources);

    expect(result.length).toEqual(1);
    expect(result[0]).toMatch("big_buck_bunny_720p_surround");
  });

  async function waitForVideo() {
    await page.waitForSelector('video');
    await page.waitForSelector('div.vjs-poster');
  }

  async function clickVideo() {
    await page.click('video');
  }
});*/

//const testUrl = 'http://localhost:8080/index.html';
const testUrl = `http://localhost:${process.env.PORT || '8080'}`;

describe('videojs-ptv plugin', () => {
  beforeAll(async () => {
    await page.goto(testUrl);
  });

  it('should display contain videojs-ptv on page', async () => {
    await expect(page).toMatch('videojs-ptv')
  })
})
