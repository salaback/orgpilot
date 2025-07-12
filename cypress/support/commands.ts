/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with WorkOS credentials
       * @example cy.login()
       */
      login(): Chainable<void>
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
    }
  }
}

// Custom command to login
Cypress.Commands.add('login', () => {
  // First, visit the login page to get CSRF token and session
  cy.visit('/')
  
  // Wait for page to load and get CSRF token
  cy.wait(500)
  
  // Fill in the login form
  cy.get('input[name="email"]').type('sean.alaback+test@gmail.com')
  cy.contains('Continue').click()
  
  // Wait for the password field to appear
  cy.get('input[name="password"]', { timeout: 10000 }).should('be.visible')
  cy.get('input[name="password"]').type('userpa55w0rd!')

  cy.wait(500)
  
  // Click the sign in button
  cy.get('button[name="intent"][value="password"]').click()
  
  // For local development, we need to handle the WorkOS redirect manually
  // Wait for the redirect to happen and then visit the dashboard

  
  cy.wait(500)
  cy.visit('/dashboard')

})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  // First, get a fresh CSRF token by visiting the current page
  cy.reload()
  cy.wait(1000)
    
  // Click the user menu button using the specific data attributes
  cy.get('button[data-slot="dropdown-menu-trigger"][data-sidebar="menu-button"]').click()
  
  // Wait for the dropdown menu to appear
  cy.wait(500)
  
  // Click the logout button using the specific data-slot attribute
  cy.get('button[data-slot="dropdown-menu-item"]').contains('Log out').click()
  
  // Verify we're logged out by checking for login form or redirect to login
  cy.url().should('not.include', '/dashboard')
})

export {}