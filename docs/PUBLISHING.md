# Publicar y Usar El Toolkit

Esta guia separa dos distribuciones distintas:

- **npm** distribuye el CLI, el manifiesto, agentes, comandos y ejemplos MCP.
- Un **host estatico HTTPS** distribuye los catalogos de skills bajo `catalogs/`.

El CLI se publica como `@ismaeltorres00/opencode-toolkit`.

## Requisitos

- Node.js 20 o superior.
- Una cuenta npm con el usuario `ismaeltorres00`.
- El email de npm verificado.
- Autenticacion de dos factores configurada para publicar, o un token granular con permiso de bypass de 2FA.

No guardar contrasenas, OTP ni tokens npm en este repositorio.

## Preparar npm

Comprobar la cuenta activa:

```powershell
npm whoami
```

Debe devolver:

```text
ismaeltorres00
```

Si no hay sesion, iniciar sesion:

```powershell
npm login
```

El `package.json` debe contener estos valores:

```json
{
  "name": "@ismaeltorres00/opencode-toolkit",
  "version": "0.1.0",
  "publishConfig": { "access": "public" }
}
```

El paquete es publico. Cualquier persona que conozca su nombre podra descargarlo desde npm.

## Resolver El Error De 2FA

El intento de publicar `0.1.0` fue rechazado porque npm exige 2FA o un token con bypass de 2FA para publicar.

### Opcion A: Publicar Con OTP

Configurar 2FA en la cuenta npm con autorizacion para escrituras. Al publicar, proporcionar el codigo temporal de la aplicacion autenticadora:

```powershell
npm publish --access public --otp=123456
```

El OTP es temporal. No debe incluirse en scripts, commits ni documentos compartidos.

### Opcion B: Token Granular

En npm, crear un token granular limitado al paquete `@ismaeltorres00/opencode-toolkit`, con permiso de publicacion y bypass de 2FA. Guardarlo solo en el gestor de secretos o como variable de entorno local:

```powershell
$env:NPM_TOKEN = "..."
npm config set //registry.npmjs.org/:_authToken=$env:NPM_TOKEN
npm publish --access public
```

Para CI, guardar el token como secret `NPM_TOKEN`; nunca en `package.json`, `.npmrc` versionado ni en el codigo.

## Primera Publicacion

Desde la raiz del toolkit:

```powershell
npm test
npm pack --dry-run
npm publish --access public --otp=123456
```

`npm pack --dry-run` muestra el contenido exacto antes de publicarlo. Solo deben aparecer los recursos necesarios para ejecutar el CLI y el README.

El error `403` anterior no publico ninguna version. Por tanto, `0.1.0` sigue disponible para el siguiente intento si no se ha publicado por otro proceso.

Verificar la publicacion:

```powershell
npm view @ismaeltorres00/opencode-toolkit version
```

## Usar En Un Proyecto

La guia operativa completa esta en [`USER-GUIDE.md`](USER-GUIDE.md). Esta seccion resume la instalacion para quien publica el toolkit.

En la raiz de un proyecto nuevo:

```powershell
npx @ismaeltorres00/opencode-toolkit init
```

El CLI muestra selectores de teclado para:

- Scopes publicados: `global`, `dotnet`, `node`, `frontend` y cualquier scope nuevo en `catalogs/`.
- Agentes, comandos y MCP que se quieren instalar.

`global` siempre esta seleccionado. Al marcar `dotnet`, el proyecto registra `global` y `dotnet`. Si se selecciona el comando `review`, instala tambien el agente `code-reviewer` porque es una dependencia. La URL por defecto es `https://ismaeltorres00.github.io/opencode-company-toolkit/catalogs`; no se solicita al usuario.

Para publicar las skills en otra URL, el administrador puede indicar el override explicito:

```powershell
npx @ismaeltorres00/opencode-toolkit init --catalog-base-url https://ai.empresa.com/skills
```

El proyecto obtiene:

```text
opencode.jsonc
.opencode/
  toolkit.json
  toolkit-lock.json
  agents/
  commands/
```

Operaciones posteriores:

```powershell
npx @ismaeltorres00/opencode-toolkit configure
npx @ismaeltorres00/opencode-toolkit@latest update --dry-run
npx @ismaeltorres00/opencode-toolkit@latest update
npx @ismaeltorres00/opencode-toolkit status
npx @ismaeltorres00/opencode-toolkit check
npx @ismaeltorres00/opencode-toolkit remove --kind scope --name dotnet
```

Los recursos no se actualizan automaticamente. Para distribuir un cambio de agente, comando o MCP, se debe publicar una nueva version npm. Cada proyecto decide cuando ejecuta `update`.

`status` muestra la version instalada y la version del CLI en ejecucion. Usar primero `update --dry-run` para revisar que se instalaria, actualizaria o eliminaria. Antes de aplicar una actualizacion, el CLI revisa todos los recursos gestionados; si encuentra un cambio local, no modifica ningun archivo. `--force` permite sobrescribir o borrar esos cambios de forma explicita.

## Publicar Las Skills

Publicar el contenido de `catalogs/` en un host estatico accesible por HTTPS. La estructura publicada debe conservar los directorios:

```text
https://ai.empresa.com/skills/global/index.json
https://ai.empresa.com/skills/global/jira/SKILL.md
https://ai.empresa.com/skills/dotnet/index.json
```

Antes de desplegar:

```powershell
node scripts/validate-catalogs.mjs
```

El paquete npm no publica automaticamente esas URLs. El host estatico y su URL base deben configurarse por separado.

## Publicar Actualizaciones

Cada version de npm es inmutable. Con el arbol Git limpio y los cambios revisados:

```powershell
npm version patch
npm test
npm publish --access public --otp=123456
git push --follow-tags
```

Usar `patch` para correcciones compatibles, `minor` para nuevas capacidades compatibles y `major` para cambios incompatibles.

## CI Opcional

Un workflow de release puede publicar solo tras crear un tag de version. Debe recibir el token exclusivamente mediante secrets:

```yaml
- run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

El token debe ser granular, limitado al paquete y con bypass de 2FA si npm lo requiere.
