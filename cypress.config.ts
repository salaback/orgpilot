import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    // Handle cookies and sessions
    chromeWebSecurity: false,
    // Handle uncaught exceptions
    experimentalModifyObstructiveThirdPartyCode: true,
    // Additional configuration for Laravel
    setupNodeEvents(on, config) {
      // Handle any additional setup if needed
      return config
    },
  },
})
