const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kabipos API',
      version: '1.0.0',
      description: 'Kabipos Barkodlu Satış Sistemi API Dokümantasyonu',
      contact: {
        name: 'Kabipos Destek',
        url: 'https://kabipos.com',
        email: 'destek@kabipos.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Geliştirme Sunucusu'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 