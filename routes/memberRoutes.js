const { Router } = require('express');
const {
  showAllMembers,
  getMemberByCode,
} = require('../controllers/memberControllers');

const router = Router();

/**
 * @openapi
 * /members:
 *  get:
 *    tags:
 *    - Members
 *    summary: Get all members
 *    description: Get all members
 *    responses:
 *      200:
 *        description: A list of all members
 *        content:
 *          application/json:
 *            example:
 *              - id: 1
 *                code: M001
 *                name: Angga
 *                borrowing: 0
 *                status: normal
 *              - id: 2
 *                code: M002
 *                name: Ferry
 *                borrowing: 0
 *                status: normal
 *      500:
 *        description: Internal Server Error
 *
 */
router.get('/', showAllMembers);

/**
 * @openapi
 * /members/{code}:
 *  get:
 *    tags:
 *    - Members
 *    summary: Get a member by code
 *    description: Get a member by code with borrowed books and penalty
 *    parameters:
 *      - in: path
 *        name: code
 *        required: true
 *        description: Member code
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Member found
 *        content:
 *          application/json:
 *            example:
 *              id: 1
 *              code: M001
 *              name: Angga
 *              borrowing: 0
 *              status: normal
 *              borrowedbooks:
 *                - id: 1
 *                  book_id: 4
 *                  date_borrowed: 2024-06-26T07:29:28.000Z
 *                  date_returned: 2024-06-26T07:30:28.000Z
 *              penalty: null
 *      404:
 *        description: Member not found
 *      500:
 *        description: Internal Server Error
 *
 */
router.get('/:code', getMemberByCode);

module.exports = router;
