# Despliegue y ramas (Producción vs Beta)

## Sobre el mensaje "Deploying to 'bandesaid-221ac'"

Ese mensaje es **correcto**: **bandesaid-221ac** es el **proyecto** de Firebase (no el sitio). Tanto la versión en vivo como la beta están en el mismo proyecto. Lo que cambia es:

- **Producción**: se despliega al **sitio en vivo** del proyecto (la URL que usas en el trabajo).
- **Beta**: se despliega a un **canal de vista previa** del mismo proyecto; la URL te la muestra el CLI al terminar (ej. `https://bandesaid-221ac--beta-xxxx.web.app`).

No hace falta que diga "deploying to bandesaid-beta": la beta va a un **canal** del proyecto, no a un segundo sitio.

---

## Configuración inicial (solo una vez)

### Beta: canal de vista previa (sin segundo sitio)

Para evitar un [bug conocido del CLI de Firebase](https://github.com/firebase/firebase-tools/issues/8724) al desplegar a un **segundo sitio** (error `paths[1] must be of type string`), la beta usa un **canal de vista previa** en lugar de otro sitio:

- **`npm run deploy-beta`** hace build y despliega a un canal llamado `beta`.
- Al terminar, el CLI muestra la URL de prueba (estable mientras uses el mismo canal).
- No necesitas crear un sitio "bandesaid-beta" en Firebase.

### Ramas en Git

- **`main`**: versión estable → se despliega al **hosting de producción**.
- **`develop`**: versión beta → se despliega al **canal beta** para pruebas.

Para crear la rama `develop` (si aún no existe):

```bash
git checkout -b develop
git push -u origin develop
```

Si Git avisa de "dubious ownership", puedes permitir el repo con:

```bash
git config --global --add safe.directory 'E:/Aplicaciones REACT/bandesaid'
```

---

## Flujo de trabajo

### Desarrollo y pruebas en beta

1. Trabaja siempre en la rama **`develop`**:
   ```bash
   git checkout develop
   ```
2. Haz tus cambios, **commits y push** a `develop` (ver más abajo).
3. Despliega al **canal beta**:
   ```bash
   npm run deploy-beta
   ```
4. Usa la URL que muestre el CLI (ej. `https://bandesaid-221ac--beta-xxxx.web.app`) para probar.

---

## Hacer commits (rama develop)

Mientras desarrollas en la rama **`develop`**:

1. Revisar qué archivos cambiaron:
   ```bash
   git status
   ```
2. Añadir los archivos al área de preparación:
   ```bash
   git add .
   ```
   (o archivos concretos: `git add src/components/qr/ScannerGuiaSADA.jsx`)
3. Crear el commit con un mensaje claro:
   ```bash
   git commit -m "Descripción breve del cambio"
   ```
4. Subir los cambios a GitHub:
   ```bash
   git push origin develop
   ```

Solo después de hacer push puedes desplegar a beta (`npm run deploy-beta`) o, cuando esté listo, seguir el procedimiento para pasar a estable.

---

## Pasar la versión beta a estable

Cuando la beta esté probada y quieras que sea la versión en producción:

1. **En `develop`**: asegurarte de que todo está commiteado y subido.
   ```bash
   git status
   git add .
   git commit -m "Tu mensaje si falta algo"
   git push origin develop
   ```

2. **Pasar a `main` y fusionar**:
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

3. **Desplegar a producción** (la URL estable en vivo):
   ```bash
   npm run deploy-firebase
   ```

A partir de ese momento, **https://bandesaid-221ac.web.app** tendrá la versión que probaste en beta. El canal beta puedes seguir usándolo para la siguiente ronda de pruebas.

---

## Resumen de comandos

| Acción                      | Comando              |
|-----------------------------|----------------------|
| Desplegar a **beta** (pruebas) | `npm run deploy-beta`     |
| Desplegar a **producción**     | `npm run deploy-firebase` |

- **Producción**: lo que usa el equipo en el día a día.  
- **Beta**: canal de vista previa para probar nuevas funciones (ej. guías SADA) antes de pasarlas a estable.
