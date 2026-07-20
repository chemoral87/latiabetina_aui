# UI Guidelines - latiabetina_aui

---

## 1. Uso de Vuetify como base

Todas las interfaces nuevas y las modificaciones de UI deben construirse con componentes de Vuetify y clases utilitarias de Vuetify. No usar clases de Tailwind ni CSS ad-hoc cuando exista un equivalente en Vuetify.

### Regla general

- Preferir `v-container`, `v-row`, `v-col`, `v-card`, `v-btn`, `v-text-field`, `v-select`, `v-data-table`, `v-dialog` y `v-chip`.
- Usar clases como `d-flex`, `justify-end`, `align-center`, `flex-wrap`, `pa-*`, `ma-*`, `mr-*`, `ml-*`, `mb-*`, `mt-*`, `text-subtitle-1`, `font-weight-medium`.
- Mantener la estructura semántica de Vuetify para que la UI sea consistente con el resto del proyecto.

### Ejemplo base

```html
<v-container fluid>
  <v-row dense>
    <v-col cols="12" md="6">
      <v-card outlined>
        <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
          <v-icon left small color="primary">mdi-shield-key-outline</v-icon>
          Título de la sección
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="name" label="Nombre" dense hide-details />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</v-container>
```

---

## 2. Botones de acción

Los botones de acción deben alinearse a la derecha con `justify-end` y agruparse dentro de una tarjeta de acciones (`v-card outlined`). Para el par Cancelar / Guardar, usar `mr-2` en Cancelar.

### Correcto

```html
<v-col cols="12">
  <v-card outlined>
    <v-card-text class="d-flex justify-end pa-4">
      <v-btn color="primary" outlined class="mr-2" @click="cancel">
        <v-icon left>mdi-close</v-icon>
        Cancelar
      </v-btn>
      <v-btn color="primary" @click="save">
        <v-icon left>mdi-content-save</v-icon>
        Guardar
      </v-btn>
    </v-card-text>
  </v-card>
</v-col>
```

### Incorrecto

```html
<v-col cols="12" class="d-flex justify-start">
  <v-btn ...>Cancelar</v-btn>
  <v-btn ...>Guardar</v-btn>
</v-col>
```

### Reglas

- El botón Cancelar debe usar `color="primary"`, `outlined` y `class="mr-2"`. Incluir icono `mdi-close` a la izquierda.
- El botón Guardar debe usar `color="primary"` sin `outlined`. Incluir icono `mdi-content-save` a la izquierda.
- No usar `gap-2`, `ml-2` ni `mr-1` para separar Cancelar y Guardar.

---

## 3. Uso de iconos (Material Design Icons)

### 3.1 En títulos de tarjetas

Cada `v-card-title` debe incluir un icono a la izquierda para identificar la sección.

```html
<v-card outlined>
  <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
    <v-icon left small color="primary">mdi-shield-key-outline</v-icon>
    Título de la sección
  </v-card-title>
</v-card>
```

| Propósito | Icono sugerido | Color |
| --- | --- | --- |
| Permisos / Roles (nuevo) | `mdi-shield-key-outline` | `primary` |
| Permisos / Roles (editar) | `mdi-redhat` | `primary` |
| Usuario (nuevo / editar) | `mdi-account-outline` | `primary` |
| Organización (nuevo / editar) | `mdi-domain` | `primary` |
| Crear nuevo elemento (botón tabla) | `mdi-plus-circle-outline` | `success` |
| Configuración | `mdi-cog-outline` | `primary` |
| Eliminar / Remover | `mdi-delete-outline` | `error` |

### 3.2 En botones

Usar siempre `v-icon` dentro de los botones de acción para identificar visualmente la operación. Colocar el icono a la izquierda con la clase `left`.

```html
<v-btn color="success" @click="create">
  <v-icon left>mdi-plus</v-icon>
  Crear
</v-btn>

<v-btn color="primary" outlined class="mr-2" @click="close">
  <v-icon left>mdi-close</v-icon>
  Cancelar
</v-btn>

<v-btn color="primary" @click="save">
  <v-icon left>mdi-content-save</v-icon>
  Guardar
</v-btn>
```

