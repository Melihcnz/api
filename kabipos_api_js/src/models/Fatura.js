const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Firma = require('./Firma');
const { Op } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     Fatura:
 *       type: object
 *       required:
 *         - faturaNo
 *         - musteriAdi
 *         - toplamTutar
 *         - satisYapanFirma
 *       properties:
 *         id:
 *           type: integer
 *           description: Fatura ID
 *         faturaNo:
 *           type: string
 *           description: Fatura numarası
 *         musteriAdi:
 *           type: string
 *           description: Müşteri adı
 *         musteriTelefon:
 *           type: string
 *           description: Müşteri telefon numarası
 *         musteriAdres:
 *           type: string
 *           description: Müşteri adresi
 *         musteriVergiNo:
 *           type: string
 *           description: Müşteri vergi numarası
 *         musteriVergiDairesi:
 *           type: string
 *           description: Müşteri vergi dairesi
 *         siparisTarihi:
 *           type: string
 *           format: date-time
 *           description: Sipariş tarihi
 *         toplamTutar:
 *           type: number
 *           format: float
 *           description: Toplam tutar
 *         kdvTutari:
 *           type: number
 *           format: float
 *           description: KDV tutarı
 *         odemeTipi:
 *           type: string
 *           description: Ödeme tipi (Nakit, Kredi Kartı, vb.)
 *         aciklama:
 *           type: string
 *           description: Fatura açıklaması
 *         satisYapanFirma:
 *           type: string
 *           description: Satışı yapan firma kodu
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Güncellenme tarihi
 */
const Fatura = sequelize.define('Fatura', {
  faturaNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'faturaNo'
  },
  musteriAdi: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'musteriAdi'
  },
  musteriTelefon: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'musteriTelefon'
  },
  musteriAdres: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'musteriAdres'
  },
  musteriVergiNo: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'musteriVergiNo'
  },
  musteriVergiDairesi: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'musteriVergiDairesi'
  },
  siparisTarihi: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'siparisTarihi'
  },
  toplamTutar: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'toplamTutar'
  },
  kdvTutari: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'kdvTutari'
  },
  odemeTipi: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Nakit',
    field: 'odemeTipi'
  },
  aciklama: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  satisYapanFirma: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'satisYapanFirma',
    references: {
      model: Firma,
      key: 'id'
    }
  }
}, {
  tableName: 'fatura',
  underscored: false
});

// İlişkileri tanımla
Fatura.belongsTo(Firma, { foreignKey: 'satisYapanFirma', as: 'firma' });
Firma.hasMany(Fatura, { foreignKey: 'satisYapanFirma', as: 'faturalar' });

module.exports = Fatura;