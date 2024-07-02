/* eslint-disable no-undef */
const request = require('supertest');
const { createServer } = require('../utils/server');

const app = createServer();

describe('Library Management API', () => {
  let server;
  let agent;

  beforeAll(() => {
    server = app.listen(3000);
    agent = request.agent(app);
  });

  afterAll(() => {
    jest.restoreAllMocks();
    server.close();
  });

  describe('GET /members', () => {
    it('should return a list of members', async () => {
      const response = await agent.get('/members');
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('GET /members/{code}', () => {
    it('should return a member information', async () => {
      const code = 'M001';
      const response = await agent.get(`/members/${code}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('borrowedbooks');
    });

    it('should return book not found if code not match', async () => {
      const code = 'M024';
      const response = await agent.get(`/members/${code}`);
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Member not found');
    });
  });

  describe('GET /books', () => {
    it('should return a list of books ready', async () => {
      const response = await agent.get('/books');
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('POST /books/borrow', () => {
    it('should return success response', async () => {
      const response = await agent.post('/books/borrow').send({
        member_code: 'M001',
        book_code: 'JK-45',
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Book borrowed successfully');
    });
  });

  describe('POST /books/return', () => {
    it('should return success response', async () => {
      const response = await agent.post('/books/return').send({
        member_code: 'M001',
        book_code: 'JK-45',
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Book returned successfully');
    });
  });
});
