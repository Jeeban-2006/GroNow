-- 1. Insert Categories
INSERT INTO categories (category_name) VALUES
('Vegetables'),
('Fruits'),
('Dairy & Bakery'),
('Snacks'),
('Beverages')
ON CONFLICT (category_name) DO NOTHING;

-- 2. Insert a dummy Store Owner User (password: dummy)
INSERT INTO users (first_name, last_name, email, phone, password, role, is_verified) 
VALUES ('Super', 'Store', 'superstore2@gronow.com', '9999999991', '$2b$10$dummyhashedpassword1234567890', 'STORE_OWNER', true);

-- 3. Insert Store Owner Profile
INSERT INTO store_owners (user_id, business_name, verification_status)
VALUES (currval('users_user_id_seq'), 'Super Store', 'APPROVED');

-- 4. Insert Store
INSERT INTO stores (owner_id, shop_name, address, city, state, pincode, contact_number, is_verified)
VALUES (currval('store_owners_owner_id_seq'), 'Gronow Super Store', 'Patia Square', 'Bhubaneswar', 'Odisha', '751024', '9999999991', true);

-- 5. Insert Products
INSERT INTO products (store_id, category_id, product_name, brand, description, sku, barcode, unit, price, is_available) VALUES
(currval('stores_store_id_seq'), (SELECT category_id FROM categories WHERE category_name='Vegetables'), 'Farm Fresh Tomatoes', 'Local Farm', 'Red and juicy local tomatoes', 'TOM-01', 'BAR-1001', 'kg', 40.00, true),
(currval('stores_store_id_seq'), (SELECT category_id FROM categories WHERE category_name='Vegetables'), 'Onions', 'Local Farm', 'Fresh onions', 'ONI-01', 'BAR-1002', 'kg', 35.00, true),
(currval('stores_store_id_seq'), (SELECT category_id FROM categories WHERE category_name='Fruits'), 'Golden Apples', 'Kashmir Orchards', 'Sweet and crisp apples', 'APP-01', 'BAR-1003', 'kg', 120.00, true),
(currval('stores_store_id_seq'), (SELECT category_id FROM categories WHERE category_name='Fruits'), 'Bananas', 'Local Farm', 'Fresh ripe bananas', 'BAN-01', 'BAR-1004', 'dozen', 60.00, true),
(currval('stores_store_id_seq'), (SELECT category_id FROM categories WHERE category_name='Dairy & Bakery'), 'Amul Taaza Milk', 'Amul', 'Toned milk', 'MLK-01', 'BAR-1005', 'litre', 54.00, true),
(currval('stores_store_id_seq'), (SELECT category_id FROM categories WHERE category_name='Dairy & Bakery'), 'Britannia Bread', 'Britannia', 'Whole wheat brown bread', 'BRD-01', 'BAR-1006', 'packet', 45.00, true),
(currval('stores_store_id_seq'), (SELECT category_id FROM categories WHERE category_name='Snacks'), 'Lays Magic Masala', 'Lays', 'Spicy potato chips', 'LAY-01', 'BAR-1007', 'packet', 20.00, true),
(currval('stores_store_id_seq'), (SELECT category_id FROM categories WHERE category_name='Beverages'), 'Coca Cola', 'Coca Cola', 'Chilled soft drink', 'COK-01', 'BAR-1008', 'litre', 40.00, true);

-- 6. Insert Inventory
INSERT INTO inventory (product_id, available_quantity)
SELECT product_id, 100 FROM products;
