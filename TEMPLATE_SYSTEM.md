# Sistema de Templates de Cotizaciones

Este documento explica cómo usar el sistema de templates personalizados para cotizaciones en Excel.

## ¿Cómo funciona?

1. **Admin sube un template**: El administrador sube un archivo Excel personalizado desde la página de Configuración (`/configuracion`)
2. **Template se guarda**: El archivo se guarda en `backend/uploads/template.xlsx`
3. **Sistema lo usa automáticamente**: Cada vez que se descarga una cotización, el sistema:
   - Lee el template personalizado
   - Busca placeholders como `{{cliente}}`, `{{total}}`, etc.
   - Los reemplaza con los datos reales de la cotización
   - Genera y descarga el archivo

## Placeholders disponibles

En tu template Excel, puedes usar estos placeholders que serán reemplazados automáticamente:

```
{{cliente}}              → Nombre del cliente
{{email}}                → Email del cliente
{{telefono}}             → Teléfono del cliente
{{direccion}}            → Dirección del cliente
{{ciudad}}               → Ciudad del cliente
{{fecha}}                → Fecha de la cotización (formato: DD/MM/YYYY)
{{numero_cotizacion}}    → Número de cotización (ej: RV123)
{{subtotal}}             → Subtotal (sin IVA)
{{iva}}                  → IVA calculado (19% del subtotal)
{{total}}                → Total (subtotal + IVA)
```

## Cómo crear tu template

### Opción 1: Descarga el template de ejemplo
1. Ve a Configuración → Template de Cotizaciones
2. Haz clic en "Template Excel" para descargar el template en blanco
3. Modifica el archivo con tu logo, colores y diseño

### Opción 2: Crear desde cero
1. Abre Excel o LibreOffice Calc
2. Diseña tu cotización como deseas que se vea
3. Reemplaza los valores que quieras que se llenen automáticamente con los placeholders (ej: `{{cliente}}`)

### Ejemplo de contenido en Excel:

```
ENCABEZADO:
    Mi Empresa S.A.S
    NIT: 900.000.000-0

INFORMACIÓN DEL CLIENTE:
    Cliente: {{cliente}}
    Email: {{email}}
    Teléfono: {{telefono}}
    Dirección: {{direccion}}
    Ciudad: {{ciudad}}

TABLA DE PRODUCTOS:
    Descripción | Cantidad | Precio Unitario | Total
    [Filas para llenar con {{item_descripcion}}, etc.]

TOTALES:
    Subtotal: {{subtotal}}
    IVA (19%): {{iva}}
    TOTAL: {{total}}
```

## Pasos para usar el sistema

1. **Crear tu template**
   - Diseña un archivo Excel con tu branding
   - Agrega los placeholders donde corresponda

2. **Subir el template**
   - Ve a Configuración (solo admin)
   - Haz clic en el área de upload
   - Selecciona o arrastra tu archivo Excel
   - Confirma el upload

3. **Usar en cotizaciones**
   - Crea una nueva cotización normalmente
   - Haz clic en "Descargar Excel"
   - El sistema usará automáticamente tu template personalizado

## Limitaciones actuales

- Solo se almacena **1 template** a la vez (subir un nuevo reemplaza el anterior)
- El template debe tener una estructura clara con los placeholders visibles
- Los placeholders se buscan en todas las celdas del libro

## Mejoras futuras

- Múltiples templates
- Soporte para imágenes (logo)
- Placeholders en encabezados y pies de página
- Validación visual del template antes de guardar

## Troubleshooting

### El template no se está usando
- Verifica que hayas subido el archivo correctamente
- Revisa que el archivo sea válido (intenta abrirlo en Excel)
- Reinicia la aplicación

### Los placeholders no se están reemplazando
- Asegúrate de usar exactamente: `{{palabra}}` (con llaves)
- Verifica la ortografía exacta del placeholder
- Los placeholders son case-sensitive

### Error al subir el archivo
- Verifica que sea un archivo .xlsx o .xls
- Intenta con un archivo más pequeño
- Verifica los permisos de la carpeta `backend/uploads`

## API Endpoints

### Subir template
```
POST /api/export/template
Headers: Authorization: Bearer {token}
Body: FormData con 'template' (archivo Excel)
Response: { message: "Template subido correctamente", filename: "..." }
```

### Descargar cotización (con template)
```
GET /api/export/quote/:id
Headers: Authorization: Bearer {token}
Response: Archivo Excel descargado
```

### Descargar template de ejemplo
```
GET /api/export/quote-template
Headers: Authorization: Bearer {token}
Response: Archivo Excel de ejemplo
```

## Notas para desarrolladores

El sistema está en `backend/src/controllers/exportController.js`:
- `uploadTemplate()`: Maneja la subida
- `generateQuoteExcel()`: Lee el template y llena los datos
- `downloadQuoteTemplate()`: Genera el template de ejemplo

La lógica de reemplazo de placeholders itera todas las celdas y reemplaza cadenas de texto.
