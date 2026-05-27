# 📋 MVP Portafolio - Guía de Cambios

## ✅ Problemas Resueltos

### 1. **Conflicto de Eventos (Scroll Nativo vs Wheel)**
**Problema**: Saltos y desplazamientos erráticos al combinar scroll nativo con `wheel` events.

**Solución**:
```javascript
// Debounce de 50ms que acumula deltaY antes de procesar
let scrollTimeout;
let lastDeltaY = 0;
const SCROLL_DEBOUNCE = 50; // ms

window.addEventListener('wheel', (e) => {
    e.preventDefault();
    lastDeltaY += e.deltaY;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        procesarScroll(lastDeltaY, container);
        lastDeltaY = 0;
    }, SCROLL_DEBOUNCE);
}, { passive: false });
```

**Resultado**: Sin saltos, transiciones suaves entre estados.

---

### 2. **Cálculo Dinámico de maxScroll**
**Problema**: `scrollWidth` no coincidía con contenedor escalado, cortando imágenes.

**Solución**:
```javascript
function calcularMaxScroll(container) {
    const scrollableWidth = container.scrollWidth;
    const visibleWidth = window.innerWidth;
    const maxScroll = -(scrollableWidth * currentScale - visibleWidth);
    return isNaN(maxScroll) ? -2000 : maxScroll;
}
```

**Resultado**: Las tarjetas siempre quedan completas, sin espacios negros.

---

### 3. **Pérdida de Historial (Botón Atrás)**
**Problema**: `display: none` rompía la navegación atrás del navegador.

**Solución**:
```javascript
// History API en lugar de display: none
history.pushState(
    { state: scrollState, scale: currentScale, sliderX: sliderX },
    '',
    window.location.href
);

// Restaurar estado al hacer click en atrás
window.addEventListener('popstate', (e) => {
    if (e.state) {
        scrollState = e.state.state;
        currentScale = e.state.scale;
        sliderX = e.state.sliderX;
        updateContainerTransform();
    }
});
```

**Resultado**: Botón atrás funciona perfectamente.

---

### 4. **Alineación/Centrado**
**Problema**: Contenedor no centrado durante zoom + slider = tarjetas cortadas.

**Solución**:
```css
.portfolio-wrapper {
    display: flex;
    align-items: center;
    justify-content: center; /* ← Centrado horizontal y vertical */
}

.slider-container {
    transform-origin: center center; /* ← Zoom desde el centro */
}
```

**Resultado**: Las tarjetas permanecen centradas en todo momento.

---

## 🎮 Diagrama de Estados

```
┌─────────────────────────────────────────────┐
│ ESTADO ZOOM (Escala 1x → 5x)                │
│ - Usuario scrollea hacia arriba              │
│ - Contenedor se escala gradualmente          │
│ - Al llegar a 5x → transición a SLIDER       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ ESTADO SLIDER (TranslateX horizontal)       │
│ - Scroll horizontal de tarjetas             │
│ - maxScroll calculado dinámicamente         │
│ - Al 95% del scroll → PORTFOLIO COMPLETO    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ ESTADO PORTFOLIO (Revelar portafolio)       │
│ - Fade out del wrapper                      │
│ - Fade in de .portfolio-completo            │
│ - Historial guardado para navegación atrás  │
└─────────────────────────────────────────────┘
```

---

## ⚙️ Constantes Configurables

Todas en la parte superior de `producto.js`:

```javascript
const SCROLL_DEBOUNCE = 50;        // Tiempo entre actualizaciones (ms)
const SCALE_SPEED = 0.002;         // Velocidad de zoom (ajusta si lento/rápido)
const SLIDER_SPEED = 0.5;          // Velocidad de slider (ajusta si lento/rápido)
const MIN_SCALE = 1;               // Zoom mínimo
const MAX_SCALE = 5;               // Zoom máximo (transición a slider)
const TRANSITION_THRESHOLD = 0.95; // % del scroll para disparar portafolio
```

---

## 📱 Responsive Design

```css
/* Desktop (por defecto) */
.card { width: 30vw; height: 40vw; }

/* Tablets */
@media (max-width: 768px) {
    .card { width: 60vw; height: 80vw; }
}
```

---

## 🔍 Logs de Depuración

Abierto el DevTools Console para ver:
```
🔍 ZOOM: 2.34x
📊 SLIDER: -450px / -2100px
↔️  TRANSICIÓN: zoom → slider
✨ Alcanzado final de slider - Revelando portafolio
```

---

## 🚀 Deploy Checklist

- [ ] Testear en Chrome, Firefox, Safari
- [ ] Testear en móvil (iPhone, Android)
- [ ] Verificar que `scrollWidth` es correcto (DevTools)
- [ ] Confirmar historial funciona (botón atrás)
- [ ] Ajustar `SCALE_SPEED` y `SLIDER_SPEED` si es necesario
- [ ] Comprimir imágenes de Unsplash a tamaño óptimo

---

## 📞 Soporte Rápido

**¿Tarda mucho el zoom?**
→ Disminuir `SCALE_SPEED` (ej: 0.001)

**¿Muy rápido?**
→ Aumentar `SCALE_SPEED` (ej: 0.003)

**¿Las tarjetas se cortan en el slider?**
→ El `calcularMaxScroll()` debería ajustarse automáticamente. Verificar `container.scrollWidth` en DevTools.

**¿El slider salta?**
→ Aumentar `SCROLL_DEBOUNCE` a 100ms.

---

## 📂 Estructura de Archivos

```
MVP/
├── producto.html        (HTML mejorado + metadata)
├── producto.css         (CSS con transform-origin center)
├── producto.js          (JS con debounce + History API)
├── fotomontaje.html     (Destino de tarjeta 1)
├── retouching.html      (Destino de tarjeta 2)
├── design.html          (Destino de tarjeta 3)
└── portafolio.html      (Destino de "Ver todo")
```

---

**Última actualización**: 2026-05-27  
**Commits relacionados**: df7c3962, dbd2b46c, cdc420db
