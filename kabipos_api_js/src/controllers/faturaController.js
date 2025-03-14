const { Fatura } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

/**
 * Tarih aralığına göre faturaları getir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const getFaturalar = async (req, res) => {
  try {
    const { firmaKodu } = req.firma;
    const { baslangicTarihi, bitisTarihi } = req.query;

    // Tarih aralığı kontrolü
    if (!baslangicTarihi || !bitisTarihi) {
      return res.status(400).json({
        success: false,
        message: 'Başlangıç ve bitiş tarihleri gereklidir'
      });
    }

    // Tarih formatı kontrolü
    const baslangic = new Date(baslangicTarihi);
    const bitis = new Date(bitisTarihi);

    if (isNaN(baslangic.getTime()) || isNaN(bitis.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz tarih formatı. YYYY-MM-DD formatında olmalıdır'
      });
    }

    // Bitiş tarihine 1 gün ekle (gün sonuna kadar dahil etmek için)
    bitis.setDate(bitis.getDate() + 1);

    // Faturaları sorgula
    const faturalar = await Fatura.findAll({
      where: {
        satisYapanFirma: firmaKodu,
        siparisTarihi: {
          [Op.between]: [baslangic, bitis]
        }
      },
      order: [['siparisTarihi', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: faturalar.length,
      data: faturalar
    });
  } catch (error) {
    logger.error(`Fatura listeleme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Faturalar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Tek bir fatura getir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const getFaturaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { firmaKodu } = req.firma;

    const fatura = await Fatura.findOne({
      where: {
        id,
        satisYapanFirma: firmaKodu
      }
    });

    if (!fatura) {
      return res.status(404).json({
        success: false,
        message: 'Fatura bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      data: fatura
    });
  } catch (error) {
    logger.error(`Fatura getirme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Fatura getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Fatura numarasına göre fatura getir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const getFaturaByNo = async (req, res) => {
  try {
    const { faturaNo } = req.params;
    const { firmaKodu } = req.firma;

    const fatura = await Fatura.findOne({
      where: {
        faturaNo,
        satisYapanFirma: firmaKodu
      }
    });

    if (!fatura) {
      return res.status(404).json({
        success: false,
        message: 'Fatura bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      data: fatura
    });
  } catch (error) {
    logger.error(`Fatura numarası ile getirme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Fatura getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Yeni fatura ekle
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const createFatura = async (req, res) => {
  try {
    const { firmaKodu } = req.firma;
    const faturaData = { ...req.body, satisYapanFirma: firmaKodu };

    // Gerekli alanları kontrol et
    if (!faturaData.faturaNo || !faturaData.musteriAdi || !faturaData.toplamTutar) {
      return res.status(400).json({
        success: false,
        message: 'Fatura numarası, müşteri adı ve toplam tutar alanları zorunludur'
      });
    }

    // Fatura numarası benzersiz mi kontrol et
    const existingFatura = await Fatura.findOne({
      where: {
        faturaNo: faturaData.faturaNo,
        satisYapanFirma: firmaKodu
      }
    });

    if (existingFatura) {
      return res.status(400).json({
        success: false,
        message: 'Bu fatura numarası ile zaten bir fatura kayıtlı'
      });
    }

    // Yeni fatura oluştur
    const fatura = await Fatura.create(faturaData);

    logger.info(`Yeni fatura eklendi: ${fatura.id} - ${fatura.faturaNo} - Firma: ${firmaKodu}`);
    return res.status(201).json({
      success: true,
      message: 'Fatura başarıyla eklendi',
      data: fatura
    });
  } catch (error) {
    logger.error(`Fatura ekleme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Fatura eklenirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Fatura güncelle
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const updateFatura = async (req, res) => {
  try {
    const { id } = req.params;
    const { firmaKodu } = req.firma;
    const updateData = req.body;

    // Faturayı bul
    const fatura = await Fatura.findOne({
      where: {
        id,
        satisYapanFirma: firmaKodu
      }
    });

    if (!fatura) {
      return res.status(404).json({
        success: false,
        message: 'Fatura bulunamadı'
      });
    }

    // Fatura numarası değiştiriliyorsa benzersiz mi kontrol et
    if (updateData.faturaNo && updateData.faturaNo !== fatura.faturaNo) {
      const existingFatura = await Fatura.findOne({
        where: {
          faturaNo: updateData.faturaNo,
          satisYapanFirma: firmaKodu,
          id: { [Op.ne]: id }
        }
      });

      if (existingFatura) {
        return res.status(400).json({
          success: false,
          message: 'Bu fatura numarası ile zaten bir fatura kayıtlı'
        });
      }
    }

    // Faturayı güncelle
    await fatura.update(updateData);

    logger.info(`Fatura güncellendi: ${fatura.id} - ${fatura.faturaNo} - Firma: ${firmaKodu}`);
    return res.status(200).json({
      success: true,
      message: 'Fatura başarıyla güncellendi',
      data: fatura
    });
  } catch (error) {
    logger.error(`Fatura güncelleme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Fatura güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Fatura sil
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const deleteFatura = async (req, res) => {
  try {
    const { id } = req.params;
    const { firmaKodu } = req.firma;

    // Faturayı bul
    const fatura = await Fatura.findOne({
      where: {
        id,
        satisYapanFirma: firmaKodu
      }
    });

    if (!fatura) {
      return res.status(404).json({
        success: false,
        message: 'Fatura bulunamadı'
      });
    }

    // Faturayı sil
    await fatura.destroy();

    logger.info(`Fatura silindi: ${id} - Firma: ${firmaKodu}`);
    return res.status(200).json({
      success: true,
      message: 'Fatura başarıyla silindi'
    });
  } catch (error) {
    logger.error(`Fatura silme hatası: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Fatura silinirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getFaturalar,
  getFaturaById,
  getFaturaByNo,
  createFatura,
  updateFatura,
  deleteFatura
}; 