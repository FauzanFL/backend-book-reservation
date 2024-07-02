'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Book.hasMany(models.BorrowedBook, {
        sourceKey: 'id',
        foreignKey: 'book_id',
        as: 'borrowedbooks',
      });
    }
  }
  Book.init(
    {
      code: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: 'Code already exists',
        },
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'Code is required',
          },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'Title is required',
          },
        },
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'Author is required',
          },
        },
      },
      stock: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Book',
    }
  );
  return Book;
};
