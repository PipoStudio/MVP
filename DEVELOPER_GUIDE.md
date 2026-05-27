# 🔧 GUÍA RÁPIDA PARA EL PRÓXIMO DESARROLLADOR

> **TL;DR**: El problema era que estábamos simulando scroll horizontal usando `transform: scale` y `translateX` mientras el navegador intentaba aplicar scroll nativo. La solución fue un **Scroll Trigger robusto con debounce** que filtra los eventos y un **cálculo dinámico de maxScroll** que se adapta al zoom actual.

---

## 🎯 El Problema (Resumido)

Antes de los cambios:
- ❌ Scroll nativo y eventos `wheel` en conflicto → saltos erráticos
- ❌ `maxScroll` hardcodeado (-2000px) → tarjetas cortadas en algunos zooms
- ❌ `display: none` rompía historial → botón atrás no funcionaba
- ❌ `transform-origin: left center` → contenedor descentrado, tarjetas cortadas

---

## ✅ La Solución (Implementada)

### 1️⃣ **Debounce + Acumulador de deltaY**

```javascript
// ANTES (problemático):
window.addEventListener('wheel', (e) => {
    currentScale += e.deltaY * 0.002; // CADA evento aplica cambios → saltos
});

// DESPUÉS (robusto):
let lastDeltaY = 0;
let scrollTimeout;
const SCROLL_DEBOUNCE = 50; // ms

window.addEventListener('wheel', (e) => {
    lastDeltaY += e.deltaY; // Acumula
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        procesarScroll(lastDeltaY); // Procesa una sola vez
        lastDeltaY = 0;
    }, SCROLL_DEBOUNCE);
});
```

**Efecto**: Sin saltos, scroll suave y controlado.

---

### 2️⃣ **Cálculo Dinámico de maxScroll**

```javascript
// ANTES (hardcodeado):
sliderX = Math.max(-2000, Math.min(0, sliderX)); // ¿Qué si el zoom es diferente?

// DESPUÉS (dinámico):
function calcularMaxScroll(container) {
    const scrollableWidth = container.scrollWidth; // Ancho real del contenedor
    const visibleWidth = window.innerWidth;
    const maxScroll = -(scrollableWidth * currentScale - visibleWidth);
    return isNaN(maxScroll) ? -2000 : maxScroll;
}
```

**Efecto**: Las tarjetas se adaptan a cualquier zoom sin cortarse.

---

### 3️⃣ **History API en lugar de display: none**

```javascript
// ANTES (rompía historial):
wrapper.style.display = 'none';
completo.style.display = 'block';
// → El navegador no sabe qué es lo anterior

// DESPUÉS (preserva historial):
history.pushState({ state, scale, sliderX }, '', url);
window.addEventListener('popstate', (e) => {
    // Restaurar estado anterior
    scrollState = e.state.state;
    currentScale = e.state.scale;
    sliderX = e.state.sliderX;
    updateContainerTransform();
});
```

**Efecto**: Botón atrás funciona perfectamente.

---

### 4️⃣ **Centrado Consistente**

```css
/* ANTES: transform-origin: left center → descentrado */
.portfolio-wrapper {
    justify-content: flex-start;
}

/* DESPUÉS: transform-origin: center center → centrado */
.portfolio-wrapper {
    justify-content: center; /* ← Centrado horizontal */
    align-items: center;      /* ← Ya estaba, pero ahora coherente */
}

.slider-container {
    transform-origin: center center; /* ← Zoom desde el centro */
}
```

**Efecto**: Las tarjetas siempre están centradas, sin cortes.

---

## 📊 Flujo de Estados (Entendimiento Clave)

```
USUARIO SCROLLEA
    ↓
[Debounce 50ms] ← Acumula deltaY
    ↓
procesarScroll(totalDelta)
    ├─ IF scrollState === 'zoom'
    │  ├─ currentScale += totalDelta * SCALE_SPEED
    │  └─ IF currentScale >= MAX_SCALE → transicionarASlider()
    │
    ├─ ELSE IF scrollState === 'slider'
    │  ├─ maxScroll = calcularMaxScroll()
    │  ├─ sliderX = Math.max(maxScroll, sliderX - totalDelta * SLIDER_SPEED)
    │  ├─ IF sliderX <= maxScroll * 0.95 → revelarPortafolioCompleto()
    │  └─ updateHistoryState()
    │
    └─ updateContainerTransform()
```

