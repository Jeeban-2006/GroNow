/**
 * Blinkit Dataset Seeder
 * Seeds categories, products and inventory for ALL active stores
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'bbsr_grocery',
  user: 'postgres',
  password: 'qwertyui'
});

async function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    // Handle quoted commas
    const values = [];
    let cur = '';
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') inQuote = !inQuote;
      else if (ch === ',' && !inQuote) { values.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    values.push(cur.trim());
    return Object.fromEntries(headers.map((h, i) => [h.trim(), values[i] || '']));
  });
}

async function seed() {
  const csvPath = path.join(__dirname, '..', 'blinkit_dataset.csv');
  const rows = await parseCsv(csvPath);
  console.log(`📊 Loaded ${rows.length} rows from dataset`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get all stores to distribute inventory
    const storesRes = await client.query('SELECT store_id, shop_name FROM stores');
    const stores = storesRes.rows;
    console.log(`🏪 Found ${stores.length} stores: ${stores.map(s => s.shop_name).join(', ')}`);

    // 2. Extract unique categories from dataset
    const uniqueCategories = [...new Set(rows.map(r => r.category).filter(Boolean))];
    console.log(`📂 Found ${uniqueCategories.length} unique categories:`, uniqueCategories.join(', '));

    // 3. Insert or get categories
    const categoryMap = {}; // name -> id
    for (const catName of uniqueCategories) {
      const existing = await client.query(
        'SELECT category_id FROM categories WHERE LOWER(category_name) = LOWER($1)',
        [catName]
      );
      if (existing.rows.length > 0) {
        categoryMap[catName] = existing.rows[0].category_id;
      } else {
        const inserted = await client.query(
          'INSERT INTO categories (category_name, is_active) VALUES ($1, true) RETURNING category_id',
          [catName]
        );
        categoryMap[catName] = inserted.rows[0].category_id;
        console.log(`  ✅ Created category: ${catName}`);
      }
    }

    // 4. Process products - limit to 200 for performance, pick diverse set
    const productRows = rows.slice(0, 200);
    let productsInserted = 0;

    for (const storeObj of stores) {
      const store_id = storeObj.store_id;
      console.log(`\n🛒 Seeding products for store: ${storeObj.shop_name} (ID: ${store_id})`);

      for (const row of productRows) {
        if (!row.product_name || !row.category || !row.final_price) continue;

        const cat_id = categoryMap[row.category];
        if (!cat_id) continue;

        const finalPrice = parseFloat(row.final_price) || 0;
        const discount = parseFloat(row.discount_pct) || 0;
        const stock = parseInt(row.stock) || 50;
        const unit = detectUnit(row.product_name, row.weight_g);
        const sku = `BLK-${row.product_id || Math.random().toString(36).slice(2, 8).toUpperCase()}-S${store_id}`;
        const expiryDate = row.expiry_date && row.expiry_date !== 'None' ? row.expiry_date : null;

        // Check if product already exists for this store
        const existing = await client.query(
          'SELECT product_id FROM products WHERE store_id = $1 AND product_name = $2',
          [store_id, row.product_name]
        );
        if (existing.rows.length > 0) continue;

        // Insert product
        const productRes = await client.query(`
          INSERT INTO products (
            store_id, category_id, product_name, brand, description,
            sku, unit, price, discount_percentage, expiry_date, is_available
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
          RETURNING product_id
        `, [
          store_id,
          cat_id,
          row.product_name,
          row.brand || null,
          `${row.packaging_type || ''} ${row.weight_g ? row.weight_g + 'g' : ''}`.trim() || null,
          sku,
          unit,
          finalPrice,
          discount,
          expiryDate
        ]);

        const product_id = productRes.rows[0].product_id;

        // Insert inventory
        await client.query(`
          INSERT INTO inventory (product_id, available_quantity, reorder_level, stock_status)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (product_id) DO UPDATE
          SET available_quantity = EXCLUDED.available_quantity
        `, [product_id, stock, parseInt(row.reorder_level) || 10, 'IN_STOCK']);

        productsInserted++;
      }
    }

    await client.query('COMMIT');
    console.log(`\n✅ Seeding complete!`);
    console.log(`   📦 Products inserted: ${productsInserted}`);
    console.log(`   📂 Categories: ${Object.keys(categoryMap).length}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

function detectUnit(productName, weight_g) {
  const n = (productName || '').toLowerCase();
  if (n.includes('litre') || n.includes('liter') || n.includes(' l ')) return 'litre';
  if (n.includes('ml')) return 'ml';
  if (n.includes('dozen')) return 'dozen';
  if (n.includes('packet') || n.includes('pack')) return 'packet';
  if (weight_g && parseInt(weight_g) >= 500) return 'kg';
  if (weight_g && parseInt(weight_g) < 500) return 'g';
  return 'piece';
}

seed().catch(console.error);
