const { verifyToken } = require('../config/jwt');
const { Firma } = require('../models');
const logger = require('../config/logger');

/**
 * JWT token doğrulama middleware'i
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Sonraki middleware fonksiyonu
 */
const authenticate = async (req, res, next) => {
  try {
    // Authorization header'ını kontrol et
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Yetkilendirme başlığı eksik veya geçersiz format' 
      });
    }

    // Token'ı çıkar ve doğrula
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Geçersiz veya süresi dolmuş token' 
      });
    }

    // Firma bilgisini veritabanından kontrol et
    const firma = await Firma.findOne({ where: { firmaKodu: decoded.firmaKodu } });
    if (!firma) {
      return res.status(401).json({ 
        success: false, 
        message: 'Firma bulunamadı' 
      });
    }

    if (!firma.aktif) {
      return res.status(403).json({ 
        success: false, 
        message: 'Firma hesabı aktif değil' 
      });
    }

    // Firma bilgisini request nesnesine ekle
    req.firma = {
      firmaKodu: firma.firmaKodu,
      firmaAdi: firma.firmaAdi,
      eposta: firma.eposta
    };

    // Token bilgisini request nesnesine ekle
    req.token = decoded;

    next();
  } catch (error) {
    logger.error(`Kimlik doğrulama hatası: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Kimlik doğrulama sırasında bir hata oluştu' 
    });
  }
};

/**
 * API Key doğrulama middleware'i
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Sonraki middleware fonksiyonu
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    // API Key header'ını kontrol et
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ 
        success: false, 
        message: 'API Key eksik' 
      });
    }

    // Firma bilgisini veritabanından kontrol et
    const firma = await Firma.findOne({ where: { apiKey } });
    if (!firma) {
      return res.status(401).json({ 
        success: false, 
        message: 'Geçersiz API Key' 
      });
    }

    if (!firma.aktif) {
      return res.status(403).json({ 
        success: false, 
        message: 'Firma hesabı aktif değil' 
      });
    }

    // Firma bilgisini request nesnesine ekle
    req.firma = {
      firmaKodu: firma.firmaKodu,
      firmaAdi: firma.firmaAdi,
      eposta: firma.eposta
    };

    next();
  } catch (error) {
    logger.error(`API Key doğrulama hatası: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'API Key doğrulama sırasında bir hata oluştu' 
    });
  }
};

module.exports = { authenticate, authenticateApiKey }; 