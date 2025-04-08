# Guía de Seguridad para Aplicaciones Android

### 1. Configuración de `android:allowBackup`
Para evitar que los datos de la aplicación se incluyan en copias de seguridad, establecer:

**Salida esperada:** `android:allowBackup="true"`

**Ubicación:** `AndroidManifest.xml`

---

### 2. Configuración de `android:installLocation`
Para restringir la instalación al almacenamiento interno y prevenir accesos externos, establecer:

**Salida esperada:** `android:installLocation="internalOnly"`

**Ubicación:** `AndroidManifest.xml`


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

---

### 5. Permisos peligrosos
Lista de permisos peligrosos (Permisos con severity: 'E'):

- `ACCESS_COARSE_LOCATION` - Acceso a la ubicación aproximada  
- `ACCESS_FINE_LOCATION` - Acceso a la ubicación precisa  
- `CAMERA` - Permiso para acceder a la cámara  
- `READ_CONTACTS` - Acceso a los contactos  
- `READ_PHONE_NUMBERS` - Acceso a los números de teléfono  
- `READ_MEDIA_IMAGES` - Acceso a imágenes del medio  
- `USE_BIOMETRIC` - Uso de biometría  
- `WRITE_CONTACTS` - Escribir en los contactos  
- `ACCESS_BACKGROUND_LOCATION` - Acceso a la ubicación en segundo plano  

#### Permisos deprecados  
(Permisos que en su descripción indican que están deprecados):

- `ACCESS_FINGERPRINT_MANAGER` - Deprecado desde API 28, usar `USE_BIOMETRIC`  
- `USE_FINGERPRINT` - Deprecado desde API 28, usar `USE_BIOMETRIC`  
- `READ_EXTERNAL_STORAGE` - Deprecado a partir de API 33, usar `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`  
- `WRITE_EXTERNAL_STORAGE` - Deprecado desde API 30  
- `ACCESS_FINE_LOCATION_BACKGROUND` - Deprecado, usar `ACCESS_BACKGROUND_LOCATION`  
- `CAMERA_PERMISSION` - Deprecado, usar `CAMERA`  

---




### 6. Uso de `WRITE_EXTERNAL_STORAGE`
Este permiso es peligroso y se debe evitar para prevenir exposición de datos.

**Salida esperada:** No se utiliza almacenamiento externo para evitar exposición de datos.

**Ubicación:** `AndroidManifest.xml`

---


### 7. Configuración de `cleartextTrafficPermitted`
Para enviar a producción, establecer:

**Salida esperada:** `cleartextTrafficPermitted="false"`

**Ubicación:** `network_security_config.xml`

---

### 8. Configuración de `android:launchMode`
Para evitar accesos indebidos y garantizar el aislamiento de actividades sensibles, establecer:

**Salida esperada:** `android:launchMode="singleInstance"`

**Ubicación:** `AndroidManifest.xml`

*(No se incluirá la configuración de `android:configChanges`.)*

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




