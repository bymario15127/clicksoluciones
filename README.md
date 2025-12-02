# 🚀 CLICK - Sistema de Gestión Empresarial

Sistema completo de gestión para empresas que incluye tickets de soporte, inventario, cotizaciones y ventas.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Roles y Permisos](#roles-y-permisos)

## ✨ Características

### Frontend (React)
- ✅ Sistema de autenticación con JWT
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de tickets de soporte
- ✅ Administración de clientes
- ✅ Control de inventario/productos
- ✅ Sistema de cotizaciones
- ✅ Módulo de ventas
- ✅ Panel de administración de usuarios
- ✅ Protección de rutas por roles

### Backend (Node.js + Express)
- ✅ API RESTful completa
- ✅ Autenticación con JWT
- ✅ Control de acceso basado en roles
- ✅ Gestión de archivos con Multer
- ✅ Base de datos MySQL
- ✅ Validación y manejo de errores

### Base de Datos (MySQL)
- ✅ Esquema completo normalizado
- ✅ Relaciones entre tablas
- ✅ Índices optimizados
- ✅ Vistas y procedimientos almacenados

## 🛠️ Tecnologías

### Frontend
- React 18
- React Router DOM
- Axios
- Vite
- JWT Decode

### Backend
- Node.js
- Express
- MySQL2
- Bcrypt
- JSON Web Token
- Multer
- CORS

### Base de Datos
- MySQL 8.0+

## 📦 Requisitos Previos

- Node.js 18+ ([Descargar](https://nodejs.org/))
- MySQL 8.0+ ([Descargar](https://dev.mysql.com/downloads/))
- Git ([Descargar](https://git-scm.com/))

## 🚀 Instalación

### 1. Base de Datos

Como ya tienes MySQL Workbench, la base de datos está lista. El esquema completo está en `database/schema.sql`.

**Usuario por defecto:**
- Email: `admin@click.com`
- Password: `admin123`

### 2. Backend

```cmd
cd backend
npm install
```

Crea un archivo `.env` en la carpeta `backend`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=click_db
JWT_SECRET=tu_clave_secreta_jwt_muy_segura
JWT_EXPIRES_IN=1d
```

Inicia el servidor:

```cmd
npm run dev
```

El backend estará corriendo en `http://localhost:5000`

### 3. Frontend

```cmd
cd frontend
npm install
```

Crea un archivo `.env` en la carpeta `frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

Inicia la aplicación:

```cmd
npm run dev
```

El frontend estará corriendo en `http://localhost:3000`

## ⚙️ Configuración

### Configurar Base de Datos

1. Abre MySQL Workbench
2. Conecta a tu servidor MySQL
3. La base de datos `click_db` ya debe estar creada con todas las tablas

### Verificar Conexión

Prueba el endpoint de salud del backend:

```cmd
curl http://localhost:5000/api/health
```

Deberías recibir:
```json
{
  "status": "OK",
  "message": "CLICK API funcionando correctamente"
}
```

## 📖 Uso

### Iniciar Sesión

1. Abre `http://localhost:3000`
2. Usa las credenciales por defecto:
   - **Email:** admin@click.com
   - **Password:** admin123

### Flujo de Trabajo

1. **Administrador** crea usuarios y asigna roles
2. **Clientes** o usuarios crean tickets de soporte
3. **Técnicos** reciben y resuelven tickets
4. **Comerciales** crean cotizaciones desde el inventario
5. **Clientes** aprueban cotizaciones
6. **Comerciales** convierten cotizaciones en ventas

## 📁 Estructura del Proyecto

```
CLICK/
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/         # Context API
│   │   │   └── AuthContext.jsx
│   │   ├── pages/           # Páginas principales
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tickets.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Quotes.jsx
│   │   │   ├── Sales.jsx
│   │   │   └── Admin.jsx
│   │   ├── services/        # Servicios API
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   ├── tickets.js
│   │   │   ├── clients.js
│   │   │   ├── products.js
│   │   │   ├── quotes.js
│   │   │   └── sales.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración
│   │   │   └── database.js
│   │   ├── controllers/     # Controladores
│   │   │   ├── authController.js
│   │   │   ├── usersController.js
│   │   │   ├── ticketsController.js
│   │   │   ├── clientsController.js
│   │   │   ├── productsController.js
│   │   │   ├── quotesController.js
│   │   │   └── salesController.js
│   │   ├── middleware/      # Middleware
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── routes/          # Rutas
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── tickets.js
│   │   │   ├── clients.js
│   │   │   ├── products.js
│   │   │   ├── quotes.js
│   │   │   └── sales.js
│   │   └── server.js
│   ├── package.json
│   └── .env
│
└── database/
    └── schema.sql           # Esquema completo de BD
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios (Solo Admin)
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Tickets
- `GET /api/tickets` - Listar tickets
- `GET /api/tickets/:id` - Obtener ticket
- `POST /api/tickets` - Crear ticket
- `PUT /api/tickets/:id` - Actualizar ticket
- `DELETE /api/tickets/:id` - Eliminar ticket
- `POST /api/tickets/:id/comment` - Agregar comentario
- `POST /api/tickets/:id/upload` - Subir archivo

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Obtener cliente
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente
- `GET /api/clients/:id/history` - Historial del cliente

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto (Admin/Comercial)
- `PUT /api/products/:id` - Actualizar producto (Admin/Comercial)
- `DELETE /api/products/:id` - Eliminar producto (Admin)

### Cotizaciones
- `GET /api/quotes` - Listar cotizaciones
- `GET /api/quotes/:id` - Obtener cotización
- `POST /api/quotes` - Crear cotización (Admin/Comercial)
- `PUT /api/quotes/:id` - Actualizar cotización (Admin/Comercial)
- `DELETE /api/quotes/:id` - Eliminar cotización (Admin)
- `POST /api/quotes/:id/send` - Enviar cotización
- `POST /api/quotes/:id/approve` - Aprobar cotización
- `POST /api/quotes/:id/convert-to-sale` - Convertir a venta

### Ventas
- `GET /api/sales` - Listar ventas
- `GET /api/sales/:id` - Obtener venta
- `POST /api/sales` - Crear venta (Admin/Comercial)
- `GET /api/sales/:id/pdf` - Descargar PDF

## 👥 Roles y Permisos

### Administrador
- Acceso completo al sistema
- Gestión de usuarios y roles
- Configuraciones globales

### Técnico
- Ver y gestionar tickets
- Agregar comentarios y actualizaciones
- Cambiar estados de tickets

### Comercial
- Gestión de clientes
- Crear y gestionar productos
- Crear cotizaciones
- Procesar ventas

### Cliente
- Ver propios tickets
- Crear tickets de soporte
- Ver cotizaciones recibidas
- Aprobar/rechazar cotizaciones

## 🔒 Seguridad

- ✅ Contraseñas encriptadas con Bcrypt
- ✅ Autenticación JWT
- ✅ Tokens con expiración
- ✅ Middleware de autorización por roles
- ✅ Validación de datos de entrada
- ✅ Protección contra SQL Injection (prepared statements)

## 🐛 Solución de Problemas

### El backend no conecta a MySQL

1. Verifica que MySQL esté corriendo
2. Revisa las credenciales en `.env`
3. Confirma que la base de datos `click_db` existe

### Error de CORS

Verifica que el frontend esté configurado correctamente en `vite.config.js` y que el backend tenga CORS habilitado.

### Token inválido o expirado

Cierra sesión y vuelve a iniciar sesión. Los tokens JWT expiran después de 1 día por defecto.

## 📝 Próximas Mejoras

- [ ] Generación de PDF para ventas
- [ ] Sistema de notificaciones en tiempo real
- [ ] Dashboard con gráficos avanzados
- [ ] Exportar datos a Excel
- [ ] Sistema de backup automático
- [ ] Auditoría de cambios
- [ ] Integración con servicios de email

## 📄 Licencia

Este proyecto es de uso privado para CLICK.

## 👨‍💻 Soporte

Para soporte técnico, contacta al administrador del sistema.

---

**Desarrollado con ❤️ para CLICK**
