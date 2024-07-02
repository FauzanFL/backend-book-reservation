const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book API',
      version: '1.0.0',
      description: 'A simple Express Library API',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
  apis: ['./routes/*.js'],
};

const swaggerDoc = swaggerJSDoc(options);

const swaggerSpec = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  app.get('docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = { swaggerSpec };
