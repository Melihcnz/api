const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Firma = require('./Firma');
const { Op } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     Urun:
 *       type: object
 *       required:
 *         - barkod
 *         - urunAdi
 *         - fiyat
 *         - islemYapanFirma
 *       properties:
 *         id:
 *           type: integer
 *           description: Ürün ID
 *         barkod:
 *           type: string
 *           description: Ürün barkodu
 *         urunAdi:
 *           type: string
 *           description: Ürün adı
 *         aciklama:
 *           type: string
 *           description: Ürün açıklaması
 *         fiyat:
 *           type: number
 *           format: float
 *           description: Ürün fiyatı
 *         stokMiktari:
 *           type: integer
 *           description: Stok miktarı
 *         kategori:
 *           type: string
 *           description: Ürün kategorisi
 *         birim:
 *           type: string
 *           description: Ürün birimi (adet, kg, lt vb.)
 *         islemYapanFirma:
 *           type: string
 *           description: Ürünü ekleyen firma kodu
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Güncellenme tarihi
 */
const Urun = sequelize.define('Urun', {
  barkod: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  urunAdi: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'urunAdi'
  },
  aciklama: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fiyat: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stokMiktari: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'stokMiktari'
  },
  kategori: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  birim: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'Adet'
  },
  islemYapanFirma: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'islemYapanFirma',
    references: {
      model: Firma,
      key: 'id'
    }
  }
}, {
  tableName: 'urunler',
  underscored: false
});

// İlişkileri tanımla
Urun.belongsTo(Firma, { foreignKey: 'islemYapanFirma', as: 'firma' });
Firma.hasMany(Urun, { foreignKey: 'islemYapanFirma', as: 'urunler' });

module.exports = Urun;