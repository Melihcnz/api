const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * @swagger
 * components:
 *   schemas:
 *     Firma:
 *       type: object
 *       required:
 *         - firmaKodu
 *         - firmaAdi
 *         - eposta
 *         - parola
 *       properties:
 *         id:
 *           type: integer
 *           description: Firma ID
 *         firmaKodu:
 *           type: string
 *           description: Firma kodu
 *         firmaAdi:
 *           type: string
 *           description: Firma adı
 *         eposta:
 *           type: string
 *           format: email
 *           description: Firma e-posta adresi
 *         parola:
 *           type: string
 *           format: password
 *           description: Firma parolası (hash'lenmiş)
 *         apiKey:
 *           type: string
 *           description: API erişim anahtarı
 *         telefon:
 *           type: string
 *           description: Firma telefon numarası
 *         adres:
 *           type: string
 *           description: Firma adresi
 *         vergiDairesi:
 *           type: string
 *           description: Firma vergi dairesi
 *         vergiNo:
 *           type: string
 *           description: Firma vergi numarası
 *         aktif:
 *           type: boolean
 *           description: Firma aktiflik durumu
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Güncellenme tarihi
 */
const Firma = sequelize.define('Firma', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  firmaKodu: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'firmaKodu'
  },
  firmaAdi: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'firmaAdi'
  },
  eposta: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  parola: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apiKey: {
    type: DataTypes.STRING(64),
    allowNull: true,
    unique: true
  },
  telefon: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  adres: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vergiDairesi: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'vergiDairesi'
  },
  vergiNo: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'vergiNo'
  },
  aktif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'kabisoftfirmalar',
  underscored: false,
  hooks: {
    beforeCreate: async (firma) => {
      if (firma.parola) {
        firma.parola = await bcrypt.hash(firma.parola, 10);
      }
      
      // API Key oluştur
      if (!firma.apiKey) {
        firma.apiKey = crypto.randomBytes(32).toString('hex');
      }
    },
    beforeUpdate: async (firma) => {
      if (firma.changed('parola')) {
        firma.parola = await bcrypt.hash(firma.parola, 10);
      }
    }
  }
});

// Şifre doğrulama metodu
Firma.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.parola);
};

// API Key oluşturma metodu
Firma.prototype.generateApiKey = function() {
  const apiKey = crypto.randomBytes(32).toString('hex');
  this.apiKey = apiKey;
  return apiKey;
};

module.exports = Firma; 