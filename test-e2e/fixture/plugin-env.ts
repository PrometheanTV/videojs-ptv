import { folio as baseFolio } from "@playwright/test";
import { BrowserContextOptions } from 'playwright';

/**
 * Here we configure the browsers in which Playwright will run our e2e tests
 */

// the `builder` provides the API to configure the test environment
const builder = baseFolio.extend<{mockedContext}>();

// set some basic browser options, in particular we can set `ignoreHTTPSErrors`
// in order to support redirecting URLS to local dev servers (see below)
builder.contextOptions.override(async ({ contextOptions }, runTest) => {
  const modifiedOptions: BrowserContextOptions = {
    ...contextOptions, // default options
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  }
  await runTest(modifiedOptions);
});

// Here we setup some custom URL routes in the browsers.
// This allows us to tell the browser how to handle certain web requests
// This is useful for loading mock configs and using local builds running
// on local dev servers without having to modify source or create configuration
// backdoors
builder.mockedContext.init(async ({ context }, runTest) => {
  // Add a route that will redirect requests for the SDK
  if (process.env['PTV_SDK_HOST']) {
    await context.route(/embed.promethean.tv/, (route, request) => {
      const originalUrl = request.url();
      const redirectedUrl = originalUrl.replace('comdev.embed.promethean.tv', process.env.PTV_SDK_HOST);
      console.log('redirecting', originalUrl, redirectedUrl);
      route.continue({ url: redirectedUrl });
    });
  }


  // Add route that will supply a mock config
  await context.route(/broadcast.promethean.tv/, (route, request) => {
    console.log('resolving', request.url());
    // NOTE: Even though the request is going to be fulfilled with
    // local mock content (loaded from `path`), it is still necessary
    // to supply the expected CORS headers in the mock response.
    // While this might seem like a nuisance, it actually allows
    // potential CORS errors to be tested.
    return route.fulfill({
      contentType: "application/json",
      headers: {
        "access-control-allow-origin": "https://embed.promethean.tv",
        "access-control-allow-credentials": "true"
      },
      status: 200,
      path: 'test-e2e/fixture/data/example02.json'
    })
  });
  // Pass fixture to test functions
  await runTest(context);
});

const folio = builder.build();

export const it = folio.it;
export const expect = folio.expect;
export const describe = folio.describe;
