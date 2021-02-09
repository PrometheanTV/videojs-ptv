import { describe, beforeAll } from '@jest/globals';
import 'core-js';
import 'expect-puppeteer';
import 'puppeteer';

const embedHost =   "dev.embed.promethean.tv:4000";
const testUrl = `http://localhost:${process.env.PORT || '8080'}?embedHost=${embedHost}`;

describe('videojs-ptv plugin', () => {
  beforeAll(async () => {
    await page.goto(testUrl);
  });

  it('should display `iframe.ptv-iframe` on page', async (done) => {
    await page.waitForSelector('iframe.ptv-iframe');
    done();
  });
})
