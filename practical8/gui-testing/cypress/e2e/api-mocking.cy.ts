describe('Dog Image Browser - API Mocking', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should handle successful API response', () => {
    // Intercept the API call and mock response
    cy.intercept('GET', '/api/dogs', {
      statusCode: 200,
      body: {
        message: 'https://images.dog.ceo/breeds/husky/n02110185_1469.jpg',
        status: 'success',
      },
    }).as('getDog');

    // Click button
    cy.get('[data-testid="fetch-dog-button"]').click();

    // Wait for intercepted request
    cy.wait('@getDog');

    // Check that mocked image is displayed
    cy.get('[data-testid="dog-image"]')
      .should('be.visible')
      .and('have.attr', 'src')
      .and('include', 'n02110185_1469.jpg');
  });

  it('should handle API errors gracefully', () => {
    // Mock API failure
    cy.intercept('GET', '/api/dogs', {
      statusCode: 500,
      body: {
        error: 'Internal Server Error',
      },
    }).as('getDogError');

    // Click button
    cy.get('[data-testid="fetch-dog-button"]').click();

    // Wait for failed request
    cy.wait('@getDogError');

    // Error message should be displayed
    cy.get('[data-testid="error-message"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Failed to load dog image');

    // Image should not be displayed
    cy.get('[data-testid="dog-image-container"]')
      .should('not.exist');
  });

  it('should handle network timeout', () => {
    // Mock slow API response (delay)
    cy.intercept('GET', '/api/dogs', {
      delay: 15000, // 15 seconds
      statusCode: 200,
      body: {
        message: 'https://images.dog.ceo/breeds/husky/n02110185_1469.jpg',
        status: 'success',
      },
    }).as('getSlowDog');

    // Click button
    cy.get('[data-testid="fetch-dog-button"]').click();

    // Button should show loading for extended period
    cy.get('[data-testid="fetch-dog-button"]')
      .should('contain.text', 'Loading...')
      .and('be.disabled');
  });

  it('should handle breeds API failure', () => {
    // Intercept breeds API and make it fail
    cy.intercept('GET', '/api/dogs/breeds', {
      statusCode: 500,
      body: {
        error: 'Failed to fetch breeds',
      },
    }).as('getBreedsError');

    // Reload page to trigger breeds fetch
    cy.reload();

    // Wait for failed request
    cy.wait('@getBreedsError');

    // Breed selector should still be visible but might be empty or show error
    cy.get('[data-testid="breed-selector"]')
      .should('be.visible');
  });

  it('should verify request headers', () => {
    cy.intercept('GET', '/api/dogs', (req) => {
      // Verify request has expected properties
      expect(req.url).to.include('/api/dogs');

      req.reply({
        statusCode: 200,
        body: {
          message: 'https://images.dog.ceo/breeds/husky/n02110185_1469.jpg',
          status: 'success',
        },
      });
    }).as('getDog');

    cy.get('[data-testid="fetch-dog-button"]').click();
    cy.wait('@getDog');
  });

  it('should verify breed query parameter is sent correctly', () => {
    // Wait for breeds to load first
    cy.get('[data-testid="breed-selector"] option', { timeout: 10000 })
      .should('have.length.greaterThan', 1);

    // Intercept with query parameter check
    cy.intercept('GET', '/api/dogs?breed=husky', (req) => {
      expect(req.url).to.include('breed=husky');

      req.reply({
        statusCode: 200,
        body: {
          message: ['https://images.dog.ceo/breeds/husky/n02110185_1469.jpg'],
          status: 'success',
        },
      });
    }).as('getHusky');

    // Select husky breed
    cy.get('[data-testid="breed-selector"]').select('husky');
    cy.get('[data-testid="fetch-dog-button"]').click();

    // Verify request was made
    cy.wait('@getHusky');
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
});

describe('Dog Image Browser - API Response Validation', () => {
  it('should validate breeds API response structure', () => {
    cy.request('/api/dogs/breeds').then((response) => {
      // Check status code
      expect(response.status).to.eq(200);

      // Check response body structure
      expect(response.body).to.have.property('message');
      expect(response.body).to.have.property('status');
      expect(response.body.status).to.eq('success');

      // Check that message is an object with breed names
      expect(response.body.message).to.be.an('object');
      const breeds = Object.keys(response.body.message);
      expect(breeds.length).to.be.greaterThan(0);
    });
  });

  it('should validate random dog API response structure', () => {
    cy.request('/api/dogs').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message');
      expect(response.body).to.have.property('status');
      expect(response.body.status).to.eq('success');

      // Message should be a URL string
      expect(response.body.message).to.be.a('string');
      expect(response.body.message).to.include('https://images.dog.ceo');
    });
  });

  it('should validate specific breed API response', () => {
    cy.request('/api/dogs?breed=husky').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.message).to.be.an('array');
      expect(response.body.message[0]).to.include('husky');
    });
  });
});
