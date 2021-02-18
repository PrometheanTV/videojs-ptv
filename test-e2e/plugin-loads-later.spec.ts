import { expect, describe, it } from './fixture/plugin-env';

const testUrl = `https://localhost:8080/examples/lazy-load-plugin.html`;

/**
 * This is a helper that generates a Promise that is executed in the scope of
 * the HTML page under test.
 * It listens for messages and resolves / rejects when the sdk config
 * loads / fails
 */
const evaluateConfigLoadOutcome = () =>
  new Promise<string>((resolve, reject) => {
    // add callback for the videojs plugin ready event
    (window as any).player.ready(() => {
      const messageHandler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.type === 'ptv.config.ready') {
          window.removeEventListener('message', messageHandler);
          resolve(evt.data);
        }
        if (data.type === 'ptv.config.failure') {
          window.removeEventListener('message', messageHandler);
          reject(evt.data);
        }
      };
      window.addEventListener('message', messageHandler);
    });
  });

describe('videojs-ptv plugin', () => {
  it('should load SDK and receive config', async ({ mockedContext }) => {
    const page = await mockedContext.newPage();
    await page.goto(testUrl);
    await page.waitForSelector('iframe.ptv-iframe');
    const configData = await page.evaluate(evaluateConfigLoadOutcome);
    expect(configData).toBeDefined();
  });
});
