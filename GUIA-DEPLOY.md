# AXON PWA — Guía de Deploy

## Qué hay en este paquete

```
axon-pwa/
├── index.html              ← Tu app (mejorada con PWA)
├── manifest.json           ← Hace tu app "instalable"
├── sw.js                   ← Service worker (cache offline)
├── offline.html            ← Fallback sin conexión
├── netlify.toml            ← Config de Netlify + headers
├── icons/
│   └── icon-placeholder.svg  ← Reemplaza con tus PNGs
└── netlify/
    └── functions/
        └── insights.mjs    ← Proxy seguro para Anthropic API
```

---

## Paso 1: Generar íconos (5 min)

Necesitas 2 archivos PNG en la carpeta `icons/`:
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

**Opción rápida:** Abre `icons/icon-placeholder.svg` en el navegador, toma screenshot y recórtalo. O usa Figma/Canva para hacer algo mejor.

**Opción pro:** Usa [realfavicongenerator.net](https://realfavicongenerator.net) para generar todos los tamaños desde una imagen de 512px.

---

## Paso 2: Configurar API key segura (2 min)

1. Ve a tu sitio en [app.netlify.com](https://app.netlify.com)
2. **Site settings → Environment variables**
3. Agrega: `ANTHROPIC_API_KEY` = tu key de [console.anthropic.com](https://console.anthropic.com)

Esto es lo que hace que `/api/insights` funcione sin exponer tu key.

---

## Paso 3: Subir a Netlify (3 min)

### Opción A — Drag & drop (más fácil)
1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta `axon-pwa/` completa
3. Listo — te da una URL tipo `algo-random.netlify.app`

### Opción B — Reemplazar tu sitio actual
1. Ve a tu sitio actual (`benevolent-selkie-b97a91.netlify.app`)
2. **Deploys → Drag and drop** tu carpeta `axon-pwa/`
3. Mismo URL, ahora con PWA

### Opción C — Git (para updates continuos)
```bash
cd axon-pwa
git init
git add .
git commit -m "AXON PWA v1"
# Crea repo en GitHub y conecta:
git remote add origin https://github.com/tu-user/axon-pwa.git
git push -u origin main
```
Luego en Netlify: **New site → Import from Git → selecciona el repo**

---

## Paso 4: Verificar que funciona (5 min)

### Verificar PWA:
1. Abre tu URL en **Chrome** (desktop o Android)
2. Deberías ver el ícono de "instalar" en la barra de dirección
3. Después de ~8 segundos aparece el banner de instalar en la app

### Verificar en iOS:
1. Abre tu URL en **Safari**
2. Toca "Compartir" → "Agregar a pantalla de inicio"
3. Se instala con el ícono y nombre de AXON

### Verificar API proxy:
1. Registra al menos 1 día en la app
2. Ve a Insights → "Generar Insights"
3. Debe funcionar sin errores (la API call va por `/api/insights`)

### Debug avanzado:
- Chrome DevTools → **Application** → Manifest (verifica que cargue)
- Chrome DevTools → **Application** → Service Workers (verifica registro)
- Chrome DevTools → **Lighthouse** → Run audit → Score PWA

---

## Paso 5: Dominio personalizado (opcional)

1. Compra un dominio (Namecheap, Cloudflare, Google Domains)
2. En Netlify: **Domain settings → Add custom domain**
3. Netlify te configura HTTPS automáticamente

Ejemplo: `axon.app`, `useaxon.com`, `getaxon.co`

---

## Lo que cambió vs tu código original

| Qué | Antes | Ahora |
|-----|-------|-------|
| API key | Expuesta en el HTML | Segura en Netlify Function |
| Instalable | No | Sí (PWA) |
| Offline | No | Sí (Service Worker) |
| iOS safe areas | No | Sí (viewport-fit, env()) |
| Touch optimized | Parcial | Completo (touch-action, no zoom) |
| Font size inputs | 14px (iOS zoom) | 16px (sin zoom) |
| Feedback al usuario | Ninguno | Toasts, loading states |
| Slider thumb | Default del browser | Custom, más grande para touch |
| Password field | No existía | Preparado para Supabase auth |

---

## Siguiente paso: Backend real con Supabase

Cuando quieras que los datos persistan en la nube (no solo localStorage):

1. Crea proyecto en [supabase.com](https://supabase.com) (gratis)
2. Crea tablas `profiles` y `logs` con RLS
3. Agrega `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
4. Reemplaza las funciones de auth y guardado de logs

Esto te da: login real, datos en la nube, acceso desde cualquier dispositivo.

---

## Publicar en App Stores

### Android (Play Store):
1. Ve a [pwabuilder.com](https://www.pwabuilder.com)
2. Ingresa tu URL
3. Te genera un paquete APK/AAB
4. Súbelo a Google Play Console ($25 una vez)

### iOS (App Store):
1. Instala [Capacitor](https://capacitorjs.com):
```bash
npm init -y
npm install @capacitor/core @capacitor/cli
npx cap init AXON com.axon.app --web-dir .
npx cap add ios
npx cap sync
npx cap open ios  # Abre Xcode
```
2. En Xcode: firma con tu Apple Developer Account ($99/año)
3. Archive → Upload to App Store Connect

---

## Costos

| Servicio | Free tier | Cuándo pagas |
|----------|-----------|--------------|
| Netlify | 100 GB bandwidth, 125K function calls/mes | Muchos usuarios |
| Supabase | 500 MB DB, 50K MAU | Muchos usuarios |
| Anthropic API | ~$0.003 por insight generado | Desde el primer uso |
| Google Play | $25 una vez | Si publicas |
| Apple Developer | $99/año | Si publicas |

**Para arrancar: $0/mes** (solo pagas lo que uses de Anthropic)
