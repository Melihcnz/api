const winston = require('winston');
const path = require('path');
require('dotenv').config();

// Log seviyelerini tanımla
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Log seviyesini ortam değişkeninden al veya varsayılan olarak 'info' kullan
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : process.env.LOG_LEVEL || 'info';
};

// Log formatını tanımla
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Log dosyalarının kaydedileceği klasörü oluştur
const logDir = path.join(__dirname, '../../logs');

// Transport ayarlarını tanımla
const transports = [
  // Konsola log yazdırma
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      format
    )
  }),
  // Hata loglarını dosyaya yazdırma
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error'
  }),
  // Tüm logları dosyaya yazdırma
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log')
  })
];

// Logger'ı oluştur
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
});

module.exports = logger; 