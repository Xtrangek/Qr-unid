const QRCode = require('qrcode');

// Función para generar el QR
const generateQRCode = (text) => {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(text, (err, qrCodeUrl) => {
      if (err) reject(err);
      resolve(qrCodeUrl);
    });
  });
};

module.exports = generateQRCode;
