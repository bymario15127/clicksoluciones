-- Agregar columnas para productos personalizados sin inventario
ALTER TABLE quote_items 
ADD COLUMN description VARCHAR(500) NULL AFTER product_id,
ADD COLUMN marca VARCHAR(200) NULL AFTER description,
ADD COLUMN referencia VARCHAR(200) NULL AFTER marca,
ADD COLUMN unidad VARCHAR(50) NULL AFTER referencia;

-- Modificar product_id para que sea opcional (NULL cuando es producto personalizado)
ALTER TABLE quote_items 
MODIFY COLUMN product_id INT NULL;
