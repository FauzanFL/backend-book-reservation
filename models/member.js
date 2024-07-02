'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Member.hasMany(models.BorrowedBook, {
        sourceKey: 'id',
        foreignKey: 'member_id',
        as: 'borrowedbooks',
      });
      Member.hasOne(models.Penalty, {
        sourceKey: 'id',
        foreignKey: 'member_id',
        as: 'penalty',
      });
    }
  }
  Member.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'Name is required',
          },
        },
      },
      borrowing: DataTypes.INTEGER,
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'Status is required',
          },
          isIn: [['normal', 'penalty']],
        },
        defaultValue: 'normal',
      },
    },
    {
      sequelize,
      modelName: 'Member',
    }
  );
  return Member;
};
