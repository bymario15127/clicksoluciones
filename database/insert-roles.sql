-- Insertar roles si no existen
INSERT IGNORE INTO roles (id, name, description) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'technician', 'Técnico de soporte'),
(3, 'sales', 'Vendedor'),
(4, 'client', 'Cliente');

-- Verificar roles
SELECT * FROM roles;

-- Verificar usuarios
SELECT u.id, u.name, u.email, u.role_id, r.name as role_name 
FROM users u 
LEFT JOIN roles r ON u.role_id = r.id;
