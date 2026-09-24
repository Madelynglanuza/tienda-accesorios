const { Pool } = require('pg');

const pool = new Pool({
  user: 'umcqoky9renenjdeyox1',
  host: 'bzxckpsolzkbqyngc3mw-postgresql.services.clever-cloud.com',
  database: 'bzxckpsolzkbqyngc3mw',
  password: 'gwx7hiNbGgudu0GShS0Qy60Xe9ZUhW',
  port: 50013,
});

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        image TEXT,
        category VARCHAR(50),
        price NUMERIC(10,2)
      );
    `);
    console.log('✔ Tabla "products" creada');

    await pool.query(`
      INSERT INTO products (name, image, category, price) VALUES
      ('Collar de cadena delgada', 'https://ejemplo.com/collar1.jpg', 'Joyería y Bisutería', 15.00),
      ('Gargantilla choker', 'https://ejemplo.com/choker.jpg', 'Joyería y Bisutería', 12.50),
      ('Arracadas de aro', 'https://ejemplo.com/arracadas.jpg', 'Joyería y Bisutería', 8.00),
      ('Bolso de mano tote', 'https://ejemplo.com/tote.jpg', 'Bolsos y Marroquinería', 35.00),
      ('Lentes de sol aviador', 'https://ejemplo.com/lentes.jpg', 'Complementos de Estilo', 20.00),
      ('Scrunchies de satín (x3)', 'https://ejemplo.com/scrunchies.jpg', 'Accesorios para el Cabello', 7.00);
    `);
    console.log('✔ Productos insertados');

    const res = await pool.query('SELECT * FROM products');
    console.log('Productos en la base:', res.rows);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

setup();