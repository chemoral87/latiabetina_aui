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
      <v-btn color="primary" outlined class="mr-2" @click="cancel">Cancelar</v-btn>
      <v-btn color="primary" @click="save">Guardar</v-btn>
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

- El botón Cancelar debe usar `color="primary"`, `outlined` y `class="mr-2"`.
- El botón Guardar debe usar `color="primary"` sin `outlined`.
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
| Permisos / Roles | `mdi-shield-key-outline` | `primary` |
| Crear nuevo elemento | `mdi-plus-circle-outline` | `success` |
| Configuración | `mdi-cog-outline` | `primary` |
| Usuario | `mdi-account-outline` | `primary` |
| Organización | `mdi-domain` | `primary` |
| Eliminar / Remover | `mdi-delete-outline` | `error` |

### 3.2 En botones

Usar `v-icon` dentro del botón para acciones específicas.

```html
<v-btn color="success" @click="create">
  <v-icon left>mdi-plus</v-icon>
  Crear
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
- `mdi-pencil` para editar.
- `mdi-delete` / `mdi-delete-outline` para eliminar.
- `mdi-content-save` para guardar.
- `mdi-close` / `mdi-arrow-left` para cancelar o volver.
- Preferir `small` en títulos y `x-small` en acciones compactas.

---

## 4. Estructura de secciones

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

## 5. Espaciado y utilidades de Vuetify

- Usar `pa-*`, `ma-*`, `px-*`, `py-*`, `mr-*`, `ml-*`, `mt-*`, `mb-*` para espaciados.
- Usar `d-flex`, `justify-end`, `justify-start`, `align-center`, `flex-wrap` para disposición.
- Evitar clases de CSS personalizadas cuando Vuetify ya ofrece una alternativa.
- Para agrupar elementos en una fila, preferir `d-flex flex-wrap` y clases de margen en vez de `gap-*`.

---

## 6. Formularios y tablas

- Usar `v-text-field`, `v-select`, `v-autocomplete`, `v-checkbox` y `v-switch` según el caso.
- Para tablas, usar `v-data-table` con `dense` y `mobile-breakpoint="0"` cuando sea necesario.
- Para chips o etiquetas, usar `v-chip` con `color="primary"`, `small` o `x-small`.
- Para acciones secundarias, usar `v-btn icon`, `v-btn text` o `v-btn outlined` según corresponda.