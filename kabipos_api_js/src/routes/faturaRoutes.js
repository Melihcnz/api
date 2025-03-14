const express = require('express');
const router = express.Router();
const { 
  getFaturalar, 
  getFaturaById, 
  getFaturaByNo, 
  createFatura, 
  updateFatura, 
  deleteFatura 
} = require('../controllers/faturaController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/faturalar:
 *   get:
 *     summary: Tarih aralığına göre faturaları getirir
 *     tags: [Faturalar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: baslangicTarihi
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Başlangıç tarihi (YYYY-MM-DD)
 *       - in: query
 *         name: bitisTarihi
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Bitiş tarihi (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Faturalar başarıyla getirildi
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
 *                     $ref: '#/components/schemas/Fatura'
 *       400:
 *         description: Geçersiz tarih formatı
 *       401:
 *         description: Kimlik doğrulama hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', authenticate, apiLimiter, getFaturalar);

/**
 * @swagger
 * /api/faturalar/{id}:
 *   get:
 *     summary: ID'ye göre fatura getirir
 *     tags: [Faturalar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fatura ID
 *     responses:
 *       200:
 *         description: Fatura başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Fatura'
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Fatura bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', authenticate, apiLimiter, getFaturaById);

/**
 * @swagger
 * /api/faturalar/no/{faturaNo}:
 *   get:
 *     summary: Fatura numarasına göre fatura getirir
 *     tags: [Faturalar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: faturaNo
 *         required: true
 *         schema:
 *           type: string
 *         description: Fatura numarası
 *     responses:
 *       200:
 *         description: Fatura başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Fatura'
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Fatura bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/no/:faturaNo', authenticate, apiLimiter, getFaturaByNo);

/**
 * @swagger
 * /api/faturalar:
 *   post:
 *     summary: Yeni fatura ekler
 *     tags: [Faturalar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - faturaNo
 *               - musteriAdi
 *               - toplamTutar
 *             properties:
 *               faturaNo:
 *                 type: string
 *                 example: "F2023001"
 *               musteriAdi:
 *                 type: string
 *                 example: "Örnek Müşteri"
 *               musteriTelefon:
 *                 type: string
 *                 example: "05551234567"
 *               musteriAdres:
 *                 type: string
 *                 example: "Örnek Adres"
 *               musteriVergiNo:
 *                 type: string
 *                 example: "1234567890"
 *               musteriVergiDairesi:
 *                 type: string
 *                 example: "Örnek Vergi Dairesi"
 *               siparisTarihi:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-01T10:00:00Z"
 *               toplamTutar:
 *                 type: number
 *                 format: float
 *                 example: 299.99
 *               kdvTutari:
 *                 type: number
 *                 format: float
 *                 example: 54.00
 *               odemeTipi:
 *                 type: string
 *                 example: "Kredi Kartı"
 *               aciklama:
 *                 type: string
 *                 example: "Fatura açıklaması"
 *     responses:
 *       201:
 *         description: Fatura başarıyla eklendi
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
 *                   example: "Fatura başarıyla eklendi"
 *                 data:
 *                   $ref: '#/components/schemas/Fatura'
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Kimlik doğrulama hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', authenticate, apiLimiter, createFatura);

/**
 * @swagger
 * /api/faturalar/{id}:
 *   put:
 *     summary: Fatura günceller
 *     tags: [Faturalar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fatura ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               faturaNo:
 *                 type: string
 *                 example: "F2023001-A"
 *               musteriAdi:
 *                 type: string
 *                 example: "Güncellenmiş Müşteri"
 *               musteriTelefon:
 *                 type: string
 *                 example: "05559876543"
 *               musteriAdres:
 *                 type: string
 *                 example: "Güncellenmiş Adres"
 *               musteriVergiNo:
 *                 type: string
 *                 example: "9876543210"
 *               musteriVergiDairesi:
 *                 type: string
 *                 example: "Güncellenmiş Vergi Dairesi"
 *               siparisTarihi:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-02T11:00:00Z"
 *               toplamTutar:
 *                 type: number
 *                 format: float
 *                 example: 399.99
 *               kdvTutari:
 *                 type: number
 *                 format: float
 *                 example: 72.00
 *               odemeTipi:
 *                 type: string
 *                 example: "Nakit"
 *               aciklama:
 *                 type: string
 *                 example: "Güncellenmiş açıklama"
 *     responses:
 *       200:
 *         description: Fatura başarıyla güncellendi
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
 *                   example: "Fatura başarıyla güncellendi"
 *                 data:
 *                   $ref: '#/components/schemas/Fatura'
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Fatura bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:id', authenticate, apiLimiter, updateFatura);

/**
 * @swagger
 * /api/faturalar/{id}:
 *   delete:
 *     summary: Fatura siler
 *     tags: [Faturalar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fatura ID
 *     responses:
 *       200:
 *         description: Fatura başarıyla silindi
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
 *                   example: "Fatura başarıyla silindi"
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Fatura bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:id', authenticate, apiLimiter, deleteFatura);

module.exports = router; 