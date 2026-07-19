# 🎨 Guías de UI — latiabetina_aui

---

## 1. Botones de acción

**Regla:** Los botones de acción (Cancelar / Guardar) deben estar alineados a la **izquierda** (`justify-start`) y envueltos en una tarjeta (`v-card outlined`) para mantener consistencia visual con el resto de las secciones.

### ✅ Correcto

```html
<v-col cols="12">
  <v-card outlined>
    <v-card-text class="d-flex justify-start gap-2 pa-4">
      <v-btn color="primary" outlined @click="cancel">Cancelar</v-btn>
      <v-btn color="primary" @click="save">Guardar</v-btn>
    </v-card-text>
  </v-card>
</v-col>
```

### ❌ Incorrecto

```html
<!-- Sin tarjeta, alineación implícita o derecha -->
<v-col cols="12" class="d-flex justify-end">
  <v-btn ...>Cancelar</v-btn>
  <v-btn ...>Guardar</v-btn>
</v-col>
```

### Notas

- Usar la clase `gap-2` para espaciado entre botones (equivale a `gap: 8px`).
- El botón **Cancelar** debe ser `outlined` (menor peso visual).
- El botón **Guardar** debe ser `color="primary"` sólido (mayor peso visual).
- No usar `ml-2`, `mr-1` ni clases de margen manuales entre botones; `gap-2` es suficiente.

---

## 2. Uso de iconos (Material Design Icons)

### 2.1 En títulos de tarjetas

Cada `v-card-title` debe incluir un **icono a la izquierda** para identificar visualmente la sección.

**Patrón:**

```html
<v-card outlined>
  <v-card-title class="subtitle-1 font-weight-medium pb-2">
    <v-icon left small color="primary">mdi-shield-key-outline</v-icon>
    Título de la sección
  </v-card-title>
</v-card>
```

| Propósito              | Icono sugerido              | Color         |
| ---------------------- | --------------------------- | ------------- |
| Permisos / Roles       | `mdi-shield-key-outline`    | `primary`     |
| Crear nuevo elemento   | `mdi-plus-circle-outline`   | `success`     |
| Configuración          | `mdi-cog-outline`           | `primary`     |
| Usuario                | `mdi-account-outline`       | `primary`     |
| Organización           | `mdi-domain`                | `primary`     |
| Eliminar / Remover     | `mdi-delete-outline`        | `error`       |

### 2.2 En botones

Usar `v-icon left` dentro del botón para acciones específicas:

```html
<v-btn color="success" @click="create">
  <v-icon left>mdi-plus</v-icon>
  Crear
</v-btn>
```

### 2.3 En la barra de navegación

Al emitir el evento `setNavBar`, incluir un icono descriptivo:

```js
eventBus.$emit("setNavBar", {
  title: "Rol Administrador",
  icon: "mdi-redhat",
  back: "/role",
  show_drawer: false,
})
```

### Convenciones generales de iconos

- `mdi-*outline` para elementos pasivos o contenedores.
- `mdi-plus` / `mdi-plus-circle` para acciones de creación.
- `mdi-pencil` para editar.
- `mdi-delete` / `mdi-delete-outline` para eliminar.
- `mdi-content-save` para guardar.
- `mdi-close` / `mdi-arrow-left` para cancelar o volver.
- Usar `small` o `x-small` según el contexto; preferir `small` en títulos.

---

## 3. Separación por tarjetas (cards)

Cada sección funcional de una página debe estar envuelta en su propia tarjeta (`<v-card outlined>`).

### Reglas

1. **Una tarjeta por sección.** Cada bloque lógico (permisos, creación, acciones, etc.) va en su propia `v-card`.
2. **Usar `outlined`** para un estilo limpio y sutil, sin sombra excesiva.
3. **Todas las tarjetas deben estar dentro de `v-col cols="12"`** para que ocupen todo el ancho disponible.
4. **Cada tarjeta debe tener un título con icono**, como se describe en la sección 2.1.

### Estructura típica

```html
<v-container>
  <v-row>
    <!-- Sección 1 -->
    <v-col cols="12">
      <v-card outlined>
        <v-card-title>
          <v-icon left small color="primary">mdi-icon-name</v-icon>
          Título sección
        </v-card-title>
        <v-card-text>
          <!-- Contenido -->
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Sección 2 -->
    <v-col cols="12">
      <v-card outlined>
        ...
      </v-card>
    </v-col>

    <!-- Acciones -->
    <v-col cols="12">
      <v-card outlined>
        <v-card-text class="d-flex justify-start gap-2 pa-4">
          <v-btn ...>Cancelar</v-btn>
          <v-btn ...>Guardar</v-btn>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</v-container>
```

### Beneficios

- **Claridad visual:** Cada sección está claramente delimitada.
- **Consistencia:** Todas las páginas siguen el mismo patrón.
- **Responsive:** Las tarjetas se apilan naturalmente en mobile.
- **Mantenibilidad:** Es fácil reordenar o agregar/quitar secciones.

---

## 4. Estilos globales útiles

Las siguientes clases están definidas globalmente para espaciado flex:

```css
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
```

Usar `gap-*` en lugar de márgenes individuales (`ml-*`, `mr-*`) para mantener el código limpio y predecible.
