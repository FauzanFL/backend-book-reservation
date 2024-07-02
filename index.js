const { createServer } = require('./utils/server');
const { swaggerSpec } = require('./utils/swagger');

const app = createServer();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
  swaggerSpec(app);
});
