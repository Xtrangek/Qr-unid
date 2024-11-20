const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // Importa cors
const QRCode = require('qrcode');
const app = express();

require('dotenv').config();

const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Error connecting to PostgreSQL', err));

// Habilitar CORS para que tu frontend pueda hacer solicitudes
const corsOptions = {
  origin: '*',  // Permite solicitudes solo desde este dominio
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));  // Usa cors con la configuración

// Resto del código para las rutas y el servidor

const PORT = process.env.PORT || 3000;

// Ruta para generar el QR
app.post('/generate-qr', async (req, res) => {
  const { artworkId, artworkName } = req.body;

  if (!artworkId || !artworkName) {
    return res.status(400).json({ error: 'Artwork ID and name are required' });
  }

  try {
    const qrData = `${process.env.BASE_URL}/artwork/${artworkId}`;
    const qrCode = await QRCode.toDataURL(qrData);

    res.status(200).json({ qrCode });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Error generating QR code' });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
