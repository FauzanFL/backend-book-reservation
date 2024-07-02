const { Router } = require('express');
const {
  showAllBooksReady,
  borrowBook,
  returnBook,
} = require('../controllers/bookControllers');

const router = Router();

/**
 * @openapi
 * /books:
 *  get:
 *    tags:
 *    - Books
 *    summary: Get all books ready
 *    description: Get all books ready
 *    responses:
 *      200:
 *        description: A list of all books ready
 *        content:
 *          application/json:
 *            example:
 *              - id: 1
 *                code: JK-45
 *                title: Harry Potter
 *                author: J.K Rowling
 *                stock: 1
 *              - id: 2
 *                code: SHR-1
 *                title: A Study in Scarlet
 *                author: Arthur Conan Doyle
 *                stock: 1
 *      500:
 *        description: Internal Server Error
 *
 */
router.get('/', showAllBooksReady);

/**
 * @openapi
 * /books/borrow:
 *  post:
 *    tags:
 *    - Books
 *    summary: Borrow a book
 *    description: Borrow a book
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              member_code:
 *                type: string
 *              book_code:
 *                type: string
 *    responses:
 *      200:
 *        description: Book borrowed successfully
 *      404:
 *        description: Not found
 *        content:
 *          application/json:
 *            examples:
 *              example_1:
 *                  summary: Book not found
 *                  value:
 *                      message: Book not found or out of stock
 *              example_2:
 *                  summary: Member not found
 *                  value:
 *                      message: Member not found
 *      400:
 *        description: Client error
 *        content:
 *          application/json:
 *            examples:
 *              example_1:
 *                  summary: Member reach maximum of borrowed books
 *                  value:
 *                      message: You have reached the maximum limit of borrowing
 *              example_2:
 *                  summary: Member has due date to return book
 *                  value:
 *                      message: You have a book that has not been returned
 *              example_3:
 *                  summary: Member has penalty
 *                  value:
 *                      message: You have penalty
 *      500:
 *        description: Internal Server Error
 *
 */
router.post('/borrow', borrowBook);

/**
 * @openapi
 * /books/return:
 *  post:
 *    tags:
 *    - Books
 *    summary: Return a book
 *    description: Return a book
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              member_code:
 *                type: string
 *              book_code:
 *                type: string
 *    responses:
 *      200:
 *        description: Book returned successfully
 *        content:
 *          application/json:
 *            examples:
 *              example_1:
 *                  summary: Book returned without penalty
 *                  value:
 *                      message: Book returned successfully
 *              example_2:
 *                  summary: Book returned with penalty
 *                  value:
 *                      message: Book returned successfully with penalty (can't borrow for 3 days)
 *      404:
 *        description: Not found
 *        content:
 *          application/json:
 *            examples:
 *              example_1:
 *                  summary: Book not found
 *                  value:
 *                      message: Book not found
 *              example_2:
 *                  summary: Member not found
 *                  value:
 *                      message: Member not found
 *              example_3:
 *                  summary: Borrowed book not found
 *                  value:
 *                      message: Borrowed book not found
 *      500:
 *        description: Internal Server Error
 *
 */
router.post('/return', returnBook);

module.exports = router;
