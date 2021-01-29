module.exports = {
  server: {
    command: `npm run start-server`,
    port: 8080,
    launchTimeout: 10000
  },
  launch: {
    headless: true, // set to `false` to launch browser
    slowMo: 50
  }
};
