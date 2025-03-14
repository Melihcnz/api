const logger = require('../config/logger');

/**
 * Global hata yakalama middleware'i
 * @param {Error} err - Hata nesnesi
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Sonraki middleware fonksiyonu
 */
const errorHandler = (err, req, res, next) => {
  // Hata seviyesini belirle
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  // Hata mesajını logla
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Geliştirme ortamında stack trace'i göster
  const stack = process.env.NODE_ENV === 'production' ? null : err.stack;
  
  // Hata yanıtını oluştur
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: stack
  });
};

/**
 * 404 Not Found middleware'i
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Sonraki middleware fonksiyonu
 */
const notFound = (req, res, next) => {
  const error = new Error(`Bulunamadı - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound }; 