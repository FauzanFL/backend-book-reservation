const { Op } = require('sequelize');
const { Book, Member, BorrowedBook, Penalty } = require('../models');

const showAllBooksReady = async (req, res) => {
  try {
    const books = await Book.findAll({
      attributes: ['code', 'title', 'author', 'stock'],
      where: {
        stock: {
          [Op.gt]: 0,
        },
      },
    });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const borrowBook = async (req, res) => {
  const { book_code, member_code } = req.body;

  try {
    const member = await Member.findOne({
      where: {
        code: member_code,
      },
    });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    } else if (member.borrowing >= 2) {
      return res
        .status(400)
        .json({ message: 'You have reached the maximum limit of borrowing' });
    }

    const borrowedBook = await BorrowedBook.findOne({
      where: {
        member_id: member.id,
        date_returned: {
          [Op.lt]: new Date(Date.now()),
        },
      },
    });

    if (borrowedBook) {
      return res
        .status(400)
        .json({ message: 'You have a book that has not been returned' });
    }

    const penalty = await Penalty.findOne({
      where: {
        member_id: member.id,
      },
    });

    if (penalty && penalty.end_date > new Date(Date.now())) {
      return res.status(400).json({ message: `You have penalty` });
    } else if (penalty && penalty.end_date < new Date(Date.now())) {
      await member.update(
        {
          status: 'normal',
          updated_at: new Date(Date.now()),
        },
        {
          where: {
            id: member.id,
          },
        }
      );
      await Penalty.destroy({
        where: {
          id: penalty.id,
        },
      });
    }

    const book = await Book.findOne({
      where: {
        code: book_code,
        stock: {
          [Op.gt]: 0,
        },
      },
    });
    if (!book) {
      return res
        .status(404)
        .json({ message: 'Book not found or out of stock' });
    }
    await book.update(
      {
        stock: book.stock - 1,
        updated_at: new Date(Date.now()),
      },
      { where: { id: book.id } }
    );

    await BorrowedBook.create({
      book_id: book.id,
      member_id: member.id,
      date_borrowed: new Date(Date.now()),
      // date_returned: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      date_returned: new Date(Date.now() + 1 * 60 * 1000),
    });

    await member.update(
      {
        borrowing: member.borrowing + 1,
        updated_at: new Date(Date.now()),
      },
      { where: { id: member.id } }
    );
    res.status(200).json({ message: 'Book borrowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const returnBook = async (req, res) => {
  const { book_code, member_code } = req.body;

  try {
    const member = await Member.findOne({
      where: {
        code: member_code,
      },
    });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const book = await Book.findOne({
      where: {
        code: book_code,
      },
    });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const borrowedBook = await BorrowedBook.findOne({
      where: {
        book_id: book.id,
        member_id: member.id,
      },
    });

    if (!borrowedBook) {
      return res.status(404).json({ message: 'Borrowed book not found' });
    }

    await BorrowedBook.destroy({
      where: {
        id: borrowedBook.id,
      },
    });

    await book.update(
      {
        stock: book.stock + 1,
        updated_at: new Date(Date.now()),
      },
      { where: { id: book.id } }
    );

    await member.update(
      {
        borrowing: member.borrowing - 1,
        updated_at: new Date(Date.now()),
      },
      { where: { id: member.id } }
    );

    if (new Date(borrowedBook.date_returned) < new Date(Date.now())) {
      const penalty = await Penalty.findOne({
        where: {
          member_id: member.id,
        },
      });
      if (penalty) {
        await penalty.update(
          {
            end_date: new Date(Date.now() + 1 * 60 * 1000),
          },
          {
            where: {
              id: penalty.id,
            },
          }
        );
      } else {
        await Penalty.create({
          member_id: member.id,
          start_date: new Date(Date.now()),
          // end_date: new Date(Date.now() * 3 * 24 * 60 * 60 * 1000),
          end_date: new Date(Date.now() + 1 * 60 * 1000),
        });
        await member.update(
          {
            status: 'penalty',
            updated_at: new Date(Date.now()),
          },
          {
            where: {
              id: member.id,
            },
          }
        );
      }
      res
        .status(200)
        .json({ message: 'Book returned successfully with penalty' });
    } else {
      res.status(200).json({ message: 'Book returned successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { showAllBooksReady, borrowBook, returnBook };
