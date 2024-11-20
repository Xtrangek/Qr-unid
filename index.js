const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const QRCode = require('qrcode');
const app = express();

require('dotenv').config();  // Asegúrate de cargar las variables de entorno

const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL; // Usa la variable de entorno DATABASE_URL

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Necesario si tu base de datos requiere SSL
  }
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Error connecting to PostgreSQL', err));
  
// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Ruta raíz para verificar el servidor
app.get('/', (req, res) => {
  res.send('Backend for QR Gallery Project is running!');
});

// Generar códigos QR
app.post('/generate-qr', async (req, res) => {
  const { artworkId, artworkName } = req.body;

  if (!artworkId || !artworkName) {
    return res.status(400).json({ error: 'Artwork ID and name are required' });
  }

  try {
    // Genera la URL del QR basada en el ID
    const qrData = `${process.env.BASE_URL}/artwork/${artworkId}`;
    const qrCode = await QRCode.toDataURL(qrData);

    res.status(200).json({ qrCode });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Error generating QR code' });
  }
});

// Obtener datos de una obra de arte
app.get('/artwork/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM artworks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({ error: 'Error fetching artwork' });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
