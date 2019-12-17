const request = require('supertest');
const app = require('../server');

describe('GET /bla', () => {
  it('should return 404 OK', (done) => {
    request(app)
      .get('/bla')
      .expect(404, done);
  });
});