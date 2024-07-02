'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BorrowedBook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      BorrowedBook.belongsTo(models.Member, {
        foreignKey: 'member_id',
        targetKey: 'id',
        as: 'members',
      });
      BorrowedBook.belongsTo(models.Book, {
        foreignKey: 'book_id',
        targetKey: 'id',
        as: 'books',
      });
    }
  }
  BorrowedBook.init(
    {
      book_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Book',
          key: 'id',
        },
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'Book id is required',
          },
          isInt: {
            args: true,
            msg: 'Book id must be an integer',
          },
        },
        isExist(value) {
          return sequelize.models.Book.findByPk(value).then((book) => {
            if (!book) {
              throw new Error('Book does not exist');
            }
          });
        },
      },
      member_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Member',
          key: 'id',
        },
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'Member id is required',
          },
          isInt: {
            args: true,
            msg: 'Member id must be an integer',
          },
        },
        isExist(value) {
          return sequelize.models.Member.findByPk(value).then((member) => {
            if (!member) {
              throw new Error('Member does not exist');
            }
          });
        },
      },
      date_borrowed: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'Date borrowed is required',
          },
        },
      },
      date_returned: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'Date returned is required',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'BorrowedBook',
    }
  );
  return BorrowedBook;
};
