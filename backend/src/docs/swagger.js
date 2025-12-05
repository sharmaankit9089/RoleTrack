const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Intern Assignment API',
      version: '1.0.0',
      description: 'API documentation for the intern assignment (Express + MongoDB)'
    },
    servers: [ { url: '/' } ]
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const specs = swaggerJsdoc(options);
module.exports = specs;
