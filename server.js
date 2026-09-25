require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
app.use(cors());
app.use(express.json());

// Carpeta donde Multer guarda las imágenes subidas
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET: Obtener todos los productos
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Crear producto con subida de imagen
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'La imagen es obligatoria' });
    }
    const { name, price, category } = req.body;
    const image = '/uploads/' + req.file.filename;
    const { rows } = await pool.query(
      'INSERT INTO products (name, price, category, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, category, image]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Editar producto (imagen opcional)
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : req.body.existingImage;
    const { rows } = await pool.query(
      'UPDATE products SET name = $1, price = $2, category = $3, image = $4 WHERE id = $5 RETURNING *',
      [name, price, category, image, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Eliminar producto
app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
