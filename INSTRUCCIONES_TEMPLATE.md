# 📋 Guía Completa: Crear Template Excel para Cotizaciones

## Problema: El sistema necesita un template bien estructurado

El backend puede expandir filas automáticamente, pero el template de Excel debe estar correctamente configurado.

## Paso 1: Descargar Template de Ejemplo

El sistema espera que el template tenga esta estructura:

```
FILA 1:       | Encabezado empresa
...
FILA X:       | DATOS DEL CLIENTE (cliente, email, teléfono, etc.)
...
FILA N:       | ENCABEZADO DE TABLA
              | ITEM | DESCRIPCIÓN | ... | CANTIDAD | PRECIO UNITARIO | TOTAL
FILA N+1:     | {{items}} ← AQUÍ se insertan los productos
...
FILA M:       | TOTALES
              | Subtotal: {{subtotal}}
              | IVA (19%): {{iva}}
              | TOTAL: {{total}}
```

## Paso 2: Crear tu Template en Excel

### A) Estructura básica:

1. **Abre Excel o LibreOffice Calc**
2. **Crea las secciones:**

   ```
   ┌─────────────────────────────────────────┐
   │ MI EMPRESA S.A.S                        │
   │ NIT: 900.000.000-0                      │
   └─────────────────────────────────────────┘
   
   DATOS DEL CLIENTE:
   Cliente: {{cliente}}
   Email: {{email}}
   Teléfono: {{telefono}}
   Dirección: {{direccion}}
   Ciudad: {{ciudad}}
   Fecha: {{fecha}}
   Cotización #: {{numero_cotizacion}}
   
   ─────────────────────────────────────────────
   ITEM | DESCRIPCIÓN | CANTIDAD | P. UNITARIO | TOTAL
   ─────────────────────────────────────────────
   {{items}}
   
   ─────────────────────────────────────────────
   SUBTOTAL: {{subtotal}}
   IVA (19%): {{iva}}
   TOTAL: {{total}}
   ```

### B) Detalle de columnas (IMPORTANTE):

Para que el sistema sepa dónde poner cada dato, debes usar estas columnas:

| Columna | Contenido |
|---------|-----------|
| B | Número de item (1, 2, 3...) |
| C | Descripción del producto |
| D | (opcional) Característica extra |
| G | Cantidad |
| H | Precio Unitario |
| I | Precio Total |

**NOTA:** Si quieres usar otras columnas, necesitamos modificar el código.

### C) Placeholder `{{items}}`:

- **DEBE estar en una celda de la tabla**
- En la fila donde va el primer producto
- Cuando se descarga la cotización, esa fila se reemplaza con los productos reales
- Si hay más productos de los que el template tiene, se insertan filas automáticamente

### D) Formatos importantes:

**Para números que son dinámicos ({{iva}}, {{total}}, etc.):**
- Click derecho en la celda → Formato de Celda
- Número → Moneda o Número decimal
- Formato: `$#,##0.00`

**Para tablas:**
- Las columnas deben estar alineadas
- Las filas de productos deben tener el mismo alto
- Los bordes deben estar claros para que al expandir se vean bien

## Paso 3: Subir el Template

1. Ve a **Admin → Configuración**
2. Busca la sección "Template de Cotizaciones"
3. Haz click en el área de upload
4. Selecciona tu archivo Excel
5. Click en "Guardar"

## Paso 4: Probar la Descarga

1. Ve a **Cotizaciones**
2. Abre o crea una cotización
3. Agrega 4 productos (para ver si expande)
4. Click en **"Descargar Excel"**
5. Abre el archivo descargado y verifica:
   - Los datos se llenaron correctamente
   - El formato se mantuvo
   - Las filas se expandieron según los productos

## Placeholders Disponibles

```
CLIENTE:
  {{cliente}}              → Nombre del cliente
  {{email}}                → Email del cliente
  {{telefono}}             → Teléfono del cliente
  {{direccion}}            → Dirección del cliente
  {{ciudad}}               → Ciudad del cliente

COTIZACIÓN:
  {{fecha}}                → Fecha (DD/MM/YYYY)
  {{numero}}               → Número de cotización (RV001)
  {{numero_cotizacion}}    → Igual que {{numero}}

PRODUCTOS (automático):
  Los productos se insertan donde esté {{items}}
  Columnas: B, C, G, H, I (ver tabla arriba)

TOTALES:
  {{subtotal}}             → Subtotal sin IVA
  {{iva}}                  → IVA 19%
  {{total}}                → Total final
```

## Troubleshooting

### ❌ "El template no se está usando"
- Verifica que el archivo se haya subido (debe estar en `backend/uploads/template.xlsx`)
- Recarga la página

### ❌ "Se sube pero los datos no aparecen"
- Los placeholders deben estar **exactamente** como se escriben
- Usa: `{{cliente}}` NO `{{ cliente }}` (sin espacios)
- Usa: `{{cliente}}` NO `{{Cliente}}` (minúsculas)

### ❌ "Los productos se insertan pero pierden el formato"
- Asegúrate que la fila con `{{items}}` tenga el mismo formato que las demás filas de la tabla
- Los bordes, colores y fuentes deben copiar la fila anterior
- Prueba copiar la fila de encabezados y pegarla como base para los items

### ❌ "Se insertan filas pero quedan desalineadas"
- Las columnas B, C, G, H, I deben estar alineadas correctamente
- Si usas otras columnas, el código necesita ser modificado
- El ancho de las columnas debe ser consistente

### ❌ "El IVA o Total no son números"
- Los placeholders numéricos (`{{subtotal}}`, `{{iva}}`, `{{total}}`) deben estar en celdas formateadas como moneda
- Haz click derecho → Formato de Celda → Moneda

## Próximas Mejoras (si las necesitas)

Si quieres más funcionalidades:
- [ ] Soporte para imágenes (logo de la empresa)
- [ ] Múltiples templates (diferentes formatos)
- [ ] Encabezados y pies de página personalizados
- [ ] Campos adicionales (vendedor, condiciones de pago, etc.)
- [ ] Estilos diferentes según el tipo de cliente

## Ejemplo Visual: Template en Excel

```
╔════════════════════════════════════════════════════════════════╗
║  MI EMPRESA S.A.S                                              ║
║  NIT: 900.000.000-0                                            ║
║  Teléfono: 1234567890                                          ║
╠════════════════════════════════════════════════════════════════╣
║ COTIZACIÓN #{{numero_cotizacion}}           Fecha: {{fecha}}  ║
╠════════════════════════════════════════════════════════════════╣
║ CLIENTE:         {{cliente}}                                    ║
║ EMAIL:           {{email}}                                      ║
║ TELÉFONO:        {{telefono}}                                   ║
║ DIRECCIÓN:       {{direccion}}, {{ciudad}}                      ║
╠════════════════════════════════════════════════════════════════╣
║ ITEM │ DESCRIPCIÓN          │ CANT │ P.UNIT     │ TOTAL        ║
╠══════╪══════════════════════╪══════╪════════════╪══════════════╣
║  {{items}}                                                      ║
║   1  │ Producto 1           │  10  │ $ 1.000    │ $ 10.000     ║
║   2  │ Producto 2           │   5  │ $ 2.000    │ $ 10.000     ║
╠════════════════════════════════════════════════════════════════╣
║                         SUBTOTAL: {{subtotal}}                  ║
║                         IVA (19%): {{iva}}                      ║
║                            TOTAL: {{total}}                     ║
╚════════════════════════════════════════════════════════════════╝
```

¿Necesitas ayuda para crear el template o hay algo específico que no entiendas?
