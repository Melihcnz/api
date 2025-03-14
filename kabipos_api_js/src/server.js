const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Konfigürasyon dosyalarını içe aktar
const { testConnection } = require('./config/database');
const specs = require('./config/swagger');
const logger = require('./config/logger');

// Middleware'leri içe aktar
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route'ları içe aktar
const routes = require('./routes');

// Express uygulamasını oluştur
const app = express();

// Logs klasörünü oluştur
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Middleware'leri ayarla
app.use(helmet()); // Güvenlik başlıkları

// CORS yapılandırması
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];
app.use(cors({
  origin: function(origin, callback) {
    // origin olmayan isteklere izin ver (örn. Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true
}));

app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded body parser

// HTTP isteklerini logla
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }));
}

// API rate limiter
app.use('/api', apiLimiter);

// Swagger API dokümantasyonu
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

// API route'larını tanımla
app.use('/api', routes);

// 404 ve hata yakalama middleware'leri
app.use(notFound);
app.use(errorHandler);

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  // Veritabanı bağlantısını test et
  await testConnection();
  
  logger.info(`Sunucu ${PORT} portunda çalışıyor`);
  logger.info(`API dokümantasyonu: http://localhost:${PORT}/api-docs`);
});

// Beklenmeyen hataları yakala
process.on('unhandledRejection', (err) => {
  logger.error(`Yakalanmamış Promise Reddi: ${err.message}`);
  logger.error(err.stack);
  
  // Sunucuyu düzgün bir şekilde kapat
  server.close(() => {
    process.exit(1);
  });
});

module.exports = { app, server }; 