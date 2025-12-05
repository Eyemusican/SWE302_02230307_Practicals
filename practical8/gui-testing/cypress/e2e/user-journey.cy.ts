describe('Complete User Journey', () => {
  it('should complete a full user workflow', () => {
    // 1. User visits homepage
    cy.visit('/');

    // 2. User sees welcome message
    cy.get('[data-testid="page-title"]')
      .should('be.visible')
      .and('contain.text', 'Dog Image Browser');
    
    cy.get('[data-testid="page-subtitle"]')
      .should('be.visible')
      .and('contain.text', 'Powered by Dog CEO API');
    
    cy.get('[data-testid="placeholder-message"]')
      .should('be.visible')
      .and('contain.text', 'Click "Get Random Dog" to see a cute dog!');

    // 3. User browses available breeds
    cy.get('[data-testid="breed-selector"] option', { timeout: 10000 })
      .should('have.length.greaterThan', 1);
    
    cy.get('[data-testid="breed-selector"] option')
      .first()
      .should('have.text', 'All Breeds (Random)');

    // 4. User selects a specific breed (husky)
    cy.get('[data-testid="breed-selector"]').select('husky');
    cy.get('[data-testid="breed-selector"]')
      .should('have.value', 'husky');

    // 5. User fetches dog image
    cy.get('[data-testid="fetch-dog-button"]').click();
    
    // 5a. User sees loading state
    cy.get('[data-testid="fetch-dog-button"]')
      .should('contain.text', 'Loading...')
      .and('be.disabled');

    // 6. User views the image
    cy.get('[data-testid="dog-image-container"]', { timeout: 10000 })
      .should('be.visible');
    
    cy.get('[data-testid="dog-image"]')
      .should('be.visible')
      .invoke('attr', 'src')
      .should('include', 'husky');

    // Placeholder should disappear
    cy.get('[data-testid="placeholder-message"]')
      .should('not.exist');

    // Button returns to normal state
    cy.get('[data-testid="fetch-dog-button"]')
      .should('contain.text', 'Get Random Dog')
      .and('not.be.disabled');

    // 7. User selects different breed (corgi)
    cy.get('[data-testid="breed-selector"]').select('corgi');
    cy.get('[data-testid="breed-selector"]')
      .should('have.value', 'corgi');

    // 8. User fetches another image
    cy.get('[data-testid="fetch-dog-button"]').click();
    
    cy.get('[data-testid="dog-image"]', { timeout: 10000 })
      .should('be.visible')
      .invoke('attr', 'src')
      .should('include', 'corgi');

    // 9. User selects "All Breeds" (random)
    cy.get('[data-testid="breed-selector"]').select('');
    cy.get('[data-testid="breed-selector"]')
      .should('have.value', '');

    // 10. User fetches random dog
    cy.get('[data-testid="fetch-dog-button"]').click();
    
    cy.get('[data-testid="dog-image"]', { timeout: 10000 })
      .should('be.visible')
      .and('have.attr', 'src')
      .and('include', 'images.dog.ceo');

    // Verify no errors throughout the journey
    cy.get('[data-testid="error-message"]')
      .should('not.exist');
  });

  it('should handle error recovery in user journey', () => {
    // User visits homepage
    cy.visit('/');

    // Mock API failure for first request
    cy.intercept('GET', '/api/dogs', {
      statusCode: 500,
      body: { error: 'Server Error' },
    }).as('getDogError');

    // User tries to fetch dog
    cy.get('[data-testid="fetch-dog-button"]').click();
    cy.wait('@getDogError');

    // User sees error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain.text', 'Failed to load dog image');

    // No image is displayed
    cy.get('[data-testid="dog-image-container"]')
      .should('not.exist');

    // User tries again (this time it works)
    cy.intercept('GET', '/api/dogs', {
      statusCode: 200,
      body: {
        message: 'https://images.dog.ceo/breeds/husky/n02110185_1469.jpg',
        status: 'success',
      },
    }).as('getDogSuccess');

    cy.get('[data-testid="fetch-dog-button"]').click();
    cy.wait('@getDogSuccess');

    // Error message disappears
    cy.get('[data-testid="error-message"]')
      .should('not.exist');

    // Image is now displayed
    cy.get('[data-testid="dog-image"]')
      .should('be.visible');
  });

  it('should support rapid user interactions', () => {
    cy.visit('/');
    
    // Wait for breeds to load
    cy.get('[data-testid="breed-selector"] option', { timeout: 10000 })
      .should('have.length.greaterThan', 1);

    // User rapidly switches breeds and fetches
    cy.get('[data-testid="breed-selector"]').select('husky');
    cy.get('[data-testid="fetch-dog-button"]').click();
    
    cy.get('[data-testid="breed-selector"]').select('poodle');
    cy.get('[data-testid="fetch-dog-button"]').click();
    
    cy.get('[data-testid="breed-selector"]').select('corgi');
    cy.get('[data-testid="fetch-dog-button"]').click();

    // Application should handle gracefully and show final result
    cy.get('[data-testid="dog-image"]', { timeout: 10000 })
      .should('be.visible');

    cy.get('[data-testid="error-message"]')
      .should('not.exist');
  });
});
