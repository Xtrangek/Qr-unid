const express = require('express');
const cors = require('cors');
const path = require('path');

const QRCode = require('qrcode');
const app = express();

// Configuración CORS y middleware para parsear JSON
app.use(cors());
app.use(express.json());
app.use(express.static('frontend/public'));

const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    user: 'postgres', // Reemplaza con tu usuario de PostgreSQL
    host: 'autorack.proxy.rlwy.net', // Cambia según tu entorno
    database: 'railway', // Reemplaza con el nombre de tu base de datos
    password: 'tZlFyDJwvMuPhNrcvWwBizsBZowpmUmC', // Reemplaza con la contraseña de tu usuario
    port: 58269, // Cambia si usas un puerto diferente
    ssl: { rejectUnauthorized: false }, // Usa SSL solo si es necesario
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Error connecting to PostgreSQL', err));

// Ruta para generar el QR y devolverlo al frontend
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
    const url = `https://qr-unid-production.up.railway.app/artwork/${artworkId}`;

    try {
      const qrCodeUrl = await QRCode.toDataURL(url);
      res.json({ qrCodeUrl, artwork });
    } catch (err) {
      console.error('Error generating QR code:', err);
      res.status(500).json({ error: 'Error generating QR code' });
    }

  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Ruta para obtener la información de la obra de arte por ID
// Ruta para obtener la información de la obra de arte por ID y renderizar HTML
// Ruta para obtener la información de la obra de arte por ID y renderizar HTML
app.get('/artwork/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM artworks WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      const artwork = result.rows[0];

      // Responder con HTML que muestra los detalles de la obra y estilos CSS
      res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Detalle de la Obra: ${artwork.name}</title>
          <style>
            body {
                  background-color: #F5F5F5; /* Blanco hueso */
                  color: #333; /* Texto oscuro para contraste */
                  font-family: 'Open Sans', sans-serif;
                  margin: 0;
                  padding: 0;
            }
            header {
              background-color: #D8E2DC; /* Azul suave */
              text-align: center;
              padding: 20px;
              font-family: 'Playfair Display', serif;
            }
            h1 {
              font-size: 2em;
              margin-bottom: 10px;
            }
            p {
              font-size: 1.1em;
              line-height: 1.5;
              margin-bottom: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 20 auto;
              border-radius: 8px;
            }
            .container {
              max-width: 900px;
              margin: 0 auto;
              padding: 20px;
              background-color: #FAF3E0;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              margin-top: 20px;
            }
            @media (max-width: 600px) {
              h1 {
                font-size: 1.8em;
              }
              p {
                font-size: 1em;
              }
            }
          </style>
        </head>
        <body>
          <header>
            <h1>${artwork.name}</h1>
          </header>
          <div class="container">
            <p><strong>Descripción:</strong> ${artwork.description}</p>
            <p><strong>Autor:</strong> ${artwork.autor}</p>
            <img src="${artwork.image_url}" alt="${artwork.name}">
          </div>
        </body>
        </html>
      `);
    } else {
      res.status(404).send('<h1>Obra no encontrada</h1>');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('<h1>Error interno del servidor</h1>');
  }
});


// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on https://qr-unid-production.up.railway.app:${PORT}`);
});
