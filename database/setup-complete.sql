-- Script de Inicialización Completa de la Base de Datos CLICK

-- 1. Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  company_id INT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  UNIQUE KEY unique_email (email)
);

-- 3. Crear tabla de empresas
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  contact_person VARCHAR(255),
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  stock INT DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Crear tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'nuevo',
  priority VARCHAR(50) DEFAULT 'normal',
  assigned_to INT,
  company_id INT NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Crear tabla de cotizaciones
CREATE TABLE IF NOT EXISTS quotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pendiente',
  total_amount DECIMAL(10, 2),
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. Crear tabla de detalles de cotizaciones
CREATE TABLE IF NOT EXISTS quote_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quote_id INT NOT NULL,
  product_id INT,
  description TEXT,
  quantity INT,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 9. Crear tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  quote_id INT,
  status VARCHAR(50) DEFAULT 'pendiente',
  total_amount DECIMAL(10, 2),
  sale_date DATE,
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 10. Crear tabla de detalles de ventas
CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT,
  description TEXT,
  quantity INT,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ===== INSERTAR DATOS INICIALES =====

-- Insertar roles
INSERT IGNORE INTO roles (id, name, description) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'technician', 'Técnico de soporte'),
(3, 'sales', 'Vendedor'),
(4, 'client', 'Cliente');

-- Insertar empresas de ejemplo
INSERT IGNORE INTO companies (id, name, email, phone, contact_person, notes) VALUES
(1, 'Empresa Demo S.A.', 'contacto@empresademo.com', '+1234567890', 'Juan Pérez', 'Cliente principal de soporte técnico'),
(2, 'Tech Solutions Ltd.', 'info@techsolutions.com', '+0987654321', 'María González', 'Cliente de soporte mensual');

-- Insertar usuarios (las contraseñas deben ser hasheadas con bcrypt)
-- Usuario admin: password = "admin123" (hasheada)
-- Usuario technician: password = "tech123" (hasheada)
-- Usuario sales: password = "sales123" (hasheada)
INSERT IGNORE INTO users (id, name, email, password, role_id, company_id, active) VALUES
(1, 'Lozano Nelson', 'lozano.nelson@clicksuite.com', '$2b$10$YODmALkI4Zm.uv/Dk8jG8O6x1f7U2XqKZvV0z5p5.Z5G5p5p5p5p5', 1, NULL, true),
(2, 'García Técnico', 'garcia.tecnico@clicksuite.com', '$2b$10$YODmALkI4Zm.uv/Dk8jG8O6x1f7U2XqKZvV0z5p5.Z5G5p5p5p5p5', 2, 1, true),
(3, 'Martínez Vendedor', 'martinez.vendedor@clicksuite.com', '$2b$10$YODmALkI4Zm.uv/Dk8jG8O6x1f7U2XqKZvV0z5p5.Z5G5p5p5p5p5', 3, NULL, true);

-- Insertar clientes de ejemplo
INSERT IGNORE INTO clients (id, name, email, phone, address, city, country, active) VALUES
(1, 'Cliente A S.A.', 'contacto@clientea.com', '+1111111111', 'Calle 1, 100', 'Bogotá', 'Colombia', true),
(2, 'Cliente B Ltda.', 'info@clienteb.com', '+2222222222', 'Calle 2, 200', 'Medellín', 'Colombia', true),
(3, 'Cliente C Inc.', 'sales@clientec.com', '+3333333333', 'Calle 3, 300', 'Cali', 'Colombia', true);

-- Insertar productos de ejemplo
INSERT IGNORE INTO products (id, name, description, price, stock, sku, category, active) VALUES
(1, 'Producto A', 'Descripción del producto A', 100.00, 50, 'SKU-001', 'Categoría 1', true),
(2, 'Producto B', 'Descripción del producto B', 200.00, 30, 'SKU-002', 'Categoría 2', true),
(3, 'Producto C', 'Descripción del producto C', 150.00, 20, 'SKU-003', 'Categoría 1', true),
(4, 'Producto D', 'Descripción del producto D', 300.00, 5, 'SKU-004', 'Categoría 3', true),
(5, 'Producto E', 'Descripción del producto E', 75.00, 100, 'SKU-005', 'Categoría 2', true);

-- ===== ÍNDICES PARA PERFORMANCE =====
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_company ON tickets(company_id);
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_sales_client ON sales(client_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_products_sku ON products(sku);

-- ===== VERIFICACIÓN FINAL =====
SELECT 'Roles' as tabla, COUNT(*) as cantidad FROM roles
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM users
UNION ALL
SELECT 'Empresas', COUNT(*) FROM companies
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clients
UNION ALL
SELECT 'Productos', COUNT(*) FROM products
UNION ALL
SELECT 'Tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'Cotizaciones', COUNT(*) FROM quotes
UNION ALL
SELECT 'Ventas', COUNT(*) FROM sales;
