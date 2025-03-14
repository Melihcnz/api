# Kabipos API

Kabipos Barkodlu Satış Sistemi API'si

## Render.com Kurulum Adımları

### 1. Render.com'da Yeni Web Service Oluşturma

1. [Render Dashboard](https://dashboard.render.com/)'a giriş yapın
2. "New +" butonuna tıklayın ve "Web Service" seçin
3. GitHub hesabınızı bağlayın ve bu repo'yu seçin
4. Aşağıdaki ayarları yapın:
   - **Name**: kabipos-api (veya istediğiniz bir isim)
   - **Region**: Frankfurt (EU Central) (veya size en yakın bölge)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (veya ihtiyacınıza göre)

### 2. Environment Variables (Çevre Değişkenleri)

Render.com'da "Environment" sekmesinde aşağıdaki değişkenleri ekleyin:

```
PORT=3000
NODE_ENV=production

# MySQL Veritabanı Ayarları
DB_HOST=your-mysql-host.com
DB_USER=your-mysql-username
DB_PASSWORD=your-mysql-password
DB_NAME=your-mysql-database
DB_PORT=3306

# JWT Ayarları
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# CORS Ayarları
ALLOWED_ORIGINS=https://your-frontend-app.com,http://localhost:3000
```

### 3. MySQL Veritabanı

Render.com'da MySQL veritabanı hizmeti bulunmamaktadır. Aşağıdaki seçeneklerden birini kullanabilirsiniz:

1. [PlanetScale](https://planetscale.com/) - MySQL uyumlu, serverless veritabanı (ücretsiz plan mevcut)
2. [Amazon RDS](https://aws.amazon.com/rds/mysql/) - AWS'nin yönetilen MySQL hizmeti
3. [DigitalOcean Managed Databases](https://www.digitalocean.com/products/managed-databases-mysql) - MySQL veritabanı hizmeti
4. [Railway](https://railway.app/) - MySQL veritabanı barındırma (ücretsiz plan mevcut)

## Mobil Uygulama Yapılandırması

Mobil uygulamanızda (kabipos_m) API URL'lerini Render.com'daki servis URL'si ile güncelleyin:

```javascript
// LoginScreen.js ve diğer dosyalarda
const API_URL = 'https://your-render-service-name.onrender.com/api/auth/login';
```

## API Dokümantasyonu

API dokümantasyonuna aşağıdaki URL'den erişebilirsiniz:

```
https://your-render-service-name.onrender.com/api-docs
```

## Yerel Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

## Lisans

ISC 