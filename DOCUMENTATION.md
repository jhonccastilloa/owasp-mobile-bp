# Guía de Seguridad para Aplicaciones Android

### 1. Configuración de `android:allowBackup`  
Para evitar que los datos de la aplicación se incluyan en copias de seguridad, establecer:

**Salida esperada:** `android:allowBackup="false"`  
**Ubicación:** `AndroidManifest.xml`

**Resumen:**  
🔐 `android:allowBackup` controla si la app permite respaldar y restaurar sus datos automáticamente.  
- ✅ `true` (valor por defecto): los datos se pueden guardar y restaurar, incluso al cambiar de dispositivo o mediante la nube.  
- ❌ `false`: se desactiva la copia de seguridad y restauración, incluso usando `adb`.  
📱 En Android 12+ (API 31 o superior), algunos fabricantes podrían seguir migrando datos, pero puedes evitar el respaldo en la nube configurando esta propiedad como `"false"`.

**Fuente:**  
[Documentación oficial de Android](https://developer.android.com/guide/topics/manifest/application-element?hl=es-420#reparent)


---

### 2. Configuración de `android:installLocation`  
Para restringir la instalación al almacenamiento interno y prevenir accesos externos, establecer:

**Salida esperada:** `android:installLocation="internalOnly"`  
**Ubicación:** `AndroidManifest.xml`

**Resumen:**  
💾 `android:installLocation` determina dónde se puede instalar la app (almacenamiento interno o externo).  
- ✅ `"internalOnly"`: fuerza la instalación únicamente en el almacenamiento interno.  
- `"preferExternal"` o `"auto"`: permite instalación en almacenamiento externo si es posible, aunque puede verse afectado por disponibilidad o configuración del sistema.  
⚠️ Evita instalar en almacenamiento externo si tu app usa servicios, widgets, fondos animados, alarmas o funcionalidades críticas, ya que pueden interrumpirse si el usuario desmonta la SD o activa el modo de almacenamiento masivo USB.  

**Fuente:**  
[Documentación oficial de Android](https://developer.android.com/guide/topics/data/install-location?hl=es-419)


---

### 3. Configuración de `minSdkVersion`
Para evitar vulnerabilidades obsoletas, se recomienda:

**Salida esperada:** `minSdkVersion 27`

**Ubicación:** `build.gradle`

---
### 4. Configuración de `compileSdkVersion`

Para maximizar la seguridad, se recomienda:

**Salida esperada:** `compileSdkVersion 34`  
**Ubicación:** `build.gradle`

**Resumen:**  
A partir del **31 de agosto de 2024**, todas las **nuevas apps y actualizaciones** deben apuntar a Android 14 (**API level 34**) para poder publicarse en Google Play, con algunas excepciones para Wear OS y Android TV. Las apps existentes deberán apuntar al menos a **Android 13 (API level 33)** para seguir estando disponibles para nuevos usuarios con versiones recientes de Android. Las apps que apunten a API 31 o inferior dejarán de ser visibles para nuevos usuarios con versiones más recientes del sistema. Google ofrece una **extensión hasta el 1 de noviembre de 2024** si necesitas más tiempo para actualizar tu app.  

Actualizar tu `compileSdkVersion` y `targetSdkVersion` a la versión requerida garantiza que tu app cumpla con las mejoras en seguridad, privacidad y rendimiento esperadas por los usuarios y por Google Play.

**Fuente:**  
[Target API level requirements for Google Play apps – Google Support](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)

---

### 5. Permisos peligrosos

A continuación se detallan los **permisos peligrosos** (severity: 'E') detectados en la aplicación, junto con sus descripciones oficiales y enlaces a la documentación:


#### 📍 `ACCESS_COARSE_LOCATION`
- **Descripción:** Permite que una app acceda a la ubicación aproximada del dispositivo.
- **Nivel de protección:** `dangerous`
- **API mínima:** 1  
- **Valor constante:** `"android.permission.ACCESS_COARSE_LOCATION"`  
- 🔗 [Referencia oficial](https://developer.android.com/reference/android/Manifest.permission#ACCESS_COARSE_LOCATION)


#### 📍 `ACCESS_FINE_LOCATION`
- **Descripción:** Permite que una app acceda a la ubicación precisa del dispositivo.
- **Nivel de protección:** `dangerous`
- **API mínima:** 1  
- **Valor constante:** `"android.permission.ACCESS_FINE_LOCATION"`  
- 🔗 [Referencia oficial](https://developer.android.com/reference/android/Manifest.permission#ACCESS_FINE_LOCATION)


#### 📸 `CAMERA`
- **Descripción:** Requerido para acceder al dispositivo de cámara.  
  En dispositivos sin cámara, es necesario adaptar el `uses-feature` del manifiesto para evitar errores de instalación.
- **Nivel de protección:** `dangerous`
- **API mínima:** 1  
- **Valor constante:** `"android.permission.CAMERA"`  
- 🔗 [Referencia oficial](https://developer.android.com/reference/android/Manifest.permission#CAMERA)


#### 👥 `READ_CONTACTS`
- **Descripción:** Permite leer los contactos del usuario.
- **Nivel de protección:** `dangerous`
- **API mínima:** 1  
- **Valor constante:** `"android.permission.READ_CONTACTS"`  
- 🔗 [Referencia oficial](https://developer.android.com/reference/android/Manifest.permission#READ_CONTACTS)


#### 📞 `READ_PHONE_NUMBERS`
- **Descripción:** Permite leer el número de teléfono del dispositivo.  
  Expuesto también a aplicaciones instantáneas.
- **Nivel de protección:** `dangerous`
- **API mínima:** 26  
- **Valor constante:** `"android.permission.READ_PHONE_NUMBERS"`  
- 🔗 [Referencia oficial](https://developer.android.com/reference/android/Manifest.permission#READ_PHONE_NUMBERS)


#### 🖼️ `READ_MEDIA_IMAGES`
- **Descripción:** Permite leer archivos de imagen desde almacenamiento externo.  
  A partir de Android 13 (`TIRAMISU`), este permiso reemplaza a `READ_EXTERNAL_STORAGE` para imágenes.
- **Nivel de protección:** `dangerous`
- **API mínima:** 33  
- **Valor constante:** `"android.permission.READ_MEDIA_IMAGES"`  
- 🔗 [Referencia oficial](https://developer.android.com/reference/android/Manifest.permission#READ_MEDIA_IMAGES)


#### ✍️ `WRITE_CONTACTS`
- **Descripción:** Permite escribir datos en los contactos del usuario.
- **Nivel de protección:** `dangerous`
- **API mínima:** 1  
- **Valor constante:** `"android.permission.WRITE_CONTACTS"`  
- 🔗 [Referencia oficial](https://developer.android.com/reference/android/Manifest.permission#WRITE_CONTACTS)


#### 🧭 `ACCESS_BACKGROUND_LOCATION`
- **Descripción:** Permite a la app acceder a la ubicación mientras se ejecuta en segundo plano.  
  Se debe solicitar también `ACCESS_FINE_LOCATION` o `ACCESS_COARSE_LOCATION`.  
  Este permiso es de tipo **restringido** y necesita autorización especial del instalador.
- **Nivel de protección:** `dangerous`
- **API mínima:** 29  
- **Valor constante:** `"android.permission.ACCESS_BACKGROUND_LOCATION"`  
- 🔗 [Referencia oficial](https://developer.android.com/reference/android/Manifest.permission#ACCESS_BACKGROUND_LOCATION)


---

### 6. Permisos deprecados

A continuación se listan los permisos que han sido **deprecados** oficialmente o bien **corresponden a APIs obsoletas** que ya no deben ser utilizadas:


#### 🔐 `ACCESS_FINGERPRINT_MANAGER` *(Clase obsoleta, no es un permiso oficial)*

- **Nota:** Este identificador no corresponde a un permiso declarado en el `AndroidManifest`, sino a una **clase Java** llamada [`FingerprintManager`](https://developer.android.com/reference/android/hardware/fingerprint/FingerprintManager) utilizada para interactuar con el hardware de huellas digitales.
- **Estado:** Deprecada en API nivel 28
- **Alternativa recomendada:** [`BiometricPrompt`](https://developer.android.com/reference/android/hardware/biometrics/BiometricPrompt), que permite trabajar con múltiples tipos de autenticación biométrica (huella, rostro, etc.)
- **Descripción:** La clase `FingerprintManager` fue usada para gestionar el hardware de huellas dactilares, pero ha sido reemplazada por `BiometricPrompt`, que ofrece una solución más flexible y segura a través de un cuadro de diálogo proporcionado por el sistema.
- ⚠️ No debe considerarse como permiso válido en el manifiesto (`AndroidManifest.xml`), ya que no forma parte de `android.Manifest.permission`.


#### 🔒 `USE_FINGERPRINT`

- **Descripción:** Permitía a la app usar el hardware de huellas digitales del dispositivo.
- **API mínima:** 23  
- **Deprecado desde:** API nivel 28
- **Nivel de protección:** `normal`
- **Valor constante:** `"android.permission.USE_FINGERPRINT"`  
- **Alternativa recomendada:** `USE_BIOMETRIC`
- 🔗 [Referencia oficial](https://developer.android.com/reference/android/Manifest.permission#USE_FINGERPRINT)

> **Nota:** Aunque este permiso sigue presente para compatibilidad, se recomienda migrar totalmente a `USE_BIOMETRIC` y utilizar `BiometricPrompt` como interfaz unificada para autenticación biométrica.

---

#### 📂 `READ_EXTERNAL_STORAGE`

- **Descripción:** Permite que una aplicación lea desde el almacenamiento externo.
- **API mínima:** 16  
- **Deprecado desde:** API nivel 33
- **Nivel de protección:** `dangerous`
- **Valor constante:** `"android.permission.READ_EXTERNAL_STORAGE"`
- **Alternativa recomendada:** Para acceder a archivos multimedia, usar `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`.
- 🔗 [Referencia oficial](https://developer.android.com/reference/android/Manifest.permission#READ_EXTERNAL_STORAGE)

> **Nota:** A partir de API 33, este permiso ya no tiene efecto. Si tu aplicación accede a archivos multimedia de otras aplicaciones, debes solicitar permisos específicos para imágenes, videos o audios.


#### 📂 `WRITE_EXTERNAL_STORAGE`

- **Descripción:** Permitía a la app escribir en el almacenamiento externo.
- **API mínima:** 16  
- **Deprecado desde:** API nivel 30
- **Nivel de protección:** `dangerous`
- **Valor constante:** `"android.permission.WRITE_EXTERNAL_STORAGE"`
- **Alternativa recomendada:** Utilizar el permiso `MANAGE_EXTERNAL_STORAGE` si se necesita acceso completo al almacenamiento.
- 🔗 [Referencia oficial](https://developer.android.com/training/data-storage?hl=es-419)

> **Nota:** A partir de Android 11 (API 30), este permiso ya no tiene efecto para acceder al almacenamiento externo. Se recomienda usar un modelo basado en el propósito de los archivos y el nuevo permiso `MANAGE_EXTERNAL_STORAGE` para acceder fuera del directorio específico de la app.


#### 🌍 `ACCESS_FINE_LOCATION_BACKGROUND`

- **Descripción:** Permite que la app acceda a la ubicación precisa del dispositivo en segundo plano.
- **Alternativa recomendada:** `ACCESS_BACKGROUND_LOCATION`
- **Referencia oficial sobre políticas de ubicación en segundo plano:** [Política de acceso a la ubicación en segundo plano](https://support.google.com/googleplay/android-developer/answer/9799150?hl=en)

> **Nota:** Se recomienda que las aplicaciones utilicen `ACCESS_BACKGROUND_LOCATION` para acceder a la ubicación en segundo plano. Además, se debe justificar el acceso en segundo plano solo cuando sea absolutamente necesario para la funcionalidad de la app.


#### 📷 `CAMERA_PERMISSION`

- **Descripción:** Permite que la app acceda a la cámara del dispositivo.
- **API mínima:** 1
- **Deprecado desde:** N/A, pero se recomienda usar el permiso más actualizado
- **Nivel de protección:** `dangerous`
- **Valor constante:** `"android.permission.CAMERA"`
- **Alternativa recomendada:** Usar `CAMERA`
- 🔗 [Referencia oficial](https://developer.android.com/reference/android/Manifest.permission#CAMERA)


---

### 7. Configuración de `cleartextTrafficPermitted`

- **Salida esperada:** `cleartextTrafficPermitted="false"`
- **Ubicación:** `res/xml/network_security_config.xml`
- **Resumen:** Inhabilita el tráfico de texto sin cifrar (HTTP) para dominios específicos o para toda la app, lo que obliga a utilizar solo conexiones seguras (HTTPS). Esto ayuda a prevenir filtraciones de datos sensibles y protege contra ataques en redes inseguras. Aunque a partir de Android 9 (API 28) esta opción ya está deshabilitada por defecto, sigue siendo buena práctica configurarla explícitamente, especialmente en apps que deben cumplir con altos estándares de seguridad.
- **Fuente:** [Configuración de seguridad de red - Android Developers](https://developer.android.com/privacy-and-security/security-config?hl=es-419#CleartextTrafficPermitted)


---

### 8. Configuración de `android:launchMode`

- **Salida esperada:** `android:launchMode="singleInstance"`
- **Ubicación:** `AndroidManifest.xml`
- **Resumen:** Define cómo se inicia una actividad en Android. El modo `singleInstance` asegura que solo exista una única instancia de la actividad en todo el sistema, y que no pueda compartir su tarea con otras actividades. Esto es útil para aislar actividades críticas o sensibles, evitando que se mezclen con otras en la pila de navegación. Aunque existen otros modos (`standard`, `singleTop`, `singleTask`, `singleInstancePerTask`), `singleInstance` garantiza mayor seguridad y control, especialmente cuando se necesita evitar accesos no deseados o estados compartidos.
- **Fuente:** [Elemento `<activity>`: android:launchMode - Android Developers](https://developer.android.com/guide/topics/manifest/activity-element?hl=es-419#lmode)


---

### 9. Eliminación de logs en archivos Java
No se deben generar logs en archivos Java para evitar exposición de información sensible.

**Salida esperada:** No se generen logs, por lo que no existe información sensible ni datos personales que puedan ser expuestos.


### 10. Librerías con Vulnerabilidades


- **Package:** react-native-sms-user-consent  
  - **Min Version:** 0  
  - **Max Version:** 1.1.4  
  - **Vuln ID:** CVE-2021-4438  
  - **Description:** Exportación incorrecta de componentes de la aplicación Android.  
  - **Severity:** E  
  - [Más información](https://security.snyk.io/vuln/SNYK-JS-BOOSTFORREACTNATIVE-3091053)  

- **Package:** react-native-mmkv  
  - **Min Version:** 0  
  - **Max Version:** 2.11.0  
  - **Vuln ID:** CVE-2024-21668  
  - **Description:** La clave de cifrado opcional de la base de datos MMKV se registra en el registro del sistema Android.  
  - **Severity:** E  
  - [Más información](https://security.snyk.io/vuln/SNYK-JS-BOOSTFORREACTNATIVE-3091053)  

- **Package:** react-native-reanimated  
  - **Min Version:** 0  
  - **Max Version:** 3.0.0-rc.1  
  - **Vuln ID:** CVE-2022-24373  
  - **Description:** Vulnerabilidad de denegación de servicio (DoS) en expresiones regulares.  
  - **Severity:** E  
  - [Más información](https://nvd.nist.gov/vuln/detail/CVE-2022-24373)  

- **Package:** react-native  
  - **Min Version:** 0.59.0  
  - **Max Version:** 0.64.1  
  - **Vuln ID:** CVE-2020-1920  
  - **Description:** Denegación de servicio que puede causar uso excesivo de recursos, bloqueos o que la aplicación deje de responder.  
  - **Severity:** E  
  - [Más información](https://nvd.nist.gov/vuln/detail/CVE-2020-1920)  

- **Package:** react-native-fast-image  
  - **Min Version:** 0  
  - **Max Version:** 9999999  
  - **Vuln ID:** CVE-2020-7696  
  - **Description:** Las imágenes comparten encabezados, lo que puede filtrar credenciales de firma o tokens de sesión a otros servidores.  
  - **Severity:** E  
  - [Más información](https://nvd.nist.gov/vuln/detail/CVE-2020-7696)  

- **Package:** react-native-meteor-oauth  
  - **Min Version:** 0  
  - **Max Version:** 9999999  
  - **Vuln ID:** CVE-2017-16028  
  - **Description:** Uso de un RNG no criptográficamente fuerte para generar el token aleatorio de OAuth.  
  - **Severity:** E  
  - [Más información](https://nvd.nist.gov/vuln/detail/CVE-2017-16028)  

- **Package:** react-native-baidu-voice-synthesizer  
  - **Min Version:** 0  
  - **Max Version:** 9999999  
  - **Vuln ID:** CVE-2016-10697  
  - **Description:** Ejecución remota de código (RCE) si el atacante manipula recursos descargados mediante protocolos no seguros.  
  - **Severity:** E  
  - [Más información](https://nvd.nist.gov/vuln/detail/CVE-2016-10697)  

- **Package:** react-admin  
  - **Min Version:** 0  
  - **Max Version:** 3.19.12  
  - **Vuln ID:** CVE-2023-25572  
  - **Description:** Vulnerable a Cross-Site Scripting (XSS) a través de entradas no validadas.  
  - **Severity:** E  
  - [Más información](https://nvd.nist.gov/vuln/detail/CVE-2023-25572)  

  - **Paquete:** matrix-react-sdk  
  - **Versión mínima:** 0  
  - **Versión máxima:** 3.105.0  
  - **ID de vulnerabilidad:** CVE-2024-42347  
  - **Descripción:** Un servidor malicioso puede robar claves de mensajes en salas cifradas extremo a extremo.  
  - **Más información:** [CVE-2024-42347](https://nvd.nist.gov/vuln/detail/CVE-2024-42347)  
  - **Severidad:** E  

- **Paquete:** matrix-react-sdk  
  - **Versión mínima:** 3.18.0  
  - **Versión máxima:** 3.102.0  
  - **ID de vulnerabilidad:** CVE-2024-47824  
  - **Descripción:** Permite a un servidor doméstico malintencionado robar potencialmente las claves de mensaje de una sala cuando un usuario invita a otro.  
  - **Más información:** [CVE-2024-47824](https://nvd.nist.gov/vuln/detail/CVE-2024-47824)  
  - **Severidad:** E  

- **Paquete:** react-pdf  
  - **Versión mínima:** 0  
  - **Versión máxima:** 8.0.2  
  - **ID de vulnerabilidad:** CVE-2024-34342  
  - **Descripción:** Ejecución de JavaScript no autorizado en el contexto del dominio de alojamiento.  
  - **Más información:** [CVE-2024-34342](https://nvd.nist.gov/vuln/detail/CVE-2024-34342)  
  - **Severidad:** E  

- **Paquete:** react-dashboard  
  - **Versión mínima:** 0  
  - **Versión máxima:** 9999999  
  - **ID de vulnerabilidad:** CVE-2023-51843  
  - **Descripción:** Es vulnerable a Cross Site Scripting (XSS) porque la propiedad httpOnly no está configurada.  
  - **Más información:** [CVE-2023-51843](https://nvd.nist.gov/vuln/detail/CVE-2023-51843)  
  - **Severidad:** E  

- **Paquete:** react-bootstrap-table  
  - **Versión mínima:** 0  
  - **Versión máxima:** 9999999  
  - **ID de vulnerabilidad:** CVE-2021-23398  
  - **Descripción:** Vulnerable a Cross-site Scripting (XSS) a través del parámetro dataFormat.  
  - **Más información:** [CVE-2021-23398](https://nvd.nist.gov/vuln/detail/CVE-2021-23398)  
  - **Severidad:** E  

- **Paquete:** react-draft-wysiwyg  
  - **Versión mínima:** 0  
  - **Versión máxima:** 1.14.6  
  - **ID de vulnerabilidad:** CVE-2021-31712  
  - **Descripción:** Permite un URI de tipo javascript: en un enlace objetivo del decorador de enlaces en decorators/Link/index.js, lo que lleva a XSS.  
  - **Más información:** [CVE-2021-31712](https://nvd.nist.gov/vuln/detail/CVE-2021-31712)  
  - **Severidad:** E

  - **Paquete:** react-dev-utils
  - **Versión mínima:** 0
  - **Versión máxima:** 11.0.4
  - **ID de vulnerabilidad:** CVE-2021-24033
  - **Descripción:** Posibilidad de inyección de comandos.
  - **URL:** [Detalles de la vulnerabilidad](https://nvd.nist.gov/vuln/detail/CVE-2021-24033)
  - **Severidad:** E
  - **Categoría OWASP:** M4

- **Paquete:** boost-for-react-native
  - **Versión mínima:** 0
  - **Versión máxima:** 9999999
  - **ID de vulnerabilidad:** noID
  - **Descripción:** Este paquete es malicioso. Es un caso de "confusión de dependencia", en el que el nombre del paquete simula pertenecer a componentes existentes y tiene como objetivo engañar a los usuarios para que descarguen un código malicioso.
  - **URL:** [Detalles de la vulnerabilidad](https://security.snyk.io/vuln/SNYK-JS-BOOSTFORREACTNATIVE-3091053)
  - **Severidad:** E
  - **Categoría OWASP:** M8

- **Paquete:** camera-kit-react-native-example
  - **Versión mínima:** 0
  - **Versión máxima:** 9999999
  - **ID de vulnerabilidad:** noID
  - **Descripción:** Su contenido fue eliminado del gestor de paquetes oficial. Aunque intenta hacerse pasar por una organización válida, no tiene conexión con dicha organización.
  - **URL:** [Detalles de la vulnerabilidad](https://security.snyk.io/vuln/SNYK-JS-CAMERAKITREACTNATIVEEXAMPLE-8496614)
  - **Severidad:** E
  - **Categoría OWASP:** M9

- **Paquete:** eng-intern-assessment-react-native
  - **Versión mínima:** 0
  - **Versión máxima:** 9999999
  - **ID de vulnerabilidad:** noID
  - **Descripción:** Su contenido fue eliminado del gestor de paquetes oficial. Aunque intenta hacerse pasar por una organización válida, no tiene conexión con dicha organización.
  - **URL:** [Detalles de la vulnerabilidad](https://security.snyk.io/vuln/SNYK-JS-ENGINTERNASSESSMENTREACTNATIVE-6457432)
  - **Severidad:** E
  - **Categoría OWASP:** M9

- **Paquete:** fantasy-android-react-native
  - **Versión mínima:** 0
  - **Versión máxima:** 9999999
  - **ID de vulnerabilidad:** noID
  - **Descripción:** Su contenido fue eliminado del gestor de paquetes oficial. Aunque intenta hacerse pasar por una organización válida, no tiene conexión con dicha organización.
  - **URL:** [Detalles de la vulnerabilidad](https://security.snyk.io/vuln/SNYK-JS-FANTASYANDROIDREACTNATIVE-5868088)
  - **Severidad:** E
  - **Categoría OWASP:** M9

- **Paquete:** fantasy-react-native
  - **Versión mínima:** 0
  - **Versión máxima:** 9999999
  - **ID de vulnerabilidad:** noID
  - **Descripción:** Su contenido fue eliminado del gestor de paquetes oficial. Aunque intenta hacerse pasar por una organización válida, no tiene conexión con dicha organización.
  - **URL:** [Detalles de la vulnerabilidad](https://security.snyk.io/vuln/SNYK-JS-FANTASYREACTNATIVE-5869395)
  - **Severidad:** E
  - **Categoría OWASP:** M9

- **Paquete:** mobile-auth-library-react-native
  - **Versión mínima:** 0
  - **Versión máxima:** 9999999
  - **ID de vulnerabilidad:** noID
  - **Descripción:** El nombre del paquete está basado en repositorios, espacios de nombres o componentes existentes de empresas populares para engañar a los empleados. Solo eres vulnerable si se instaló desde el registro público de NPM.
  - **URL:** [Detalles de la vulnerabilidad](https://security.snyk.io/vuln/SNYK-JS-MOBILEAUTHLIBRARYREACTNATIVE-3326408)
  - **Severidad:** E
  - **Categoría OWASP:** M8

- **Paquete:** nlp-react-native
  - **Versión mínima:** 0
  - **Versión máxima:** 9999999
  - **ID de vulnerabilidad:** noID
  - **Descripción:** Su contenido fue eliminado del gestor de paquetes oficial. Aunque intenta hacerse pasar por una organización válida, no tiene conexión con dicha organización.
  - **URL:** [Detalles de la vulnerabilidad](https://security.snyk.io/vuln/SNYK-JS-NLPREACTNATIVE-5868051)
  - **Severidad:** E
  - **Categoría OWASP:** M8

- **Paquete:** react-native
  - **Versión mínima:** 0.59.0
  - **Versión máxima:** 0.64.1
  - **ID de vulnerabilidad:** noID
  - **Descripción:** react-native es una librería que lleva el framework declarativo de React a iOS y Android. Con React Native, usas controles nativos de UI y tienes acceso completo a la plataforma nativa.
  - **URL:** [Detalles de la vulnerabilidad](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVE-1298632)
  - **Severidad:** E
  - **Categoría OWASP:** M7

- **Paquete:** react-native-aes-crypto-forked
  - **Versión mínima:** 1.2.1
  - **Versión máxima:** 2.0.0
  - **ID de vulnerabilidad:** noID
  - **Descripción:** react-native-aes-crypto-forked es un paquete malicioso cuyo nombre se basa en repositorios, espacios de nombres o componentes existentes de empresas populares, con el objetivo de engañar a los empleados.
  - **URL:** [Detalles de la vulnerabilidad](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVEAESCRYPTOFORKED-3018868)
  - **Severidad:** E
  - **Categoría OWASP:** M8

- **Package:** react-native-dual-pedometer  
  - **Min Version:** 0  
  - **Max Version:** 9999999  
  - **Vuln ID:** noID  
  - **Description:** react-native-dual-pedometer es un paquete malicioso cuyo contenido fue eliminado del gestor de paquetes oficial. Intenta hacerse pasar por una organización válida, pero no tiene relación con esa organización.  
  - **URL:** [SNYK-JS-REACTNATIVEDUALPEDOMETER-6114723](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVEDUALPEDOMETER-6114723)  
  - **Severity:** E  
  - **OWASP Category:** M8  

- **Package:** react-native-fast-image  
  - **Min Version:** 0  
  - **Max Version:** 8.3.0  
  - **Vuln ID:** noID  
  - **Description:** react-native-fast-image es un componente de imagen para React Native. Las versiones afectadas son vulnerables a la exposición de información. Cuando una imagen con el parámetro source={{uri: '...', headers: {host: 'somehost.com', authorization: '...'}}} se carga, todas las imágenes posteriores usarán los mismos encabezados, lo que puede llevar a la fuga de credenciales o tokens de sesión a otros servidores.  
  - **URL:** [SNYK-JS-REACTNATIVEFASTIMAGE-572228](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVEFASTIMAGE-572228)  
  - **Severity:** E  
  - **OWASP Category:** M1  

- **Package:** react-native-fido-login-api  
  - **Min Version:** 0  
  - **Max Version:** 9999999  
  - **Vuln ID:** noID  
  - **Description:** react-native-fido-login-api es un paquete malicioso cuyo contenido fue eliminado del gestor de paquetes oficial. Intenta hacerse pasar por una organización válida, pero no tiene relación con esa organización.  
  - **URL:** [SNYK-JS-REACTNATIVEFIDOLOGINAPI-5865868](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVEFIDOLOGINAPI-5865868)  
  - **Severity:** E  
  - **OWASP Category:** M8  

- **Package:** react-native-performance-monorepo  
  - **Min Version:** 0  
  - **Max Version:** 9.8.9  
  - **Vuln ID:** noID  
  - **Description:** react-native-performance-monorepo es un paquete malicioso cuyo nombre se basa en repositorios o componentes existentes de empresas populares, con el objetivo de engañar a los empleados. Solo eres vulnerable si este paquete fue instalado desde el registro público de NPM en lugar de tu registro privado.  
  - **URL:** [SNYK-JS-REACTNATIVEPERFORMANCEMONOREPO-2934563](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVEPERFORMANCEMONOREPO-2934563)  
  - **Severity:** E  
  - **OWASP Category:** M8  

- **Package:** react-native-transparent-video  
  - **Min Version:** 0  
  - **Max Version:** 9999999  
  - **Vuln ID:** noID  
  - **Description:** react-native-transparent-video es un paquete malicioso cuyo contenido fue eliminado del gestor de paquetes oficial. Intenta hacerse pasar por una organización válida, pero no tiene relación con esa organización.  
  - **URL:** [SNYK-JS-REACTNATIVETRANSPARENTVIDEO-5851140](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVETRANSPARENTVIDEO-5851140)  
  - **Severity:** E  
  - **OWASP Category:** M8  

- **Package:** react-native-webview  
  - **Min Version:** 0  
  - **Max Version:** 9999999  
  - **Vuln ID:** noID  
  - **Description:** react-native-webview es un componente WebView para React Native en iOS, Android, macOS y Windows. Las versiones afectadas son vulnerables a un ataque de Cross-Site Scripting (XSS) a través de un sistema WebView de Android. Esto permite que los iframes de origen cruzado ejecuten JavaScript arbitrario en el documento de nivel superior en dispositivos con WebView de Android anterior a la versión 83.0.4103.106.  
  - **URL:** [SNYK-JS-REACTNATIVEWEBVIEW-1011954](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVEWEBVIEW-1011954)  
  - **Severity:** E  
  - **OWASP Category:** M3  

- **Package:** tencentcloud-cos-sdk-react-native  
  - **Min Version:** 0  
  - **Max Version:** 9999999  
  - **Vuln ID:** noID  
  - **Description:** Este paquete contiene malware e intenta comprometer a los usuarios mediante técnicas de confusión de dependencia. Un ataque de confusión de dependencia es un tipo de ataque en la cadena de suministro en el que se reemplaza un paquete de software legítimo por uno malicioso.  
  - **URL:** [SNYK-JS-TENCENTCLOUDCOSSDKREACTNATIVE-5721473](https://security.snyk.io/vuln/SNYK-JS-TENCENTCLOUDCOSSDKREACTNATIVE-5721473)  
  - **Severity:** E  
  - **OWASP Category:** M2  



- **Package:** react-native-animated-fox  
    - **Mínima Versión:** 0
    - **Máxima Versión:** 9999999
    - **ID de Vulnerabilidad:** noID
    - **Descripción:** Este paquete es malicioso y se basa en nombres de repositorios o componentes existentes de empresas populares para engañar a los empleados. Solo eres vulnerable si fue instalado desde el registro público de NPM en lugar de un registro privado.
    - **URL:** [Snyk Report](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVEANIMATEDFOX-3018859)
    - **Severidad:** E
    - **Categoría OWASP:** M8

- **Package:** react-native-baidu-voice-synthesizer 
    - **Mínima Versión:** 0
    - **Máxima Versión:** 9999999
    - **ID de Vulnerabilidad:** noID
    - **Descripción:** Las versiones afectadas son vulnerables a ataques MitM debido a la descarga de recursos a través de un protocolo inseguro, lo que puede llevar a una ejecución remota de código (RCE) en el servidor anfitrión.
    - **URL:** [Snyk Report](https://security.snyk.io/vuln/npm:react-native-baidu-voice-synthesizer:20170102)
    - **Severidad:** E
    - **Categoría OWASP:** M5

- **Package:** react-native-blue-crypto
    - **Mínima Versión:** 0
    - **Máxima Versión:** 9999999
    - **ID de Vulnerabilidad:** noID
    - **Descripción:** Este paquete es malicioso y su contenido fue eliminado del gestor de paquetes oficial. Aunque intenta suplantar a una organización válida, no tiene ninguna conexión con ella.
    - **URL:** [Snyk Report](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVEBLUECRYPTO-8310335)
    - **Severidad:** E
    - **Categoría OWASP:** M8

- **Package:** react-native-camera-kit-example
    - **Mínima Versión:** 0
    - **Máxima Versión:** 9999999
    - **ID de Vulnerabilidad:** noID
    - **Descripción:** Paquete malicioso eliminado del gestor de paquetes oficial. Se hace pasar por una organización válida sin estar relacionado con ella.
    - **URL:** [Snyk Report](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVECAMERAKITEXAMPLE-5866153)
    - **Severidad:** E
    - **Categoría OWASP:** M8


- **Package:** react-native-code-push

    - **Mínima Versión:** 0
    - **Máxima Versión:** 9999999
    - **ID de Vulnerabilidad:** noID
    - **Descripción:** Este paquete proporciona integración con CodePush para actualizaciones dinámicas en React Native. Las versiones afectadas son vulnerables a escritura arbitraria de archivos debido a la extracción insegura de archivos comprimidos (Zip Slip).
    - **URL:** [Snyk Report](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVECODEPUSH-173775)
    - **Severidad:** E
    - **Categoría OWASP:** M7

- **Package:** react-native-document-picker
    - **Mínima Versión:** 0
    - **Máxima Versión:** 9999999
    - **ID de Vulnerabilidad:** noID
    - **Descripción:** Este paquete permite acceder a documentos en servicios como Dropbox, Google Drive e iCloud. Las versiones afectadas tienen una vulnerabilidad de Path Traversal en la biblioteca Android, lo que permite la ejecución de código arbitrario si un atacante local suministra un script malicioso.
    - **URL:** [Snyk Report](https://security.snyk.io/vuln/SNYK-JS-REACTNATIVEDOCUMENTPICKER-6249446)
    - **Severidad:** E
    - **Categoría OWASP:** M4




