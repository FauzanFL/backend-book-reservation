const express = require('express');

const memberRouter = require('../routes/memberRoutes');
const bookRouter = require('../routes/bookRoutes');

const createServer = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    res.send('Welcome to Book API!');
  });

  app.use('/members', memberRouter);
  app.use('/books', bookRouter);

  return app;
};

module.exports = { createServer };
