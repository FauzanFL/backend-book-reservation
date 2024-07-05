/* eslint-disable no-undef */
const request = require('supertest');
const { createServer } = require('../utils/server');
const { Member, Penalty, BorrowedBook, Book } = require('../models');

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
      const memberData = [
        {
          id: 1,
          code: 'M001',
          name: 'Angga',
          borrowing: 0,
          status: 'normal',
        },
        {
          id: 2,
          code: 'M002',
          name: 'Farry',
          borrowing: 0,
          status: 'normal',
        },
        {
          id: 3,
          code: 'M003',
          name: 'Putri',
          borrowing: 0,
          status: 'normal',
        },
      ];
      jest
        .spyOn(Member, 'findAll')
        .mockReturnValueOnce(Promise.resolve(memberData));
      const response = await agent.get('/members');
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Array);

      jest.spyOn(Member, 'findAll').mockRestore();
    });
  });

  describe('GET /members/{code}', () => {
    it('should return member not found', async () => {
      jest.spyOn(Member, 'findOne').mockReturnValueOnce(Promise.resolve(null));

      const code = 'M024';
      const response = await agent.get(`/members/${code}`);
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Member not found');

      jest.spyOn(Member, 'findOne').mockRestore();
    });

    it('should return a member information', async () => {
      const memberData = {
        id: 1,
        code: 'M001',
        name: 'John Doe',
        borrowing: 1,
        status: 'normal',
        borrowedbooks: [
          {
            id: 2,
            book_id: 3,
            date_borrowed: new Date(Date.now() - 1000 * 60 * 1),
            date_returned: null,
          },
        ],
        penalty: null,
      };
      jest
        .spyOn(Member, 'findOne')
        .mockReturnValueOnce(Promise.resolve(memberData));

      const code = 'M001';
      const response = await agent.get(`/members/${code}`);

      expect(response.body).toHaveProperty('id', memberData.id);
      expect(response.body).toHaveProperty('code', memberData.code);
      expect(response.body).toHaveProperty('name', memberData.name);
      expect(response.body).toHaveProperty('borrowing', memberData.borrowing);
      expect(response.body).toHaveProperty('status', memberData.status);

      expect(response.body.borrowedbooks).toBeInstanceOf(Array);
      expect(response.body.borrowedbooks.length).toBe(1);
      expect(response.body.borrowedbooks[0]).toHaveProperty(
        'id',
        memberData.borrowedbooks[0].id
      );
      expect(response.body.borrowedbooks[0]).toHaveProperty(
        'book_id',
        memberData.borrowedbooks[0].book_id
      );

      jest.spyOn(Member, 'findOne').mockRestore();
    });
  });

  describe('GET /books', () => {
    it('should return a list of books ready', async () => {
      const bookData = [
        {
          id: 1,
          title: 'Book 1',
          code: 'B001',
        },
        {
          id: 2,
          title: 'Book 2',
          code: 'B002',
        },
      ];

      jest
        .spyOn(Book, 'findAll')
        .mockReturnValueOnce(Promise.resolve(bookData));
      const response = await agent.get('/books');
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Array);

      jest.spyOn(Book, 'findAll').mockRestore();
    });
  });

  describe('POST /books/borrow', () => {
    it('should return book not found', async () => {
      jest.spyOn(Book, 'findOne').mockReturnValueOnce(null);

      const response = await agent.post('/books/borrow').send({
        member_code: 'M001',
        book_code: 'BK-01',
      });
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Book not found or out of stock');

      jest.spyOn(Book, 'findOne').mockRestore();
    });

    it('should return member not found', async () => {
      jest.spyOn(Member, 'findOne').mockReturnValueOnce(null);

      const response = await agent.post('/books/borrow').send({
        member_code: 'M010',
        book_code: 'JK-45',
      });
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Member not found');

      jest.spyOn(Member, 'findOne').mockRestore();
    });

    it('should return you have reached the maximum limit of borrowing', async () => {
      jest.spyOn(Member, 'findOne').mockReturnValueOnce(
        Promise.resolve({
          id: 1,
          code: 'M001',
          borrowing: 2,
        })
      );

      const response = await agent.post('/books/borrow').send({
        member_code: 'M001',
        book_code: 'JK-45',
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual(
        'You have reached the maximum limit of borrowing'
      );

      jest.spyOn(Member, 'findOne').mockRestore();
    });

    it('should return you have a book that has not been returned', async () => {
      jest.spyOn(Member, 'findOne').mockReturnValueOnce(
        Promise.resolve({
          id: 1,
          code: 'M001',
          borrowing: 1,
        })
      );
      jest.spyOn(BorrowedBook, 'findOne').mockReturnValueOnce(
        Promise.resolve({
          id: 1,
          member_id: 1,
          date_returned: new Date(Date.now - 1 * 60 * 1000),
        })
      );

      const response = await agent.post('/books/borrow').send({
        member_code: 'M001',
        book_code: 'JK-45',
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual(
        'You have a book that has not been returned'
      );

      jest.spyOn(Member, 'findOne').mockRestore();
      jest.spyOn(BorrowedBook, 'findOne').mockRestore();
    });

    it('should return you have penalty', async () => {
      jest.spyOn(Member, 'findOne').mockReturnValueOnce(
        Promise.resolve({
          id: 1,
          code: 'M001',
          borrowing: 0,
        })
      );
      jest.spyOn(Penalty, 'findOne').mockReturnValueOnce(
        Promise.resolve({
          id: 3,
          member_id: 1,
          end_date: new Date(Date.now() + 1000 * 60 * 60),
        })
      );

      const response = await agent.post('/books/borrow').send({
        member_code: 'M001',
        book_code: 'JK-45',
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('You have penalty');

      jest.spyOn(Member, 'findOne').mockRestore();
      jest.spyOn(Penalty, 'findOne').mockRestore();
    });

    // it('should return success response', async () => {
    //   jest
    //     .spyOn(Member, 'findOne')
    //     .mockReturnValueOnce(
    //       Promise.resolve({ id: 1, code: 'M001', borrowing: 1 })
    //     );
    //   jest
    //     .spyOn(BorrowedBook, 'findOne')
    //     .mockReturnValueOnce(Promise.resolve(null));
    //   jest.spyOn(Penalty, 'findOne').mockReturnValueOnce(Promise.resolve(null));
    //   jest
    //     .spyOn(Book, 'findOne')
    //     .mockReturnValueOnce(
    //       Promise.resolve({ id: 2, code: 'JK-45', stock: 1 })
    //     );
    //   const response = await agent.post('/books/borrow').send({
    //     member_code: 'M001',
    //     book_code: 'JK-45',
    //   });
    //   // expect(response.statusCode).toBe(200);
    //   expect(response.body).toHaveProperty('message');
    //   expect(response.body.message).toEqual('Book borrowed successfully');

    //   jest.spyOn(Member, 'findOne').mockRestore();
    //   jest.spyOn(BorrowedBook, 'findOne').mockRestore();
    //   jest.spyOn(Penalty, 'findOne').mockRestore();
    //   jest.spyOn(Book, 'findOne').mockRestore();
    // });

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
    it('should return book not found', async () => {
      jest.spyOn(Book, 'findOne').mockReturnValueOnce(Promise.resolve(null));

      const response = await agent.post('/books/borrow').send({
        member_code: 'M001',
        book_code: 'BK-01',
      });
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Book not found or out of stock');

      jest.spyOn(Book, 'findOne').mockRestore();
    });

    it('should return member not found', async () => {
      jest.spyOn(Member, 'findOne').mockReturnValueOnce(Promise.resolve(null));

      const response = await agent.post('/books/borrow').send({
        member_code: 'M010',
        book_code: 'JK-45',
      });
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Member not found');

      jest.spyOn(Member, 'findOne').mockRestore();
    });

    it('should return borrowed book not found', async () => {
      jest
        .spyOn(Member, 'findOne')
        .mockReturnValueOnce(Promise.resolve({ id: 1, code: 'M001' }));
      jest
        .spyOn(BorrowedBook, 'findOne')
        .mockReturnValueOnce(Promise.resolve(null));
      jest
        .spyOn(Book, 'findOne')
        .mockReturnValueOnce(Promise.resolve({ id: 2, code: 'JK-45' }));

      const response = await agent.post('/books/return').send({
        member_code: 'M001',
        book_code: 'JK-45',
      });
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Borrowed book not found');

      jest.spyOn(Member, 'findOne').mockRestore();
      jest.spyOn(BorrowedBook, 'findOne').mockRestore();
      jest.spyOn(Book, 'findOne').mockRestore();
    });

    it('should return book returned successfully', async () => {
      const response = await agent.post('/books/return').send({
        member_code: 'M001',
        book_code: 'JK-45',
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('Book returned successfully');
    });

    //   it('should return book returned successfully', async () => {
    //     jest
    //       .spyOn(Member, 'findOne')
    //       .mockReturnValueOnce(
    //         Promise.resolve({ id: 1, code: 'M001', borrowing: 1 })
    //       );
    //     jest
    //       .spyOn(Book, 'findOne')
    //       .mockReturnValueOnce(
    //         Promise.resolve({ id: 2, code: 'JK-45', stock: 0 })
    //       );
    //     jest
    //       .spyOn(BorrowedBook, 'findOne')
    //       .mockReturnValueOnce(
    //         Promise.resolve({ id: 3, book_id: 2, member_id: 1 })
    //       );

    //     const response = await agent.post('/books/return').send({
    //       member_code: 'M001',
    //       book_code: 'JK-45',
    //     });
    //     expect(response.statusCode).toBe(200);
    //     expect(response.body).toHaveProperty('message');
    //     expect(response.body.message).toEqual('Book returned successfully');

    //     jest.spyOn(Member, 'findOne').mockRestore();
    //     jest.spyOn(Book, 'findOne').mockRestore();
    //     jest.spyOn(BorrowedBook, 'findOne').mockRestore();
    //   });

    //   it('should return book returned successfully with penalty (not on time)', async () => {
    //     jest
    //       .spyOn(Member, 'findOne')
    //       .mockReturnValueOnce(
    //         Promise.resolve({ id: 1, code: 'M001', borrowing: 1 })
    //       );
    //     jest
    //       .spyOn(Book, 'findOne')
    //       .mockReturnValueOnce(
    //         Promise.resolve({ id: 2, code: 'JK-45', stock: 0 })
    //       );
    //     jest.spyOn(BorrowedBook, 'findOne').mockReturnValueOnce(
    //       Promise.resolve({
    //         id: 3,
    //         book_id: 2,
    //         member_id: 1,
    //         date_returned: new Date(Date.now() - 1000),
    //       })
    //     );

    //     const response = await agent.post('/books/return').send({
    //       member_code: 'M001',
    //       book_code: 'JK-45',
    //     });
    //     expect(response.statusCode).toBe(200);
    //     expect(response.body).toHaveProperty('message');
    //     expect(response.body.message).toEqual(
    //       'Book returned successfully with penalty'
    //     );

    //     jest.spyOn(Member, 'findOne').mockRestore();
    //     jest.spyOn(Book, 'findOne').mockRestore();
    //     jest.spyOn(BorrowedBook, 'findOne').mockRestore();
    // });
  });
});
