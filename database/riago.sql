SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS riago_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE riago_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NULL UNIQUE,
  username VARCHAR(60) NULL UNIQUE,
  phone VARCHAR(30) NULL,
  address TEXT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','cashier','kitchen','rider','admin') NOT NULL DEFAULT 'customer',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pending_registrations (
  email VARCHAR(190) NOT NULL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address TEXT NULL,
  password_hash VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS menu_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'Other',
  price DECIMAL(10,2) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  emoji VARCHAR(16) NOT NULL DEFAULT '🍽️',
  tone VARCHAR(20) NOT NULL DEFAULT 'pink',
  image_path VARCHAR(255) NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- order_type: online (customer website) or counter (walk-in at the cashier).
-- status: placed -> in_process -> (out_for_delivery ->) complete, or rejected / failed.
-- kitchen_status: new -> preparing -> ready -> completed.
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  order_type ENUM('online','counter') NOT NULL DEFAULT 'online',
  customer_id BIGINT UNSIGNED NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(30) NULL,
  delivery_address TEXT NULL,
  rider_id BIGINT UNSIGNED NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_received DECIMAL(10,2) NULL,
  change_amount DECIMAL(10,2) NULL,
  status ENUM('placed','in_process','out_for_delivery','complete','rejected','failed') NOT NULL DEFAULT 'placed',
  kitchen_status ENUM('new','preparing','ready','completed') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_rider FOREIGN KEY (rider_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_orders_status (status),
  INDEX idx_orders_customer (customer_id),
  INDEX idx_orders_rider (rider_id),
  INDEX idx_orders_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  menu_item_id BIGINT UNSIGNED NULL,
  item_name VARCHAR(120) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_menu FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Starter menu. INSERT IGNORE: importing again never overwrites prices or stock you changed.
INSERT IGNORE INTO menu_items (name, description, category, price, stock, emoji, tone) VALUES
('Tteokbokki', 'Chewy rice cakes in a rich spicy sauce', 'Korean', 120.00, 20, '🍢', 'coral'),
('Kimchi Rice', 'Savory fried rice with Korean kimchi', 'Rice Meals', 99.00, 18, '🍚', 'peach'),
('Samgyupsal in a Cup', 'Juicy samgyup bites with rice and sides', 'Korean', 149.00, 12, '🥓', 'pink'),
('Korean Bulgogi', 'Sweet and savory Korean beef', 'Korean', 139.00, 15, '🥘', 'gold'),
('Samyang Overload', 'Creamy, spicy noodles loaded with flavor', 'Noodles', 159.00, 10, '🍜', 'red'),
('Kimchi Jjigae', 'Warm Korean kimchi stew', 'Korean', 129.00, 9, '🍲', 'orange');
