const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarıyla kuruldu.');
  } catch (error) {
    console.error('Veritabanına bağlanılamadı:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection }; 