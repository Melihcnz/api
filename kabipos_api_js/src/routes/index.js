const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const urunRoutes = require('./urunRoutes');
const faturaRoutes = require('./faturaRoutes');

// API route'larını tanımla
router.use('/auth', authRoutes);
router.use('/urunler', urunRoutes);
router.use('/faturalar', faturaRoutes);

// Ana route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Kabipos API çalışıyor',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

module.exports = router; 