'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Penalty extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Penalty.belongsTo(models.Member, {
        foreignKey: 'member_id',
        targetKey: 'id',
        as: 'member',
      });
    }
  }
  Penalty.init(
    {
      member_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'Member',
          key: 'code',
        },
        validate: {
          notNull: {
            args: true,
            msg: 'Member code is required',
          },
        },
        isExist(value) {
          return sequelize.models.member.findByPk(value).then((member) => {
            if (!member) {
              throw new Error('Member does not exist');
            }
          });
        },
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'Start date is required',
          },
        },
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            args: true,
            msg: 'End date is required',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Penalty',
    }
  );
  return Penalty;
};