### 3.3 En la barra de navegación

Al emitir `setNavBar`, incluir un icono descriptivo.

```js
eventBus.$emit("setNavBar", {
  title: "Rol Administrador",
  icon: "mdi-redhat",
  back: "/role",
  show_drawer: false,
})
```

### Convenciones generales

- `mdi-*outline` para elementos pasivos o contenedores.
- `mdi-plus` / `mdi-plus-circle` para crear.
- `mdi-pencil` para editar (en tablas y acciones, no en títulos de diálogos).
- En títulos de diálogos, usar siempre el icono de la entidad (`mdi-account-outline`, `mdi-domain`, etc.) tanto para nuevo como para editar.
- `mdi-delete` / `mdi-delete-outline` para eliminar.
- `mdi-content-save` para guardar.
- `mdi-close` / `mdi-arrow-left` para cancelar o volver.
- Preferir `small` en títulos y `x-small` en acciones compactas.
- Siempre incluir `v-icon left` en los botones Cancelar (`mdi-close`) y Guardar (`mdi-content-save`).

---

## 4. Diálogos (v-dialog)

Los diálogos modales deben seguir esta estructura:

```html
<v-dialog :value="true" persistent max-width="400px">
  <v-card>
    <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
      <v-icon left small color="primary">mdi-icon-name</v-icon>
      Título del diálogo
      <v-spacer />
      <v-btn icon x-small @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Contenido del formulario -->
    </v-card-text>

    <v-card-actions class="pa-4">
      <v-spacer />
      <v-btn color="primary" outlined class="mr-2" @click="close">
        <v-icon left>mdi-close</v-icon>
        Cancelar
      </v-btn>
      <v-btn color="primary" @click="save">
        <v-icon left>mdi-content-save</v-icon>
        Guardar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
```

### Reglas

- El `v-card-title` debe incluir un icono a la izquierda y un botón de cierre (X) con `mdi-close` en la esquina derecha.
- El botón de cierre debe ser `v-btn icon x-small` con `v-icon>mdi-close</v-icon>`.
- Los botones de acción (Cancelar / Guardar) deben ir dentro de `v-card-actions class="pa-4"` con un `v-spacer` antes.
- Usar `persistent` en `v-dialog` para evitar cerrar al hacer clic fuera.
- - Para ver el icono según el contexto, consultar la tabla de la sección 3.1.
- Usar `hide-one` en `organization-select` dentro de diálogos. Cuando solo hay una organización, el select se oculta pero el `org_id` se sigue enviando en el payload porque el `v-model` mantiene el valor auto-seleccionado.

---

## 5. Diálogo de confirmación de eliminación

Los diálogos de confirmación para eliminar deben seguir esta estructura:

```html
<v-dialog :value="true" persistent max-width="400px">
  <v-card>
    <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
      <v-icon left small color="error">mdi-alert</v-icon>
      Título del diálogo
      <v-spacer />
      <v-btn icon x-small @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <div class="text-body-1 text--primary">
        ¿Desea eliminar <strong>elemento</strong>?
      </div>
      <div class="text-caption grey--text mt-2">Esta acción no se puede deshacer</div>
    </v-card-text>

    <v-card-actions class="pa-4">
      <v-spacer />
      <v-btn color="error" outlined class="mr-2" :disabled="loading" @click="close">
        <v-icon left>mdi-close</v-icon>
        NO
      </v-btn>
      <v-btn color="primary" :loading="loading" @click="ok">
        <v-icon left>mdi-check</v-icon>
        SI
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
```

### Reglas

- El título usa icono `mdi-alert` con `color="error"`.
- El botón **NO** usa `color="error"`, `outlined`, `class="mr-2"` con icono `mdi-close`.
- El botón **SI** usa `color="primary"` con icono `mdi-check`.
- Incluir el texto "Esta acción no se puede deshacer" como advertencia.
- Usar `persistent` para evitar cerrar al hacer clic fuera.
- El botón de cierre (X) debe ser `v-btn icon x-small` con `mdi-close`.

---

