const { Urun, Firma } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

/**
 * Tüm ürünleri getir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const getUrunler = async (req, res) => {
  try {
    // Firma bilgilerini al
    const { firmaKodu } = req.firma;
    
    // Debug için firma bilgilerini logla
    console.log('Firma bilgileri:', req.firma);
    console.log('Firma kodu:', firmaKodu);

    // Ürünleri firma kodu ile sorgula (islemYapanFirma alanı firma kodu olarak kullanılıyor)
    const urunler = await Urun.findAll({
      where: { islemYapanFirma: firmaKodu },
      order: [['createdAt', 'DESC']]
    });
    
    // Debug için ürün sayısını logla
    console.log('Ürün sayısı:', urunler.length);

    return res.status(200).json({
      success: true,
      count: urunler.length,
      data: urunler
    });
  } catch (error) {
    logger.error(`Ürün listeleme hatası: ${error.message}`);
    console.error('Hata:', error);
    return res.status(500).json({
      success: false,
      message: 'Ürünler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Tek bir ürün getir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const getUrunById = async (req, res) => {
  try {
    const { id } = req.params;
    const { firmaKodu } = req.firma;

    // Önce firma ID'sini bul
    const firma = await Firma.findOne({ where: { firmaKodu } });
    
    if (!firma) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı'
      });
    }

    const urun = await Urun.findOne({
      where: {
        id,
        islemYapanFirma: firma.id
      }
    });

    if (!urun) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      data: urun
    });
  } catch (error) {
    logger.error(`Ürün getirme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Ürün getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Barkod ile ürün getir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const getUrunByBarkod = async (req, res) => {
  try {
    const { barkod } = req.params;
    const { firmaKodu } = req.firma;

    // Önce firma ID'sini bul
    const firma = await Firma.findOne({ where: { firmaKodu } });
    
    if (!firma) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı'
      });
    }

    const urun = await Urun.findOne({
      where: {
        barkod,
        islemYapanFirma: firma.id
      }
    });

    if (!urun) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      data: urun
    });
  } catch (error) {
    logger.error(`Barkod ile ürün getirme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Ürün getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Yeni ürün ekle
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const createUrun = async (req, res) => {
  try {
    const { firmaKodu } = req.firma;
    
    // Önce firma ID'sini bul
    const firma = await Firma.findOne({ where: { firmaKodu } });
    
    if (!firma) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı'
      });
    }
    
    const urunData = { ...req.body, islemYapanFirma: firma.id };

    // Gerekli alanları kontrol et
    if (!urunData.barkod || !urunData.urunAdi || !urunData.fiyat) {
      return res.status(400).json({
        success: false,
        message: 'Barkod, ürün adı ve fiyat alanları zorunludur'
      });
    }

    // Barkod benzersiz mi kontrol et
    const existingUrun = await Urun.findOne({
      where: {
        barkod: urunData.barkod,
        islemYapanFirma: firma.id
      }
    });

    if (existingUrun) {
      return res.status(400).json({
        success: false,
        message: 'Bu barkod numarası ile zaten bir ürün kayıtlı'
      });
    }

    // Yeni ürün oluştur
    const urun = await Urun.create(urunData);

    logger.info(`Yeni ürün eklendi: ${urun.id} - ${urun.urunAdi} - Firma: ${firmaKodu}`);
    return res.status(201).json({
      success: true,
      message: 'Ürün başarıyla eklendi',
      data: urun
    });
  } catch (error) {
    logger.error(`Ürün ekleme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Ürün eklenirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Ürün güncelle
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const updateUrun = async (req, res) => {
  try {
    const { id } = req.params;
    const { firmaKodu } = req.firma;
    const updateData = req.body;

    // Önce firma ID'sini bul
    const firma = await Firma.findOne({ where: { firmaKodu } });
    
    if (!firma) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı'
      });
    }

    // Ürünü bul
    const urun = await Urun.findOne({
      where: {
        id,
        islemYapanFirma: firma.id
      }
    });

    if (!urun) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Barkod değiştiriliyorsa benzersiz mi kontrol et
    if (updateData.barkod && updateData.barkod !== urun.barkod) {
      const existingUrun = await Urun.findOne({
        where: {
          barkod: updateData.barkod,
          islemYapanFirma: firma.id,
          id: { [Op.ne]: id }
        }
      });

      if (existingUrun) {
        return res.status(400).json({
          success: false,
          message: 'Bu barkod numarası ile zaten bir ürün kayıtlı'
        });
      }
    }

    // Ürünü güncelle
    await urun.update(updateData);

    logger.info(`Ürün güncellendi: ${urun.id} - ${urun.urunAdi} - Firma: ${firmaKodu}`);
    return res.status(200).json({
      success: true,
      message: 'Ürün başarıyla güncellendi',
      data: urun
    });
  } catch (error) {
    logger.error(`Ürün güncelleme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Ürün güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Ürün sil
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const deleteUrun = async (req, res) => {
  try {
    const { id } = req.params;
    const { firmaKodu } = req.firma;

    // Önce firma ID'sini bul
    const firma = await Firma.findOne({ where: { firmaKodu } });
    
    if (!firma) {
      return res.status(404).json({
        success: false,
        message: 'Firma bulunamadı'
      });
    }

    // Ürünü bul
    const urun = await Urun.findOne({
      where: {
        id,
        islemYapanFirma: firma.id
      }
    });

    if (!urun) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    // Ürünü sil
    await urun.destroy();

    logger.info(`Ürün silindi: ${id} - Firma: ${firmaKodu}`);
    return res.status(200).json({
      success: true,
      message: 'Ürün başarıyla silindi'
    });
  } catch (error) {
    logger.error(`Ürün silme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Ürün silinirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getUrunler,
  getUrunById,
  getUrunByBarkod,
  createUrun,
  updateUrun,
  deleteUrun
}; 