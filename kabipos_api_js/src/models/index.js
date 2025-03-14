const Firma = require('./Firma');
const Urun = require('./Urun');
const Fatura = require('./Fatura');

// İlişkileri burada da tanımlayabiliriz, ancak her model dosyasında zaten tanımladık
// Bu dosya, tüm modelleri tek bir yerden dışa aktarmak için kullanılır

module.exports = {
  Firma,
  Urun,
  Fatura
}; 