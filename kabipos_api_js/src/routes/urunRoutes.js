const express = require('express');
const router = express.Router();
const { 
  getUrunler, 
  getUrunById, 
  getUrunByBarkod, 
  createUrun, 
  updateUrun, 
  deleteUrun 
} = require('../controllers/urunController');
const { authenticate, authenticateApiKey } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { Urun } = require('../models');

/**
 * @swagger
 * /api/urunler/api-key:
 *   get:
 *     summary: API Key ile tüm ürünleri getirir
 *     tags: [Urunler]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *         description: API Key
 *     responses:
 *       200:
 *         description: Ürünler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Urun'
 *       401:
 *         description: Geçersiz API Key
 *       500:
 *         description: Sunucu hatası
 */
router.get('/api-key', authenticateApiKey, getUrunler);

/**
 * @swagger
 * /api/urunler/barkod/{barkod}:
 *   get:
 *     summary: Barkod'a göre ürün getirir
 *     tags: [Urunler]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barkod
 *         required: true
 *         schema:
 *           type: string
 *         description: Ürün barkodu
 *     responses:
 *       200:
 *         description: Ürün başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Urun'
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Ürün bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/barkod/:barkod', authenticate, apiLimiter, getUrunByBarkod);

/**
 * @swagger
 * /api/urunler:
 *   get:
 *     summary: Firma ürünlerini getirir
 *     tags: [Urunler]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: firmaKodu
 *         required: true
 *         schema:
 *           type: string
 *         description: Firma kodu
 *     responses:
 *       200:
 *         description: Ürünler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Ürünler başarıyla getirildi
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       barkod:
 *                         type: string
 *                       urunAdi:
 *                         type: string
 *                       aciklama:
 *                         type: string
 *                       fiyat:
 *                         type: number
 *                       stokMiktari:
 *                         type: integer
 *                       kategori:
 *                         type: string
 *                       birim:
 *                         type: string
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { firmaKodu } = req.query;

    if (!firmaKodu) {
      return res.status(400).json({
        success: false,
        message: 'Firma kodu gereklidir'
      });
    }

    const urunler = await Urun.findAll({
      where: { islemYapanFirma: firmaKodu },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Ürünler başarıyla getirildi',
      data: urunler
    });
  } catch (error) {
    console.error('Ürün getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Ürünler getirilirken bir hata oluştu',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/urunler/{id}:
 *   get:
 *     summary: ID'ye göre ürün getirir
 *     tags: [Urunler]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ürün ID
 *     responses:
 *       200:
 *         description: Ürün başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Urun'
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Ürün bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', authenticate, apiLimiter, getUrunById);

/**
 * @swagger
 * /api/urunler:
 *   post:
 *     summary: Yeni ürün ekler
 *     tags: [Urunler]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - barkod
 *               - urunAdi
 *               - fiyat
 *             properties:
 *               barkod:
 *                 type: string
 *                 example: "8690123456789"
 *               urunAdi:
 *                 type: string
 *                 example: "Örnek Ürün"
 *               aciklama:
 *                 type: string
 *                 example: "Ürün açıklaması"
 *               fiyat:
 *                 type: number
 *                 format: float
 *                 example: 29.99
 *               stokMiktari:
 *                 type: integer
 *                 example: 100
 *               kategori:
 *                 type: string
 *                 example: "Elektronik"
 *               birim:
 *                 type: string
 *                 example: "Adet"
 *     responses:
 *       201:
 *         description: Ürün başarıyla eklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ürün başarıyla eklendi"
 *                 data:
 *                   $ref: '#/components/schemas/Urun'
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Kimlik doğrulama hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', authenticate, apiLimiter, createUrun);

/**
 * @swagger
 * /api/urunler/{id}:
 *   put:
 *     summary: Ürün günceller
 *     tags: [Urunler]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ürün ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               barkod:
 *                 type: string
 *                 example: "8690123456789"
 *               urunAdi:
 *                 type: string
 *                 example: "Güncellenmiş Ürün"
 *               aciklama:
 *                 type: string
 *                 example: "Güncellenmiş açıklama"
 *               fiyat:
 *                 type: number
 *                 format: float
 *                 example: 39.99
 *               stokMiktari:
 *                 type: integer
 *                 example: 150
 *               kategori:
 *                 type: string
 *                 example: "Elektronik"
 *               birim:
 *                 type: string
 *                 example: "Adet"
 *     responses:
 *       200:
 *         description: Ürün başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ürün başarıyla güncellendi"
 *                 data:
 *                   $ref: '#/components/schemas/Urun'
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Ürün bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:id', authenticate, apiLimiter, updateUrun);

/**
 * @swagger
 * /api/urunler/{id}:
 *   delete:
 *     summary: Ürün siler
 *     tags: [Urunler]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ürün ID
 *     responses:
 *       200:
 *         description: Ürün başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ürün başarıyla silindi"
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Ürün bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:id', authenticate, apiLimiter, deleteUrun);

module.exports = router; 