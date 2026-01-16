# 📋 CÓMO SUBIR TU PROPIO TEMPLATE

## Lo que necesitas hacer:

### 1️⃣ Usa tu template actual
- Abre tu archivo Excel actual (el que tiene tu formato exacto)
- **NO necesitas crear uno nuevo** - usa el que tienes

### 2️⃣ Agregar los placeholders
En tu template Excel, en la celda donde varía los datos, escribe exactamente esto:

**Datos del Cliente:**
```
{{cliente}}        → Nombre del cliente
{{email}}          → Email
{{telefono}}       → Teléfono
{{direccion}}      → Dirección
{{ciudad}}         → Ciudad
{{fecha}}          → Fecha de la cotización
{{numero}}         → Número de cotización
```

**Sección de Productos - IMPORTANTE:**
En la fila donde empiezan los productos (la primera fila donde irá el primer producto), 
en la columna del ITEM, escribe:
```
{{items}}
```

Esto le dice al sistema: "aquí empieza la lista de productos, expande desde aquí"

**Totales:**
```
{{subtotal}}       → Subtotal sin IVA
{{iva}}            → IVA (19%)
{{total}}          → Total final
```

### 3️⃣ Estructura exacta del template

```
┌─────────────────────────────────────────┐
│ ENCABEZADO CON TU LOGO/DISEÑO           │
│ (no cambia)                             │
└─────────────────────────────────────────┘

DATOS DEL CLIENTE:
  Señores: {{cliente}}
  Email: {{email}}
  Teléfono: {{telefono}}
  Dirección: {{direccion}}
  Ciudad: {{ciudad}}

TABLA DE PRODUCTOS:
  ┌──────┬──────────────┬───────┬──────────┬──────────┐
  │ ITEM │ DESCRIPCIÓN  │ MARCA │ CANTIDAD │ TOTAL    │
  ├──────┼──────────────┼───────┼──────────┼──────────┤
  │{{items}}          │       │          │          │
  │ 1    │ [Producto 1] │       │ [cant]   │ [total]  │
  │ 2    │ [Producto 2] │       │ [cant]   │ [total]  │
  └──────┴──────────────┴───────┴──────────┴──────────┘

TOTALES:
  Subtotal: {{subtotal}}
  IVA (19%): {{iva}}
  TOTAL: {{total}}
```

### 4️⃣ Columnas exactas:

El sistema busca los datos en estas columnas:
- **Columna B (2)** = ITEM (número: 1, 2, 3...)
- **Columna C (3)** = DESCRIPCIÓN del producto
- **Columna D (4)** = MARCA
- **Columna E (5)** = REFERENCIA  
- **Columna F (6)** = UNIDAD
- **Columna G (7)** = CANTIDAD
- **Columna H (8)** = VALOR UNITARIO (precio)
- **Columna I (9)** = VALOR TOTAL

❌ Si uses otras columnas, no funcionará
✅ Si usas estas columnas, funcionará perfecto

### 5️⃣ Guardar el template

1. Abre Excel
2. Modifica tu template actual
3. Reemplaza los valores de datos con los placeholders `{{...}}`
4. **IMPORTANTE**: En la fila de productos, en la columna ITEM (B), escribe `{{items}}`
5. Guarda el archivo como `.xlsx`

### 6️⃣ Subir a la aplicación

1. Ve a **Admin → Configuración**
2. Busca "Template de Cotizaciones"
3. Haz click en "Subir Template"
4. Selecciona tu archivo Excel
5. Click en "Guardar"

## ✅ Listo!

Ahora cuando descargues una cotización:
- ✅ Se llenarán TODOS los placeholders
- ✅ Se mantendrá tu formato exacto (bordes, colores, fuentes)
- ✅ Se expandirán las filas automáticamente según los productos
- ✅ Sin perder nada

## Ejemplo de template CORRECTO:

Archivo: `cotizacion_template.xlsx`

```
FILA 1-3:     Logo y encabezado de la empresa
FILA 5:       SEÑORES: {{cliente}}
FILA 6:       EMAIL: {{email}}
FILA 7:       TELÉFONO: {{telefono}}
FILA 8:       DIRECCIÓN: {{direccion}}
FILA 9:       CIUDAD: {{ciudad}}

FILA 11:      [Encabezado tabla]
FILA 12:      ITEM │ DESC. │ MARCA │ REF │ UNI │ CANT │ PRECIO │ TOTAL
FILA 13:      {{items}} [Primera fila de productos]
FILA 14:      [En blanco, se llenará si hay 2+ productos]
FILA 15:      [En blanco, se llenará si hay 3+ productos]

FILA 18:      SUBTOTAL: {{subtotal}}
FILA 19:      IVA: {{iva}}
FILA 20:      TOTAL: {{total}}
```

## Si algo falla:

❌ "Los datos no aparecen"
→ Verifica que los placeholders están EXACTAMENTE como aparecen arriba (minúsculas, con {{ }})

❌ "{{items}} no funciona"
→ Debe estar en la columna B (ITEM), en la fila del primer producto
→ Debe estar SOLO en esa celda, sin más texto

❌ "Se pierden los bordes/colores"
→ El sistema ahora clona los estilos automáticamente
→ Si sigue pasando, avísame

❌ "No se expanden las filas"
→ Verifica que {{items}} esté en la fila 13 (o donde empiezan los productos)
→ Si tienes 5 productos, debe crear 5 filas automáticamente
