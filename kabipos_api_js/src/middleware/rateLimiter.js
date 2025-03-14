const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

/**
 * API isteklerini sınırlandırmak için rate limiter
 * @param {number} windowMs - Zaman penceresi (milisaniye)
 * @param {number} max - Zaman penceresi içinde izin verilen maksimum istek sayısı
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // RateLimit-* başlıklarını döndür
    legacyHeaders: false, // X-RateLimit-* başlıklarını döndürme
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit aşıldı: ${req.ip} - ${req.method} ${req.originalUrl}`);
      res.status(options.statusCode).json({
        success: false,
        message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
      });
    }
  });
};

// Genel API rate limiter
const apiLimiter = createRateLimiter();

// Login için daha sıkı rate limiter (brute force saldırılarını önlemek için)
const loginLimiter = createRateLimiter(60 * 60 * 1000, 10); // 1 saat içinde 10 istek

module.exports = {
  apiLimiter,
  loginLimiter,
  createRateLimiter
}; 