---

## 🎚️ Parámetros de Ajuste (Constantes)

Todos en la línea 10-15 de `producto.js`:

| Constante | Valor | Efecto |
|-----------|-------|--------|
| `SCROLL_DEBOUNCE` | 50 | Tiempo entre actualizaciones (ms). ↑ = menos actualizaciones, ↓ = más sensible |
| `SCALE_SPEED` | 0.002 | Velocidad del zoom. ↑ = zoom rápido, ↓ = zoom lento |
| `SLIDER_SPEED` | 0.5 | Velocidad del slider. ↑ = movimiento rápido, ↓ = movimiento lento |
| `MAX_SCALE` | 5 | Nivel de zoom donde pasa a slider. ↑ = zoom más profundo |
| `TRANSITION_THRESHOLD` | 0.95 | % del scroll máximo para disparar portafolio. ↓ = más pronto |

**Ajuste rápido**: Si todo es muy lento, ↓ `SCALE_SPEED` y ↑ `SLIDER_SPEED`.

---

## 🐛 Debugging: Qué Ver en DevTools

**Console logs automáticos**:
```
🔍 ZOOM: 2.34x              ← Escala actual en estado zoom
📊 SLIDER: -450px / -2100px ← Posición actual / máximo permitido
↔️  TRANSICIÓN: zoom → slider ← Cuando cambia de estado
✨ Alcanzado final de slider  ← Cuando dispara portafolio completo
```

**Verificar scrollWidth** (Elements tab):
```javascript
// En DevTools console:
document.getElementById('slider').scrollWidth
// Debería ser mucho más grande que 100vw
```

---

## 🚨 Si Algo Falla

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Zoom muy lento | `SCALE_SPEED` muy bajo | Aumentar a 0.003 o 0.004 |
| Slider muy lento | `SLIDER_SPEED` muy bajo | Aumentar a 1.0 o 1.5 |
| Saltos erráticos | Debounce no funciona | Verificar `SCROLL_DEBOUNCE` < 100 |
| Tarjetas cortadas | `calcularMaxScroll()` falla | Verificar `scrollWidth` en DevTools |
| Botón atrás no funciona | History API deshabilitada | Verificar en DevTools Network (status 200) |
| Contenedor descentrado | CSS mal | Verificar `transform-origin: center center` |

---

## 📌 Checklist Para Próximos Cambios

Si necesitas modificar:

- [ ] **Velocidades**: Editar constantes en línea 10-15
- [ ] **Agregar tarjetas**: Mantener `flex-shrink: 0` en `.card`
- [ ] **Cambiar colores**: Editar variables de gradiente en CSS
- [ ] **Responsive**: Agregar `@media` query en `producto.css`
- [ ] **Tocar eventos**: Agregar `touchstart`/`touchmove` listeners (NO implementado aún)
- [ ] **Performance**: `will-change: transform` en `.slider-container` (ya puesto)

---

## 🔗 Referencias de Commits

| Commit | Cambio |
|--------|--------|
| `df7c3962` | Implementar Scroll Trigger robusto con debounce |
| `dbd2b46c` | Mejorar HTML con metadata |
| `cdc420db` | Mejorar CSS: centrado y animaciones |
| `6bbbae36` | Agregar documentación técnica |

---

## 💡 Lo Que Aprendimos

1. **Debounce es tu amigo**: Acumular eventos en lugar de procesarlos uno a uno = estabilidad
2. **ScrollWidth es dinámico**: No hardcodees números, calcula en tiempo real
3. **History API > display: none**: Para transiciones complejas, siempre usa History
4. **Transform-origin matters**: Un pequeño detalle CSS puede romper toda la alineación

---

**¿Preguntas?** Lee `REFACTOR_CHANGELOG.md` para más detalles técnicos.

**¿Urgencia?** Haz un `console.log()` en `procesarScroll()` para ver qué valores se están aplicando.
