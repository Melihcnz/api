const express = require('express');
const router = express.Router();
const { login, verifyAuth, resetPassword, register, getApiKey, regenerateApiKey } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Firma girişi yapar
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eposta
 *               - parola
 *             properties:
 *               eposta:
 *                 type: string
 *                 format: email
 *                 description: Firma e-posta adresi
 *               parola:
 *                 type: string
 *                 format: password
 *                 description: Firma parolası
 *     responses:
 *       200:
 *         description: Giriş başarılı
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
 *                   example: Giriş başarılı
 *                 data:
 *                   type: object
 *                   properties:
 *                     firmaKodu:
 *                       type: string
 *                       example: ABC123
 *                     firmaAdi:
 *                       type: string
 *                       example: Örnek Firma
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Kimlik doğrulama hatası
 *       403:
 *         description: Firma hesabı aktif değil
 *       500:
 *         description: Sunucu hatası
 */
router.post('/login', loginLimiter, login);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Token doğrulama
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token geçerli
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
 *                   example: Token geçerli
 *                 data:
 *                   type: object
 *                   properties:
 *                     firma:
 *                       type: object
 *                       properties:
 *                         firmaKodu:
 *                           type: string
 *                           example: ABC123
 *                         firmaAdi:
 *                           type: string
 *                           example: Örnek Firma
 *                         eposta:
 *                           type: string
 *                           example: ornek@firma.com
 *       401:
 *         description: Geçersiz token
 *       500:
 *         description: Sunucu hatası
 */
router.get('/verify', authenticate, verifyAuth);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Firma şifresini günceller (GEÇİCİ)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eposta
 *               - yeniParola
 *             properties:
 *               eposta:
 *                 type: string
 *                 format: email
 *                 description: Firma e-posta adresi
 *               yeniParola:
 *                 type: string
 *                 format: password
 *                 description: Yeni firma parolası
 *     responses:
 *       200:
 *         description: Şifre başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       404:
 *         description: Firma bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni firma kaydı yapar (GEÇİCİ)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firmaKodu
 *               - firmaAdi
 *               - eposta
 *               - parola
 *             properties:
 *               firmaKodu:
 *                 type: string
 *                 description: Firma kodu
 *               firmaAdi:
 *                 type: string
 *                 description: Firma adı
 *               eposta:
 *                 type: string
 *                 format: email
 *                 description: Firma e-posta adresi
 *               parola:
 *                 type: string
 *                 format: password
 *                 description: Firma parolası
 *     responses:
 *       201:
 *         description: Firma başarıyla kaydedildi
 *       400:
 *         description: Geçersiz istek veya e-posta adresi zaten kullanılıyor
 *       500:
 *         description: Sunucu hatası
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/api-key:
 *   get:
 *     summary: API Key görüntüler
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API Key başarıyla getirildi
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
 *                   example: API Key başarıyla getirildi
 *                 data:
 *                   type: object
 *                   properties:
 *                     apiKey:
 *                       type: string
 *                       example: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Firma bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/api-key', authenticate, getApiKey);

/**
 * @swagger
 * /api/auth/api-key/regenerate:
 *   post:
 *     summary: API Key yeniler
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API Key başarıyla yenilendi
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
 *                   example: API Key başarıyla yenilendi
 *                 data:
 *                   type: object
 *                   properties:
 *                     apiKey:
 *                       type: string
 *                       example: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
 *       401:
 *         description: Kimlik doğrulama hatası
 *       404:
 *         description: Firma bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/api-key/regenerate', authenticate, regenerateApiKey);

module.exports = router; 