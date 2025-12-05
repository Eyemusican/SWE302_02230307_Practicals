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

  it('should validate response headers', () => {
    cy.request('/api/dogs').then((response) => {
      expect(response.headers).to.have.property('content-type');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('should handle invalid breed gracefully', () => {
    cy.request({
      url: '/api/dogs?breed=invalidbreedname123',
      failOnStatusCode: false,
    }).then((response) => {
      // API returns 200 but with error status or empty result
      expect(response.status).to.be.oneOf([200, 404, 500]);
      if (response.status === 200) {
        // Check that response indicates an error or has no valid data
        expect(response.body).to.satisfy((body: any) => {
          return body.status === 'error' || body.message === null || (Array.isArray(body.message) && body.message.length === 0);
        });
      }
    });
  });

  it('should validate response time is reasonable', () => {
    const startTime = Date.now();
    cy.request('/api/dogs').then(() => {
      const duration = Date.now() - startTime;
      // API should respond within 5 seconds
      expect(duration).to.be.lessThan(5000);
    });
  });

  it('should validate breeds are returned as expected format', () => {
    cy.request('/api/dogs/breeds').then((response) => {
      const breeds = response.body.message;
      
      // Check that each breed value is an array (for sub-breeds)
      Object.values(breeds).forEach((subBreeds) => {
        expect(subBreeds).to.be.an('array');
      });

      // Check that breed names are strings
      Object.keys(breeds).forEach((breedName) => {
        expect(breedName).to.be.a('string');
        expect(breedName.length).to.be.greaterThan(0);
      });
    });
  });
});
