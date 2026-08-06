/*
==========================================================
BBSR SMART GROCERY DELIVERY SYSTEM
Database : PostgreSQL
Version  : 1.0
Author   : Team
==========================================================
*/

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS delivery_partners CASCADE;
DROP TABLE IF EXISTS store_owners CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;



CREATE TABLE users (

    user_id SERIAL PRIMARY KEY,

    first_name VARCHAR(50) NOT NULL,

    last_name VARCHAR(50) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    phone VARCHAR(15) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK(role IN
        ('ADMIN','CUSTOMER','STORE_OWNER','DELIVERY')),

    profile_image TEXT,

    is_verified BOOLEAN DEFAULT FALSE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_phone
ON users(phone);

CREATE INDEX idx_users_role
ON users(role);


CREATE TABLE customers (

    customer_id SERIAL PRIMARY KEY,

    user_id INT UNIQUE NOT NULL,

    address TEXT NOT NULL,

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100) NOT NULL,

    pincode VARCHAR(10) NOT NULL,

    latitude DECIMAL(10,8),

    longitude DECIMAL(11,8),

    default_address BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


CREATE INDEX idx_customer_city
ON customers(city);

CREATE INDEX idx_customer_pincode
ON customers(pincode);

-- ===========================================
-- STORE OWNERS TABLE
-- ===========================================

CREATE TABLE store_owners (

    owner_id SERIAL PRIMARY KEY,

    user_id INT UNIQUE NOT NULL,

    business_name VARCHAR(150) NOT NULL,

    gst_number VARCHAR(20) UNIQUE,

    business_phone VARCHAR(15),

    business_email VARCHAR(255),

    verification_status VARCHAR(20)
        DEFAULT 'PENDING'
        CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_owner_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- STORE OWNERS INDEXES
CREATE INDEX idx_store_owner_business_name
ON store_owners(business_name);

CREATE INDEX idx_store_owner_verification
ON store_owners(verification_status);

-- DELIVERY PARTNERS TABLE
CREATE TABLE delivery_partners (

    partner_id SERIAL PRIMARY KEY,

    user_id INT UNIQUE NOT NULL,

    vehicle_type VARCHAR(30) NOT NULL
        CHECK (vehicle_type IN ('BIKE', 'SCOOTER', 'CYCLE', 'CAR')),

    vehicle_number VARCHAR(20) UNIQUE NOT NULL,

    driving_license VARCHAR(30) UNIQUE NOT NULL,

    aadhaar_number VARCHAR(20) UNIQUE,

    current_latitude DECIMAL(10,8),

    current_longitude DECIMAL(11,8),

    availability_status VARCHAR(20)
        DEFAULT 'AVAILABLE'
        CHECK (availability_status IN ('AVAILABLE', 'BUSY', 'OFFLINE')),

    rating NUMERIC(2,1) DEFAULT 5.0
        CHECK (rating >= 0 AND rating <= 5),

    total_deliveries INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_partner_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- DELIVERY PARTNER INDEXES
CREATE INDEX idx_partner_status
ON delivery_partners(availability_status);

CREATE INDEX idx_partner_location
ON delivery_partners(current_latitude, current_longitude);

-- STORES TABLE
CREATE TABLE stores (
    store_id SERIAL PRIMARY KEY,

    owner_id INT NOT NULL UNIQUE,

    shop_name VARCHAR(100) NOT NULL,

    description TEXT,

    address TEXT NOT NULL,

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100) NOT NULL,

    pincode VARCHAR(6) NOT NULL,

    latitude DECIMAL(10,8),

    longitude DECIMAL(11,8),

    opening_time TIME,

    closing_time TIME,

    contact_number VARCHAR(10) NOT NULL,

    is_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_store_owner
        FOREIGN KEY (owner_id)
        REFERENCES store_owners(owner_id)
        ON DELETE CASCADE
);
-- STORE INDEXES
CREATE INDEX idx_store_city
ON stores(city);

CREATE INDEX idx_store_name
ON stores(shop_name);

CREATE INDEX idx_store_owner
ON stores(owner_id);

-- CATEGORIES TABLE
CREATE TABLE categories (

    category_id SERIAL PRIMARY KEY,

    category_name VARCHAR(100) NOT NULL UNIQUE,

    category_description TEXT,

    category_image TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORY INDEXES
CREATE INDEX idx_category_name
ON categories(category_name);

-- PRODUCTS TABLE
CREATE TABLE products (

    product_id SERIAL PRIMARY KEY,

    store_id INT NOT NULL,

    category_id INT NOT NULL,

    product_name VARCHAR(150) NOT NULL,

    brand VARCHAR(100),

    description TEXT,

    sku VARCHAR(50) UNIQUE,

    barcode VARCHAR(50) UNIQUE,

    unit VARCHAR(20) NOT NULL
        CHECK (unit IN ('kg','g','litre','ml','packet','piece','dozen')),

    price NUMERIC(10,2) NOT NULL
        CHECK(price > 0),

    discount_percentage NUMERIC(5,2) DEFAULT 0
        CHECK(discount_percentage >=0 AND discount_percentage <=100),

    image_url TEXT,

    expiry_date DATE,

    is_available BOOLEAN DEFAULT TRUE,

    average_rating NUMERIC(2,1) DEFAULT 5.0
        CHECK(average_rating >=0 AND average_rating <=5),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_store
        FOREIGN KEY(store_id)
        REFERENCES stores(store_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product_category
        FOREIGN KEY(category_id)
        REFERENCES categories(category_id)
        ON DELETE CASCADE
);

-- PRODUCT INDEXES
CREATE INDEX idx_product_name
ON products(product_name);

CREATE INDEX idx_product_store
ON products(store_id);

CREATE INDEX idx_product_category
ON products(category_id);

CREATE INDEX idx_product_price
ON products(price);

-- INVENTORY TABLE
CREATE TABLE inventory (

    inventory_id SERIAL PRIMARY KEY,

    product_id INT UNIQUE NOT NULL,

    available_quantity INT NOT NULL
        CHECK (available_quantity >= 0),

    reserved_quantity INT DEFAULT 0
        CHECK (reserved_quantity >= 0),

    reorder_level INT DEFAULT 10
        CHECK (reorder_level >= 0),

    stock_status VARCHAR(20)
        DEFAULT 'IN_STOCK'
        CHECK (stock_status IN ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK')),

    last_restocked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_product
        FOREIGN KEY(product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
);

-- INVENTORY INDEXES
CREATE INDEX idx_inventory_status
ON inventory(stock_status);

CREATE INDEX idx_inventory_quantity
ON inventory(available_quantity);

-- CART TABLE
CREATE TABLE cart (

    cart_id SERIAL PRIMARY KEY,

    customer_id INT UNIQUE NOT NULL,

    total_items INT DEFAULT 0
        CHECK(total_items >= 0),

    total_amount NUMERIC(10,2) DEFAULT 0.00
        CHECK(total_amount >= 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_customer
        FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
);

-- CART INDEXES
CREATE INDEX idx_cart_customer
ON cart(customer_id);

-- CART ITEMS TABLE
CREATE TABLE cart_items (

    cart_item_id SERIAL PRIMARY KEY,

    cart_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL
        CHECK(quantity > 0),

    unit_price NUMERIC(10,2) NOT NULL
        CHECK(unit_price >= 0),

    subtotal NUMERIC(10,2) NOT NULL
        CHECK(subtotal >= 0),

    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cartitem_cart
        FOREIGN KEY(cart_id)
        REFERENCES cart(cart_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cartitem_product
        FOREIGN KEY(product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_cart_product
        UNIQUE(cart_id, product_id)
);

-- CART ITEMS INDEXES
CREATE INDEX idx_cartitem_cart
ON cart_items(cart_id);

CREATE INDEX idx_cartitem_product
ON cart_items(product_id);

-- WISHLIST TABLE
CREATE TABLE wishlist (

    wishlist_id SERIAL PRIMARY KEY,

    customer_id INT NOT NULL,

    product_id INT NOT NULL,

    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlist_customer
        FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_wishlist_product
        FOREIGN KEY(product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_wishlist
        UNIQUE(customer_id, product_id)
);

-- WISHLIST INDEXES
CREATE INDEX idx_wishlist_customer
ON wishlist(customer_id);

CREATE INDEX idx_wishlist_product
ON wishlist(product_id);

-- ORDERS TABLE
CREATE TABLE orders (

    order_id SERIAL PRIMARY KEY,

    order_number VARCHAR(30) UNIQUE NOT NULL,

    customer_id INT NOT NULL,

    store_id INT NOT NULL,

    partner_id INT,

    order_status VARCHAR(30)
        DEFAULT 'PLACED'
        CHECK(order_status IN (
            'PLACED',
            'CONFIRMED',
            'PACKING',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED'
        )),

    payment_status VARCHAR(20)
        DEFAULT 'PENDING'
        CHECK(payment_status IN (
            'PENDING',
            'SUCCESS',
            'FAILED',
            'REFUNDED'
        )),

    delivery_address TEXT NOT NULL,

    subtotal NUMERIC(10,2) NOT NULL
        CHECK(subtotal >= 0),

    discount NUMERIC(10,2) DEFAULT 0
        CHECK(discount >= 0),

    gst NUMERIC(10,2) DEFAULT 0
        CHECK(gst >= 0),

    delivery_charge NUMERIC(10,2) DEFAULT 0
        CHECK(delivery_charge >= 0),

    total_amount NUMERIC(10,2) NOT NULL
        CHECK(total_amount >= 0),

    estimated_delivery_time TIMESTAMP,

    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    delivered_at TIMESTAMP,

    delivery_otp VARCHAR(6),

    CONSTRAINT fk_order_customer
        FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_store
        FOREIGN KEY(store_id)
        REFERENCES stores(store_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_partner
        FOREIGN KEY(partner_id)
        REFERENCES delivery_partners(partner_id)
        ON DELETE SET NULL
);


-- ORDERS INDEXES
CREATE INDEX idx_orders_customer
ON orders(customer_id);

CREATE INDEX idx_orders_store
ON orders(store_id);

CREATE INDEX idx_orders_partner
ON orders(partner_id);

CREATE INDEX idx_orders_status
ON orders(order_status);

CREATE INDEX idx_orders_ordered_at
ON orders(ordered_at);

-- ORDER ITEMS TABLE
CREATE TABLE order_items (

    order_item_id SERIAL PRIMARY KEY,

    order_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL
        CHECK(quantity > 0),

    unit_price NUMERIC(10,2) NOT NULL
        CHECK(unit_price >= 0),

    discount NUMERIC(10,2) DEFAULT 0
        CHECK(discount >= 0),

    subtotal NUMERIC(10,2) NOT NULL
        CHECK(subtotal >= 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orderitem_order
        FOREIGN KEY(order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_orderitem_product
        FOREIGN KEY(product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
);

-- ORDER ITEMS INDEXES
CREATE INDEX idx_orderitem_order
ON order_items(order_id);

CREATE INDEX idx_orderitem_product
ON order_items(product_id);

-- PAYMENTS TABLE
CREATE TABLE payments (

    payment_id SERIAL PRIMARY KEY,

    order_id INT UNIQUE NOT NULL,

    payment_method VARCHAR(30)
        NOT NULL
        CHECK (payment_method IN (
            'UPI',
            'CREDIT_CARD',
            'DEBIT_CARD',
            'NET_BANKING',
            'CASH_ON_DELIVERY',
            'WALLET'
        )),

    payment_status VARCHAR(20)
        DEFAULT 'PENDING'
        CHECK (payment_status IN (
            'PENDING',
            'SUCCESS',
            'FAILED',
            'REFUNDED'
        )),

    transaction_id VARCHAR(100) UNIQUE,

    razorpay_payment_id VARCHAR(100),

    razorpay_order_id VARCHAR(100),

    amount_paid NUMERIC(10,2)
        NOT NULL
        CHECK (amount_paid >= 0),

    refund_amount NUMERIC(10,2)
        DEFAULT 0
        CHECK (refund_amount >= 0),

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_order
        FOREIGN KEY(order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE
);

-- PAYMENT INDEXES
CREATE INDEX idx_payment_status
ON payments(payment_status);

CREATE INDEX idx_payment_method
ON payments(payment_method);

CREATE INDEX idx_payment_date
ON payments(payment_date);

-- ROUTES TABLE
CREATE TABLE routes (

    route_id SERIAL PRIMARY KEY,

    order_id INT UNIQUE NOT NULL,

    partner_id INT NOT NULL,

    pickup_latitude DECIMAL(10,8) NOT NULL,

    pickup_longitude DECIMAL(11,8) NOT NULL,

    delivery_latitude DECIMAL(10,8) NOT NULL,

    delivery_longitude DECIMAL(11,8) NOT NULL,

    total_distance_km NUMERIC(6,2)
        CHECK(total_distance_km >= 0),

    estimated_time_minutes INT
        CHECK(estimated_time_minutes >= 0),

    actual_time_minutes INT
        CHECK(actual_time_minutes >= 0),

    waypoints JSONB,

    route_status VARCHAR(30)
        DEFAULT 'ASSIGNED'
        CHECK(route_status IN (
            'ASSIGNED',
            'PICKED_UP',
            'ON_THE_WAY',
            'DELIVERED',
            'CANCELLED'
        )),

    started_at TIMESTAMP,

    completed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_route_order
        FOREIGN KEY(order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_route_partner
        FOREIGN KEY(partner_id)
        REFERENCES delivery_partners(partner_id)
        ON DELETE CASCADE
);

-- ROUTE INDEXES
CREATE INDEX idx_route_partner
ON routes(partner_id);

CREATE INDEX idx_route_status
ON routes(route_status);

CREATE INDEX idx_route_order
ON routes(order_id);

-- RECOMMENDATIONS TABLE
CREATE TABLE recommendations (

    recommendation_id SERIAL PRIMARY KEY,

    customer_id INT NOT NULL,

    product_id INT NOT NULL,

    recommendation_type VARCHAR(30)
        DEFAULT 'FREQUENTLY_BOUGHT'
        CHECK (
            recommendation_type IN (
                'FREQUENTLY_BOUGHT',
                'PURCHASE_HISTORY',
                'CATEGORY_BASED',
                'TRENDING',
                'NEW_ARRIVAL'
            )
        ),

    recommendation_score NUMERIC(5,2)
        DEFAULT 0
        CHECK(recommendation_score >= 0),

    is_clicked BOOLEAN DEFAULT FALSE,

    is_purchased BOOLEAN DEFAULT FALSE,

    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recommend_customer
        FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_recommend_product
        FOREIGN KEY(product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_recommendation
        UNIQUE(customer_id, product_id)
);

-- RECOMMENDATION INDEXES
CREATE INDEX idx_recommend_customer
ON recommendations(customer_id);

CREATE INDEX idx_recommend_product
ON recommendations(product_id);

CREATE INDEX idx_recommend_type
ON recommendations(recommendation_type);

-- REVIEWS TABLE
CREATE TABLE reviews (

    review_id SERIAL PRIMARY KEY,

    customer_id INT NOT NULL,

    product_id INT NOT NULL,

    order_id INT NOT NULL,

    rating INT NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    review_title VARCHAR(150),

    review_text TEXT,

    is_verified_purchase BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_customer
        FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_product
        FOREIGN KEY(product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_order
        FOREIGN KEY(order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_customer_review
        UNIQUE(customer_id, product_id, order_id)
);

-- REVIEW INDEXES
CREATE INDEX idx_review_product
ON reviews(product_id);

CREATE INDEX idx_review_customer
ON reviews(customer_id);

CREATE INDEX idx_review_rating
ON reviews(rating);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (

    notification_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    title VARCHAR(150) NOT NULL,

    message TEXT NOT NULL,

    notification_type VARCHAR(30)
        DEFAULT 'GENERAL'
        CHECK (
            notification_type IN (
                'ORDER',
                'PAYMENT',
                'DELIVERY',
                'STOCK',
                'PROMOTION',
                'GENERAL'
            )
        ),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- NOTIFICATION INDEXES
CREATE INDEX idx_notification_user
ON notifications(user_id);

CREATE INDEX idx_notification_read
ON notifications(is_read);

CREATE INDEX idx_notification_type
ON notifications(notification_type);

-- OTP VERIFICATIONS TABLE
CREATE TABLE otp_verifications (

    otp_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    otp_code VARCHAR(6) NOT NULL,

    otp_type VARCHAR(30)
        DEFAULT 'EMAIL_VERIFICATION'
        CHECK (
            otp_type IN (
                'EMAIL_VERIFICATION',
                'PHONE_VERIFICATION',
                'FORGOT_PASSWORD'
            )
        ),

    expires_at TIMESTAMP NOT NULL,

    is_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_otp_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_otp_user
ON otp_verifications(user_id);

CREATE INDEX idx_otp_verified
ON otp_verifications(is_verified);

CREATE INDEX idx_otp_expiry
ON otp_verifications(expires_at);

-- DELIVERY TRACKING TABLE
CREATE TABLE delivery_tracking (

    tracking_id SERIAL PRIMARY KEY,

    order_id INT NOT NULL,

    partner_id INT NOT NULL,

    latitude DECIMAL(10,8) NOT NULL,

    longitude DECIMAL(11,8) NOT NULL,

    speed NUMERIC(5,2)
        CHECK(speed >= 0),

    accuracy NUMERIC(6,2)
        CHECK(accuracy >= 0),

    tracking_status VARCHAR(30)
        DEFAULT 'ON_THE_WAY'
        CHECK (
            tracking_status IN (
                'ASSIGNED',
                'AT_STORE',
                'PICKED_UP',
                'ON_THE_WAY',
                'ARRIVED',
                'DELIVERED'
            )
        ),

    tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tracking_order
        FOREIGN KEY(order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_tracking_partner
        FOREIGN KEY(partner_id)
        REFERENCES delivery_partners(partner_id)
        ON DELETE CASCADE
);

-- DELIVERY TRACKING INDEXES
CREATE INDEX idx_tracking_order
ON delivery_tracking(order_id);

CREATE INDEX idx_tracking_partner
ON delivery_tracking(partner_id);

CREATE INDEX idx_tracking_time
ON delivery_tracking(tracked_at);

-- SYSTEM CONFIG TABLE
CREATE TABLE system_config (
    config_id SERIAL PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial pricing configuration
INSERT INTO system_config (config_key, config_value) VALUES 
('pricing', '{"base_delivery_fee": 15.00, "surge_multiplier": 1.0, "platform_commission_percent": 5.0}');