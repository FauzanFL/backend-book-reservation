const { Member, BorrowedBook, Penalty } = require('../models');
const showAllMembers = async (req, res) => {
  try {
    const members = await Member.findAll({
      attributes: ['id', 'code', 'name', 'borrowing', 'status'],
    });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMemberByCode = async (req, res) => {
  const { code } = req.params;
  const codeUpper = code.toUpperCase();

  try {
    const member = await Member.findOne({
      where: {
        code: codeUpper,
      },
      attributes: ['id', 'code', 'name', 'borrowing', 'status'],

      include: [
        {
          model: BorrowedBook,
          attributes: ['id', 'book_id', 'date_borrowed', 'date_returned'],
          as: 'borrowedbooks',
        },
        { model: Penalty, as: 'penalty' },
      ],
    });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { showAllMembers, getMemberByCode };
