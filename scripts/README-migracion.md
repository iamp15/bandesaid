# Migración de cargas a la ruta con plantas

Este script copia los datos de cargas desde la estructura antigua de Firestore a la nueva (con el nivel `plantas/superPollo`), para que la app siga mostrando las cargas ya existentes después del cambio de rutas.

## Requisitos

1. **Clave de cuenta de servicio de Firebase**
   - Entra en [Firebase Console](https://console.firebase.google.com/) → tu proyecto **bandesaid-221ac**
   - Configuración del proyecto (engranaje) → **Cuentas de servicio**
   - Pulsa **Generar nueva clave privada** y descarga el JSON
   - Guarda el archivo como `scripts/serviceAccountKey.json` en este proyecto  
     (el archivo ya está en `.gitignore` y no se sube al repositorio)

2. **Instalar dependencias** (si no lo has hecho):
   ```bash
   npm install
   ```

## Uso

**Simulación (recomendado primero):** solo muestra qué se migraría, sin escribir en Firestore.
```bash
npm run migrate:cargas:dry
```

**Migración real:** copia todos los documentos de cargas y contadores a la nueva ruta.
```bash
npm run migrate:cargas
```

O ejecutando el script directamente:
```bash
node scripts/migrate-cargas-to-plantas.cjs           # migración real
node scripts/migrate-cargas-to-plantas.cjs --dry-run # simulación
```

## Qué hace el script

- Recorre todos los documentos de la colección `cargas` (cada uno es un día, p. ej. `12022025`).
- Para cada día y cada proveedor (`tr`, `tg`, `al`, `av`, `an`):
  - Lee todos los documentos de `cargas/{dayId}/{provider}`
  - Los escribe en `cargas/{dayId}/plantas/superPollo/{provider}` (mismo id y datos).
- Copia también los contadores de `cargas/{dayId}/_counters/{provider}` a `cargas/{dayId}/plantas/superPollo/_counters/{provider}`.

**No borra** los datos de la ruta antigua; solo copia a la nueva. Si quieres liberar espacio, puedes borrar manualmente la ruta antigua en Firestore después de comprobar que todo funciona.

## Alternativa: variable de entorno

En lugar de `scripts/serviceAccountKey.json`, puedes usar la variable de entorno con la ruta al JSON de la cuenta de servicio:

```bash
set GOOGLE_APPLICATION_CREDENTIALS=C:\ruta\a\tu\serviceAccountKey.json
npm run migrate:cargas
```

(Linux/mac: `export GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/tu/serviceAccountKey.json`)
