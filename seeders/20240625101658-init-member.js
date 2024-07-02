/* eslint-disable no-unused-vars */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'members',
      [
        {
          code: 'M001',
          name: 'Angga',
          borrowing: 0,
          status: 'normal',
        },
        {
          code: 'M002',
          name: 'Ferry',
          borrowing: 0,
          status: 'normal',
        },
        {
          code: 'M003',
          name: 'Putri',
          borrowing: 0,
          status: 'normal',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('members', null, {});
  },
};
