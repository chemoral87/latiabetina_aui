# Sistema de Notificaciones en Tiempo Real

## Configuración Implementada

### 1. Paquetes Instalados

- `laravel-echo`: Cliente para escuchar eventos de Laravel
- `pusher-js`: Driver de WebSocket compatible con Laravel Broadcasting

### 2. Plugin Echo (`plugins/echo.js`)

Configurado con los siguientes parámetros:

- **Key**: `latiabetina-key`
- **Host**: `127.0.0.1`
- **Port**: `6001`
- **Scheme**: `http`
- **Cluster**: `mt1`

### 3. Store Vuex (`store/index.js`)

Agregado:

- **State**: `notificationRealTimeArray` - Array para almacenar notificaciones
- **Getter**: `notificationRealTimeArray` - Obtener notificaciones
- **Mutations**:
  - `ADD_NOTIFICATION_REAL_TIME` - Agregar notificación
  - `CLEAR_NOTIFICATIONS_REAL_TIME` - Limpiar notificaciones
- **Actions**:
  - `addNotificationRealTime` - Despachar nueva notificación
  - `clearNotificationsRealTime` - Limpiar todas las notificaciones

### 4. Componente de Notificaciones

Creado: `components/Notification/RealTimeList.vue`

- Muestra badge con contador de notificaciones
- Lista de notificaciones con iconos y timestamps
- Botón para limpiar notificaciones

## Uso en la Página

### Escuchar Eventos en un Componente

```vue
<script>
export default {
  data() {
    return {
      echoChannel: null,
    }
  },
  mounted() {
    this.setupRealtimeListeners()
  },
  beforeDestroy() {
    // Limpiar canal al destruir componente
    if (this.echoChannel) {
      this.$echo.leave(`canal-nombre`)
    }
  },
  methods: {
    setupRealtimeListeners() {
      // Suscribirse a un canal
      const channelName = `auditorium-event.${this.eventId}`
      this.echoChannel = this.$echo.channel(channelName)

      // Escuchar evento específico
      this.echoChannel.listen(".seat.updated", (data) => {
        console.log("Datos recibidos:", data)

        // Agregar a store
        this.$store.dispatch("addNotificationRealTime", {
          type: "seat.updated",
          data: data,
          timestamp: data.timestamp,
          message: "Asientos actualizados",
        })

        // Actualizar UI local
        this.updateLocalData(data)
      })

      // Escuchar otro evento
      this.echoChannel.listen(".notification.created", (data) => {
        this.$store.dispatch("addNotificationRealTime", {
          type: "notification.created",
          data: data,
          timestamp: data.timestamp || new Date().toISOString(),
          message: data.message,
        })
        this.$notify.success(data.message)
      })
    },
  },
}
</script>
```

### Mostrar Notificaciones en el Layout

Agregar el componente en tu navbar o layout:

```vue
<template>
  <v-app-bar>
    <!-- Otros elementos -->
    <NotificationRealTimeList />
  </v-app-bar>
</template>
```

### Acceder a las Notificaciones desde Cualquier Componente

```vue
<script>
export default {
  computed: {
    notifications() {
      return this.$store.getters.notificationRealTimeArray
    },
    notificationCount() {
      return this.notifications.length
    },
  },
}
</script>
```

## Tipos de Canales

### Canal Público

```javascript
this.$echo.channel("nombre-canal").listen(".evento", (data) => {
  console.log(data)
})
```

### Canal Privado

```javascript
this.$echo.private("nombre-canal").listen(".evento", (data) => {
  console.log(data)
})
```

### Canal de Presencia

```javascript
this.$echo
  .join("nombre-canal")
  .here((users) => {
    console.log("Usuarios conectados:", users)
  })
  .joining((user) => {
    console.log("Usuario se unió:", user)
  })
  .leaving((user) => {
    console.log("Usuario salió:", user)
  })
  .listen(".evento", (data) => {
    console.log(data)
  })
```

## Eventos Laravel

### Crear Evento en Laravel

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class NotificationCreated implements ShouldBroadcast
{
    public $notification;

    public function __construct($notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'message' => $this->notification->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
```

### Disparar Evento

```php
use App\Events\NotificationCreated;

event(new NotificationCreated($notification));
```

## Verificación

### 1. Verificar WebSocket Server

```bash
php artisan websockets:serve --host=0.0.0.0 --port=6001
```

### 2. Ver Dashboard de WebSockets

Visitar: `http://127.0.0.1:8000/laravel-websockets`

### 3. Verificar Conexión en Consola del Navegador

Deberías ver:

```
✅ WebSocket connected successfully
📡 Subscribing to channel: auditorium-event.123
✅ Real-time listeners set up successfully
```

## Debugging

### Verificar Estado del Store

```javascript
// En consola del navegador
$nuxt.$store.state.notificationRealTimeArray
```

### Verificar Instancia Echo

```javascript
// En consola del navegador
$nuxt.$echo
```

### Ver Canales Suscritos

```javascript
// En consola del navegador
Object.keys($nuxt.$echo.connector.channels)
```

## Ejemplo Completo

La implementación actual en `pages/auditorium-event/_id/mark/index.vue` muestra:

1. ✅ Suscripción al canal del evento
2. ✅ Escucha de eventos de actualización de asientos
3. ✅ Actualización local de la UI
4. ✅ Almacenamiento en store de Vuex
5. ✅ Limpieza del canal al destruir componente

## Notas Importantes

1. **Autenticación**: Si usas canales privados, asegúrate de que el token JWT esté configurado correctamente en `plugins/echo.js`

2. **Performance**: Considera limpiar notificaciones antiguas periódicamente para no sobrecargar el store

3. **Reconexión**: Laravel Echo maneja automáticamente la reconexión si se pierde la conexión

4. **CORS**: Asegúrate de que tu servidor Laravel tiene CORS configurado correctamente para el puerto 6001
