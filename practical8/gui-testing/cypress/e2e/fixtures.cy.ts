describe('Dog Image Browser - Using Fixtures', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should use fixture data for mocking', () => {
    // Load fixture and use it
    cy.fixture('dog-responses.json').then((data) => {
      cy.intercept('GET', '/api/dogs', {
        statusCode: 200,
        body: data.randomDog,
      }).as('getDog');

      cy.get('[data-testid="fetch-dog-button"]').click();
      cy.wait('@getDog');

      cy.get('[data-testid="dog-image"]')
        .should('have.attr', 'src')
        .and('include', 'n02110185_1469.jpg');
    });
  });

  it('should mock breeds list with fixture', () => {
    cy.fixture('dog-responses.json').then((data) => {
      cy.intercept('GET', '/api/dogs/breeds', {
        statusCode: 200,
        body: data.breedList,
      }).as('getBreeds');

      cy.reload();
      cy.wait('@getBreeds');

      // Check that mocked breeds appear
      cy.get('[data-testid="breed-selector"]')
        .find('option')
        .should('have.length', 6); // 5 breeds + "All Breeds" option
    });
  });

  it('should use fixture for specific breed response', () => {
    cy.fixture('dog-responses.json').then((data) => {
      cy.intercept('GET', '/api/dogs?breed=husky', {
        statusCode: 200,
        body: data.specificBreed,
      }).as('getHusky');

      // Wait for breeds to load
      cy.get('[data-testid="breed-selector"] option', { timeout: 10000 })
        .should('have.length.greaterThan', 1);

      cy.get('[data-testid="breed-selector"]').select('husky');
      cy.get('[data-testid="fetch-dog-button"]').click();
      cy.wait('@getHusky');

      cy.get('[data-testid="dog-image"]')
        .should('have.attr', 'src')
        .and('include', 'n02110185_1469.jpg');
    });
  });

  it('should use fixture for error scenarios', () => {
    cy.fixture('dog-responses.json').then((data) => {
      cy.intercept('GET', '/api/dogs', {
        statusCode: 500,
        body: data.apiError,
      }).as('getDogError');

      cy.get('[data-testid="fetch-dog-button"]').click();
      cy.wait('@getDogError');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Failed to load dog image');
    });
  });
});
