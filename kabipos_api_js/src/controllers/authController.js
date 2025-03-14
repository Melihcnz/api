const { Firma } = require('../models');
const { generateToken } = require('../config/jwt');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

/**
 * Firma giriş işlemi
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const login = async (req, res) => {
  try {
    const { eposta, parola } = req.body;
    
    console.log('Gelen istek:', { eposta, parola }); // Debug log

    // Gerekli alanları kontrol et
    if (!eposta || !parola) {
      console.log('Eksik alanlar'); // Debug log
      return res.status(400).json({
        success: false,
        message: 'E-posta ve parola gereklidir'
      });
    }

    // Firmayı e-posta ile bul
    const firma = await Firma.findOne({ where: { eposta } });
    console.log('Bulunan firma:', firma ? firma.firmaKodu : 'Bulunamadı'); // Debug log
    
    if (!firma) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya parola'
      });
    }

    // Parolayı doğrula
    const isPasswordValid = await firma.validatePassword(parola);
    console.log('Parola doğrulama:', isPasswordValid); // Debug log

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya parola'
      });
    }

    // Firma aktif mi kontrol et
    if (!firma.aktif) {
      return res.status(403).json({
        success: false,
        message: 'Firma hesabı aktif değil'
      });
    }

    // JWT token oluştur
    const token = generateToken({
      firmaKodu: firma.firmaKodu,
      firmaAdi: firma.firmaAdi,
      eposta: firma.eposta
    });

    // Başarılı yanıt döndür
    logger.info(`Başarılı giriş: ${firma.firmaKodu} - ${firma.eposta}`);
    return res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        firmaKodu: firma.firmaKodu,
        firmaAdi: firma.firmaAdi,
        token
      }
    });
  } catch (error) {
    logger.error(`Giriş hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Token doğrulama işlemi
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const verifyAuth = (req, res) => {
  // authenticate middleware'i zaten token'ı doğruladı
  // req.firma ve req.token nesneleri middleware tarafından eklendi
  return res.status(200).json({
    success: true,
    message: 'Token geçerli',
    data: {
      firma: req.firma
    }
  });
};

/**
 * Şifre güncelleme işlemi (GEÇİCİ)
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const resetPassword = async (req, res) => {
  try {
    const { eposta, yeniParola } = req.body;

    // Gerekli alanları kontrol et
    if (!eposta || !yeniParola) {
      return res.status(400).json({
        success: false,
        message: 'E-posta ve yeni parola gereklidir'
      });
    }

    // Firmayı e-posta ile bul
    const firma = await Firma.findOne({ where: { eposta } });
    if (!firma) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı'
      });
    }

    // Parolayı hash'le ve güncelle
    const hashedPassword = await bcrypt.hash(yeniParola, 10);
    
    // Şifreyi güncelle
    firma.parola = hashedPassword;
    await firma.save();

    // Başarılı yanıt döndür
    logger.info(`Şifre güncellendi: ${firma.firmaKodu} - ${firma.eposta}`);
    return res.status(200).json({
      success: true,
      message: 'Şifre başarıyla güncellendi'
    });
  } catch (error) {
    logger.error(`Şifre güncelleme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Şifre güncelleme sırasında bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Yeni firma kaydı (GEÇİCİ)
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const register = async (req, res) => {
  try {
    const { firmaKodu, firmaAdi, eposta, parola } = req.body;

    // Gerekli alanları kontrol et
    if (!firmaKodu || !firmaAdi || !eposta || !parola) {
      return res.status(400).json({
        success: false,
        message: 'Firma kodu, firma adı, e-posta ve parola gereklidir'
      });
    }

    // E-posta adresi kullanılıyor mu kontrol et
    const existingFirma = await Firma.findOne({ where: { eposta } });
    if (existingFirma) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }

    // Yeni firma oluştur
    const yeniFirma = await Firma.create({
      firmaKodu,
      firmaAdi,
      eposta,
      parola,
      aktif: true
    });

    // JWT token oluştur
    const token = generateToken({
      firmaKodu: yeniFirma.firmaKodu,
      firmaAdi: yeniFirma.firmaAdi,
      eposta: yeniFirma.eposta
    });

    // Başarılı yanıt döndür
    logger.info(`Yeni firma kaydı: ${yeniFirma.firmaKodu} - ${yeniFirma.eposta}`);
    return res.status(201).json({
      success: true,
      message: 'Firma başarıyla kaydedildi',
      data: {
        firmaKodu: yeniFirma.firmaKodu,
        firmaAdi: yeniFirma.firmaAdi,
        token
      }
    });
  } catch (error) {
    logger.error(`Firma kaydı hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Firma kaydı sırasında bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * API Key görüntüleme işlemi
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const getApiKey = async (req, res) => {
  try {
    const { firmaKodu } = req.firma;

    // Firmayı bul
    const firma = await Firma.findOne({ where: { firmaKodu } });
    if (!firma) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı'
      });
    }

    // API Key yoksa oluştur
    if (!firma.apiKey) {
      firma.apiKey = firma.generateApiKey();
      await firma.save();
    }

    // Başarılı yanıt döndür
    return res.status(200).json({
      success: true,
      message: 'API Key başarıyla getirildi',
      data: {
        apiKey: firma.apiKey
      }
    });
  } catch (error) {
    logger.error(`API Key görüntüleme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'API Key görüntülenirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * API Key yenileme işlemi
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const regenerateApiKey = async (req, res) => {
  try {
    const { firmaKodu } = req.firma;

    // Firmayı bul
    const firma = await Firma.findOne({ where: { firmaKodu } });
    if (!firma) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı'
      });
    }

    // Yeni API Key oluştur
    const newApiKey = firma.generateApiKey();
    await firma.save();

    // Başarılı yanıt döndür
    logger.info(`API Key yenilendi: ${firma.firmaKodu}`);
    return res.status(200).json({
      success: true,
      message: 'API Key başarıyla yenilendi',
      data: {
        apiKey: newApiKey
      }
    });
  } catch (error) {
    logger.error(`API Key yenileme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'API Key yenilenirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  login,
  verifyAuth,
  resetPassword,
  register,
  getApiKey,
  regenerateApiKey
}; 