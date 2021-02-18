# End-To-End tests with Playwright

Awesome browser testing from https://playwright.dev/

The e2e tests run from a local https server so before running for the first time you need to create the required certs

  openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

Then, to run tests

  npm run start-https
  npm run e2e

The SDK in prod environment is used by default. To run against specific SDK host (e.g. dev server)

  PTV_SDK_HOST=localhost:4000 npm run e2e
  
Read about Playwright here https://playwright.dev/docs/intro

