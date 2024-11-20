const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const QRCode = require('qrcode');
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static('frontend/public'));

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

  app.post('/generateQR', async (req, res) => {
    const { artworkId } = req.body;
  
    if (!artworkId) {
      return res.status(400).json({ error: 'Artwork ID is required' });
    }
  
    try {
      // Consultar la base de datos para obtener la obra
      const result = await pool.query('SELECT * FROM artworks WHERE id = $1', [artworkId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Artwork not found' });
      }
  
      const artwork = result.rows[0];
      const url = `https://yourdomain.com/display.html?id=${artwork.id}`;
  
      // Generar el QR
      QRCode.toDataURL(url, (err, qrCodeUrl) => {
        if (err) {
          return res.status(500).json({ error: 'Error generating QR code' });
        }
        res.json({ qrCodeUrl, artwork });
      });
  
    } catch (error) {
      console.error('Error fetching artwork:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Ruta para obtener la información de la obra de arte por ID
  app.get('/artwork/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('SELECT * FROM artworks WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'Artwork not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Iniciar el servidor
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });