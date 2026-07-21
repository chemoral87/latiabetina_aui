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
- El botón **Nuevo** / **Agregar** / **Crear** debe usar siempre `color="success"` (verde) con icono `mdi-plus` a la izquierda. No usar `primary` para acciones de alta.
- No usar `gap-2`, `ml-2` ni `mr-1` para separar Cancelar y Guardar.

---

## 3. Uso de iconos (Material Design Icons)

### 3.1 Posición del icono: leading (inicio) vs trailing (final)

#### Leading icon (inicio)

Usar cuando el icono **identifica el tipo** de input o acción — p. ej. lupa en un campo de búsqueda, correo en un email, candado en una contraseña, calendario en un date picker, `+` en un botón "Agregar".

- Mejora el escaneo: el usuario reconoce el tipo de campo/acción antes de leer la etiqueta.
- Es lo más común en inputs de formulario (buscar, filtrar, email, teléfono, fecha).
- En Vuetify: `prepend-icon`, `prepend-inner-icon`, o `v-icon left` en botones.

#### Trailing icon (final)

Usar cuando el icono representa una **acción sobre el contenido** — p. ej. limpiar (`x`), chevron de dropdown, mostrar/ocultar contraseña, copiar.

- En botones, los iconos trailing suelen indicar **dirección o progreso** — "Siguiente →", "Continuar →", "Descargar ↓", o enlace externo (↗).
- Los iconos leading en botones suelen indicar el **tipo de acción** — "+ Agregar", "Eliminar", "← Volver".
- En Vuetify: `append-icon`, `append-inner-icon`, `clearable`, o `v-icon right` en botones.

#### Reglas rápidas

| Caso | Posición |
| --- | --- |
| Acciones de dirección/progreso (Siguiente, Continuar, Descargar, Enviar) | Icono al **final** (`right`) |
| Acciones de retroceso/cancelar (Volver, Cancelar) | Icono al **inicio** (`left`) |
| Iconos de categoría en inputs (buscar, email, usuario, calendario) | Icono al **inicio** del input (`prepend-*`) |
| Iconos utilitarios/interactivos en inputs (limpiar, ver contraseña, dropdown) | Icono al **final** (`append-*` / `clearable`) |

- No poner iconos en ambos lados salvo que uno sea claramente interactivo (p. ej. clear) y el otro decorativo/categórico (p. ej. lupa) — esa combinación es válida y común.
- Mantener la convención consistente en toda la app: un tipo de icono → siempre la misma posición.

```html
<!-- Input: categoría al inicio, clear al final -->
<v-text-field v-model="filterText" prepend-inner-icon="mdi-magnify" clearable hide-details dense
  placeholder="Filtro" />

<!-- Botón: tipo de acción al inicio -->
<v-btn color="success" @click="create">
  <v-icon left>mdi-plus</v-icon>
  Agregar
</v-btn>

<!-- Botón: progreso al final -->
<v-btn color="primary" @click="next">
  Siguiente
  <v-icon right>mdi-arrow-right</v-icon>
</v-btn>
```

### 3.2 En títulos de tarjetas

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
| Eliminar / Remover | `mdi-delete` | `error` |

### 3.3 En botones

Usar siempre `v-icon` dentro de los botones de acción para identificar visualmente la operación.

- **Tipo de acción** (Agregar, Guardar, Eliminar, Cancelar, Refrescar): icono al **inicio** con `left`.
- **Dirección / progreso** (Siguiente, Continuar, Descargar): icono al **final** con `right`.

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

<v-btn color="primary" @click="next">
  Siguiente
  <v-icon right>mdi-arrow-right</v-icon>
</v-btn>
```

### 3.4 En la barra de navegación

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
- `mdi-delete` para eliminar.
- `mdi-content-save` para guardar.
- `mdi-close` / `mdi-arrow-left` para cancelar o volver (icono al inicio).
- Preferir `small` en títulos y `x-small` en acciones compactas.
- Siempre incluir `v-icon left` en los botones Cancelar (`mdi-close`) y Guardar (`mdi-content-save`).
- En campos de filtro/búsqueda: `prepend-inner-icon="mdi-magnify"` (categoría) + `clearable` (acción al final).
- En formularios y diálogos: **cada input** debe incluir un icono leading (`prepend-inner-icon`) que identifique el tipo de campo. Ver sección 9.

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
- Para ver el icono según el contexto, consultar la tabla de la sección 3.2.
- Usar `hide-one` en `organization-select` dentro de diálogos. Cuando solo hay una organización, el select se oculta pero el `org_id` se sigue enviando en el payload porque el `v-model` mantiene el valor auto-seleccionado.
- Cuando `hide-one` oculta el select, la **columna contenedora** (`v-col`) también debe colapsar para no dejar espacio en blanco: usar `:hidden.sync="orgSelectHidden"` en el select y `v-if="!orgSelectHidden"` en el `v-col`. Inicializar `orgSelectHidden: false` en `data()` y resetearlo a `false` al abrir el diálogo para que el select pueda volver a montarse.
- **Solo en modo Nuevo:** mostrar `organization-select` y enviar `org_id` en el create. En **modo Editar**, no mostrar el select (`v-if="!isEditMode"`) y **no incluir `org_id`** en el payload del update (ni en el diálogo ni en la página que llama al endpoint). La organización de un registro existente no se cambia desde el formulario de edición.
- Cada campo del formulario del diálogo debe llevar `prepend-inner-icon` (ver sección 9).

Ejemplo (organización solo al crear, columna colapsa si `hide-one`):

```html
<v-col v-if="!isEditMode && !orgSelectHidden" cols="12" md="6">
  <organization-select v-model="item.org_id" permission="page-permission" hide-one outlined
    prepend-inner-icon="mdi-domain" :hidden.sync="orgSelectHidden" :rules="[$vrules.required]" />
</v-col>
```

```js
data() {
  return {
    orgSelectHidden: false,
    // ...
  }
},
// Al abrir el diálogo:
this.orgSelectHidden = false

save() {
  if (!this.isValid || this.loading) return
  const payload = Object.assign({}, this.item)
  if (this.isEditMode) {
    delete payload.org_id
  }
  this.$emit("save", payload)
},
isValid() {
  if (!(this.item.name && this.item.name.trim().length > 0)) return false
  return this.isEditMode || !!this.item.org_id
},
```

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

1. **Filtro / búsqueda** — `v-text-field` con `prepend-inner-icon="mdi-magnify"`, `clearable`, `hide-details` y `dense` a la izquierda.
2. **Botón Refrescar** — `color="primary"`, con icono `mdi-reload`.
3. **Botón Nuevo / Agregar** — `color="success"`, con icono `mdi-plus`. El texto puede ser "Nuevo", "Agregar", "Nueva Red", etc.
4. **Botones adicionales** (ej: Dashboard, Reportes) — van al final, con `color="info"` u otro según corresponda.

### Ejemplo

```html
<v-container fluid>
  <v-row dense>
    <v-col cols="12" md="4" sm="6">
      <v-text-field v-model="filterText" prepend-inner-icon="mdi-magnify" clearable hide-details dense
        placeholder="Filtro" />
    </v-col>
    <v-col cols="auto" class="d-flex align-center">
      <v-btn color="primary" :loading="loading" class="mr-1" @click="refresh">
        <v-icon left>mdi-reload</v-icon>
        Refrescar
      </v-btn>
      <v-btn color="success" class="mr-1" @click="create">
        <v-icon left>mdi-plus</v-icon>
        Nuevo
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
- El filtro debe usar `prepend-inner-icon="mdi-magnify"` (categoría al inicio), `clearable` (acción al final), `hide-details` y `dense`.
- Refrescar es `color="primary"` y va antes que Nuevo / Agregar.
- Nuevo / Agregar / Crear es siempre `color="success"` (verde), nunca `primary`.
- Los botones adicionales (Dashboard, Reportes, etc.) van al final.
- Usar `class="mr-1"` entre botones para separarlos.


### Filtro por organización

Cuando una página de listado tiene un campo `org_id`, agregar un filtro de organización con `hide-one`. La columna debe colapsar cuando el select está oculto para evitar espacio vacío:

```html
<v-col v-if="!orgFilterHidden" cols="auto">
  <organization-select v-model="filterOrgId" :hidden.sync="orgFilterHidden" permission="page-permission" hide-one dense hide-details clearable
    outlined />
</v-col>
```

En `data()`:

```js
filterOrgId: null,
orgFilterHidden: false,
```

En `watch`:

```js
filterOrgId(value) {
  const overrides = { page: 1 }
  if (value) {
    overrides.org_id = value
  } else {
    overrides.org_id = undefined
  }
  this.loadItems(overrides)
},
```

### Reglas

- Colocar el filtro de organización **después** de los botones de acción.
- Usar `hide-one` para ocultar el select cuando solo hay una organización disponible (el valor se sigue enviando en el payload de la consulta).
- Usar `:hidden.sync="orgFilterHidden"` en el `organization-select` para recibir el estado de visibilidad.
- Usar `v-if="!orgFilterHidden"` en el `v-col` contenedor para que la columna colapse cuando el select está oculto.
- Inicializar `orgFilterHidden: false` en `data()`.
- Usar `dense hide-details clearable outlined` para mantener el estilo compacto.
- El `permission` debe coincidir con el permiso de la página (ej: `church-event-index`, `auditorium-index`).
- En el `watch`, agregar un handler que reconsulte con el `org_id` o lo elimine si está vacío.

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

### 9.1 Iconos en cada input

Cada campo de formulario (`v-text-field`, `v-textarea`, `v-select`, `organization-select`, etc.) debe incluir un icono leading con `prepend-inner-icon` que identifique el tipo de dato. El icono va al **inicio**; acciones utilitarias (`clearable`, dropdown) van al **final**.

```html
<v-text-field v-model="item.name" label="Nombre" prepend-inner-icon="mdi-account-outline" />
<v-text-field v-model="item.phone_number" label="Teléfono" prepend-inner-icon="mdi-phone" />
<v-text-field v-model="item.link" label="Enlace" prepend-inner-icon="mdi-link" />
<v-textarea v-model="item.description" label="Descripción" prepend-inner-icon="mdi-text-box-outline" />
<organization-select v-model="item.org_id" prepend-inner-icon="mdi-domain" hide-one outlined />
```

| Tipo de campo | Icono sugerido |
| --- | --- |
| Organización | `mdi-domain` |
| Nombre / persona | `mdi-account-outline` |
| Teléfono | `mdi-phone` |
| Email | `mdi-email-outline` |
| Categorías / etiquetas | `mdi-tag-multiple-outline` |
| Enlace / URL | `mdi-link` |
| Descripción / texto largo | `mdi-text-box-outline` |
| Fecha | `mdi-calendar` (o componente `MyDatePicker` / `MyDateRange`) |
| Hora | `mdi-clock-outline` |
| Ubicación / dirección | `mdi-map-marker-outline` |
| Búsqueda / filtro | `mdi-magnify` |

### Reglas

- Usar siempre `prepend-inner-icon` (no `append-icon`) para iconos de categoría en inputs.
- Preferir variantes `mdi-*-outline` cuando existan.
- No omitir el icono en campos de diálogos o formularios de creación/edición.
- `organization-select` acepta `prepend-inner-icon` vía `$attrs`; pasarlo explícitamente.