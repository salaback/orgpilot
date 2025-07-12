/// <reference types="cypress" />

describe('Authentication', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/login')
  })

  it('should login with valid credentials and then logout', () => {
    // Use custom login command
    cy.login()

    cy.visit('/')
    
    // Verify we're logged in by checking for dashboard content
    cy.contains('Dashboard').should('be.visible')
    
    // Use custom logout command
    cy.logout()
    
    // Verify we're logged out by checking login form is visible
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
  })

//   it('should show error with invalid credentials', () => {
//     // Test with invalid credentials
//     cy.get('input[name="email"]').type('invalid@example.com')
//     cy.get('input[name="password"]').type('wrongpassword')
    
//     // Submit the login form
//     cy.get('button[type="submit"]').click()
    
//     // Should show error message
//     cy.contains('Invalid credentials').should('be.visible')
    
//     // Should still be on login page
//     cy.url().should('include', '/login')
//   })

//   it('should login and logout using custom commands', () => {
//     // Test the custom commands
//     cy.login()
//     cy.logout()
    
//     // Verify we're back at login page
//     cy.url().should('include', '/login')
//   })
}) 