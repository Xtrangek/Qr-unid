const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // Importa cors
const QRCode = require('qrcode');
const app = express();
const path = require('path');

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());  // Esta línea es necesaria para manejar el cuerpo como JSON

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
    // Consulta la base de datos para verificar si la obra de arte existe
    const result = await pool.query('SELECT * FROM artworks WHERE id = $1 AND name = $2', [artworkId, artworkName]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artwork not found in the database' });
    }

    // Si la obra de arte existe, genera el QR
    const qrData = `${process.env.BASE_URL}/artwork/${artworkId}`;
    const qrCode = await QRCode.toDataURL(qrData);

    res.status(200).json({ qrCode });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Error generating QR code' });
  }
});

app.get('/artwork/:id', async (req, res) => {
  const { id } = req.params;

  // Validar que el ID sea un número entero
  if (isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({ error: 'Invalid ID, must be a positive integer' });
  }

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
