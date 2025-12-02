# Guía de Instalación Rápida - CLICK

## 🎯 Inicio Rápido (5 minutos)

### 1️⃣ Base de Datos (Ya está lista)
✅ Ya tienes MySQL Workbench con la base de datos `click_db` configurada.

### 2️⃣ Backend

```cmd
cd backend
npm install
```

Crea el archivo `backend\.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_PASSWORD_MYSQL
DB_NAME=click_db
JWT_SECRET=mi_clave_secreta_super_segura_2024
JWT_EXPIRES_IN=1d
```

Inicia el servidor:
```cmd
npm run dev
```

✅ Backend listo en `http://localhost:5000`

### 3️⃣ Frontend

```cmd
cd frontend
npm install
```

Crea el archivo `frontend\.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Inicia la aplicación:
```cmd
npm run dev
```

✅ Frontend listo en `http://localhost:3000`

### 4️⃣ Accede al Sistema

Abre el navegador en `http://localhost:3000`

**Credenciales:**
- Email: `admin@click.com`
- Password: `admin123`

---

## 🔥 Comandos Útiles

### Backend
```cmd
cd backend
npm run dev      # Modo desarrollo (con auto-reload)
npm start        # Modo producción
```

### Frontend
```cmd
cd frontend
npm run dev      # Modo desarrollo
npm run build    # Compilar para producción
npm run preview  # Vista previa de producción
```

---

## ✅ Verificación

### Probar Backend
```cmd
curl http://localhost:5000/api/health
```

Respuesta esperada:
```json
{"status":"OK","message":"CLICK API funcionando correctamente"}
```

### Probar Frontend
Abre `http://localhost:3000` - deberías ver la pantalla de login.

---

## 🎨 Funcionalidades Principales

1. **Dashboard** - Estadísticas en tiempo real
2. **Tickets** - Sistema de soporte técnico
3. **Clientes** - Gestión de clientes
4. **Inventario** - Control de productos
5. **Cotizaciones** - Crear y gestionar cotizaciones
6. **Ventas** - Registro de ventas
7. **Admin** - Gestión de usuarios y roles

---

## 🔑 Roles del Sistema

- **admin** - Acceso total
- **tecnico** - Gestión de tickets
- **comercial** - Ventas y cotizaciones
- **cliente** - Ver tickets y cotizaciones propias

---

## 📞 ¿Problemas?

1. **MySQL no conecta**: Verifica credenciales en `backend\.env`
2. **Puerto ocupado**: Cambia PORT en `.env` del backend
3. **CORS error**: Verifica que backend esté en puerto 5000

---

**¡Listo para usar! 🚀**
