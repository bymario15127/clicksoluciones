-- Crear tabla de empresas para el módulo HelpDesk
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

-- Agregar columna company_id a la tabla users
-- Esto relaciona usuarios con empresas del HelpDesk
ALTER TABLE users ADD COLUMN company_id INT NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_company 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- Índice para mejorar búsquedas
CREATE INDEX idx_users_company ON users(company_id);

-- Insertar algunas empresas de ejemplo
INSERT INTO companies (name, email, phone, contact_person, notes) VALUES
('Empresa Demo S.A.', 'contacto@empresademo.com', '+1234567890', 'Juan Pérez', 'Cliente principal de soporte técnico'),
('Tech Solutions Ltd.', 'info@techsolutions.com', '+0987654321', 'María González', 'Cliente de soporte mensual');