## 6. Toolbar de índices (páginas de listado)

En las páginas de listado (index), la barra de herramientas debe seguir este orden:

1. **Filtro / búsqueda** — `v-text-field` con `append-icon="mdi-magnify"` a la izquierda.
2. **Botón Refrescar** — `color="primary"`, con icono `mdi-reload`.
3. **Botón Agregar** — `color="success"`, con icono `mdi-plus`.
4. **Botones adicionales** (ej: Dashboard, Reportes) — van al final, con `color="info"` u otro según corresponda.

### Ejemplo

```html
<v-container fluid>
  <v-row dense>
    <v-col cols="12" md="4" sm="6">
      <v-text-field v-model="filterText" append-icon="mdi-magnify" clearable hide-details
        placeholder="Buscar..." />
    </v-col>
    <v-col cols="auto" class="d-flex align-center">
      <v-btn color="primary" :loading="loading" class="mr-1" @click="refresh">
        <v-icon left>mdi-reload</v-icon>
        Refrescar
      </v-btn>
      <v-btn color="success" class="mr-1" @click="create">
        <v-icon left>mdi-plus</v-icon>
        Agregar
      </v-btn>
      <v-btn color="info" @click="goToDashboard">
        <v-icon left>mdi-chart-box</v-icon>
        Dashboard
      </v-btn>
    </v-col>

    <v-col cols="12">
      <!-- Tabla -->
    </v-col>
  </v-row>
</v-container>
```

### Reglas

- El filtro debe ser el primer elemento, ocupando un ancho controlado (`md="4" sm="6"`).
- Refrescar es `color="primary"` y va antes que Agregar.
- Agregar es `color="success"` (verde).
- Los botones adicionales (Dashboard, Reportes, etc.) van al final.
- Usar `class="mr-1"` entre botones para separarlos.

### Filtro por organización

Cuando una página de listado tiene un campo `org_id`, agregar un filtro de organización con `hide-one`:

```html
<v-col cols="auto">
  <organization-select v-model="filterOrgId" permission="page-permission" hide-one dense hide-details clearable
    outlined />
</v-col>
```

### Reglas

- Colocar el filtro de organización **después** de los botones de acción.
- Usar `hide-one` para ocultar el select cuando solo hay una organización disponible (el valor se sigue enviando en el payload de la consulta).
- Usar `dense hide-details clearable outlined` para mantener el estilo compacto.
- El `permission` debe coincidir con el permiso de la página (ej: `church-event-index`, `auditorium-index`).
- En el `watch`, agregar un handler que reconsulte con el `org_id` o lo elimine si está vacío.

---

---

## 7. Estructura de secciones

Cada sección funcional debe ir dentro de su propia tarjeta (`v-card outlined`) y dentro de un `v-col cols="12"`.

```html
<v-col cols="12">
  <v-card outlined>
    <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
      <v-icon left small color="primary">mdi-icon-name</v-icon>
      Título de la sección
    </v-card-title>
    <v-card-text>
      <!-- Contenido -->
    </v-card-text>
  </v-card>
</v-col>
```

---

## 8. Espaciado y utilidades de Vuetify

- Usar `pa-*`, `ma-*`, `px-*`, `py-*`, `mr-*`, `ml-*`, `mt-*`, `mb-*` para espaciados.
- Usar `d-flex`, `justify-end`, `justify-start`, `align-center`, `flex-wrap` para disposición.
- Evitar clases de CSS personalizadas cuando Vuetify ya ofrece una alternativa.
- Para agrupar elementos en una fila, preferir `d-flex flex-wrap` y clases de margen en vez de `gap-*`.

---

## 9. Formularios y tablas

- Usar `v-text-field`, `v-select`, `v-autocomplete`, `v-checkbox` y `v-switch` según el caso.
- Para tablas, usar `v-data-table` con `dense` y `mobile-breakpoint="0"` cuando sea necesario.
- Para chips o etiquetas, usar `v-chip` con `color="primary"`, `small` o `x-small`.
- Para acciones secundarias, usar `v-btn icon`, `v-btn text` o `v-btn outlined` según corresponda.