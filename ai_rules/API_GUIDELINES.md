# API Guidelines - latiabetina_api

## Índice

1. [Consultas con JOIN y columnas ambiguas](#1-consultas-con-join-y-columnas-ambiguas)
2. [Filtro por organización (org_id)](#2-filtro-por-organización-org_id)
3. [Paginación y ordenamiento](#3-paginación-y-ordenamiento)

---

## 1. Consultas con JOIN y columnas ambiguas

Cuando un controlador usa `JOIN` (o `leftJoin`), las columnas que existen en múltiples tablas deben usar el prefijo de la tabla para evitar el error `Column 'xxx' in where clause is ambiguous`.

### Incorrecto

```php
$query = AuditoriumEvent::query()
  ->leftJoin('auditoriums', 'auditorium_events.auditorium_id', '=', 'auditoriums.id')
  ->leftJoin('organizations', 'auditorium_events.org_id', '=', 'organizations.id')
  ->select('auditorium_events.*', ...);

// ⚠️ Ambigüedad: 'org_id' existe en auditorium_events y en organizations
if ($request->has('org_id')) {
  $query->where('org_id', $org_id);
}
```

### Correcto

```php
// ✅ Usar prefijo de tabla para desambiguar
if ($request->has('org_id') && !empty($request->get('org_id'))) {
  $org_id = $request->get('org_id');
  $query->where('auditorium_events.org_id', $org_id);
}
```

### Reglas

- Al usar `JOIN`/`leftJoin`, **siempre** usar `tabla.columna` en los `WHERE` cuando la columna exista en más de una tabla.
- Prefijar también las columnas en `orderBy` y `whereBetween`.
- Las columnas en `select` deben estar prefijadas o renombradas con `as`.

### Ejemplo completo

```php
$query = AuditoriumEvent::query()
  ->leftJoin('auditoriums', 'auditorium_events.auditorium_id', '=', 'auditoriums.id')
  ->leftJoin('organizations', 'auditorium_events.org_id', '=', 'organizations.id')
  ->select(
    'auditorium_events.id',
    'auditorium_events.event_date',
    'auditorium_events.org_id',
    'auditoriums.name as auditorium_name',
    'organizations.name as org_name'
  );

// Aplicar scope de permisos por organización
$query = $this->applyOrgPermissionScope($query, $this->user, 'permission-name', 'auditorium_events.org_id');

// Filtrar por organización (con prefijo de tabla)
if ($request->has('org_id') && !empty($request->get('org_id'))) {
  $query->where('auditorium_events.org_id', $request->get('org_id'));
}

// Filtrar por fecha (con prefijo de tabla)
if ($filter && is_array($filter)) {
  $query->whereBetween('auditorium_events.event_date', [$startDate, $endDate]);
}

// Paginación
$results = $query->paginate($itemsPerPage);
```

---

## 2. Filtro por organización (org_id)

Los endpoints de índice (`index`) deben soportar filtrado por `org_id`.

### Estructura base

```php
public function index(Request $request) {
  $query = Model::query();

  // Aplicar scope de permisos por organización (usando Concerns\AppliesOrgPermissionScope)
  $query = $this->applyOrgPermissionScope($query, $this->user, 'permission-name', 'tabla.org_id');

  // Filtrar por organización explícita
  if ($request->has('org_id') && !empty($request->get('org_id'))) {
    $query->where('tabla.org_id', $request->get('org_id'));
  }

  // Paginación
  $itemsPerPage = $request->get('itemsPerPage');
  $results = $query->paginate($itemsPerPage);
  return new DataSetResource($results);
}
```

### Reglas

- Usar `$request->has('org_id') && !empty($request->get('org_id'))` para verificar si se envió el filtro.
- Prefijar la columna con la tabla (`tabla.org_id`) si hay JOINs involucrados.
- El permiso pasado a `applyOrgPermissionScope` debe coincidir con el usado en el frontend (ej: `auditorium-index`).

---

## 3. Paginación y ordenamiento

Los endpoints de índice deben soportar los parámetros que envía `v-data-table` desde el frontend.

### Parámetros esperados

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `itemsPerPage` | int | Elementos por página (usar `-1` para traer todos) |
| `page` | int | Número de página |
| `sortBy` | array | Columnas por las que ordenar |
| `sortDesc` | array | Dirección de ordenamiento (cada elemento: `"true"` o `"false"`) |
| `filter` | mixed | Filtro de búsqueda (string, array de fechas, etc.) |
| `org_id` | int\|string | Filtro por organización |

### Ejemplo

```php
$itemsPerPage = $request->get('itemsPerPage');
$sortBy = $request->get('sortBy');
$sortDesc = $request->get('sortDesc');

if ($sortBy) {
  foreach ($sortBy as $index => $column) {
    $sortDirection = ($sortDesc[$index] == 'true') ? 'DESC' : 'ASC';
    $query = $query->orderBy($column, $sortDirection);
  }
}

$results = $query->paginate($itemsPerPage);
return new DataSetResource($results);
```

### Reglas

- Convertir `sortDesc[$index]` de string `"true"`/`"false"` a direcciones `DESC`/`ASC`.
- Usar `DataSetResource` para envolver los resultados paginados.
- Si `itemsPerPage` es `-1`, usar `$query->get()` en lugar de `paginate()` (el repositorio frontend lo maneja).

---

## 4. Respuestas de error

### Formato de error

```php
return response()->json(['message' => 'Mensaje de error'], 422);
// o
return response()->json(['message' => 'No encontrado'], 404);
```

### Reglas

- Usar códigos HTTP estándar: 200 (éxito), 201 (creado), 422 (validación), 404 (no encontrado), 500 (error interno).
- El mensaje de error debe ser descriptivo, preferiblemente en el mismo idioma que la aplicación.
- Para errores de validación, Laravel retorna automáticamente errores 422 con la estructura de validación.
