/* ==========================================
   CONFIGURACIÓN Y VARIABLES GLOBALES
========================================== */
let scrollState = 'zoom'; 
let currentScale = 1;
let sliderX = 0;
let isScrolling = false;
let scrollTimeout;
let lastDeltaY = 0;
const SCROLL_DEBOUNCE = 50; // ms entre actualizaciones
const SCALE_SPEED = 0.002;
const SLIDER_SPEED = 0.5;
const MIN_SCALE = 1;
const MAX_SCALE = 5;
const TRANSITION_THRESHOLD = 0.95; // 95% del scroll máximo

document.addEventListener("DOMContentLoaded", () => {
    // Inicialización de funciones existentes
    inyectarElementos();
    initLoader();
    initCursor();
    initPageTransitions();
    initHeaderBehavior();
    initMobileMenu();
    initRevealAnimations();
    
    // Inicializar el sistema de portafolio
    initPortfolioSystem();
});

/* ==========================================
   SISTEMA DE PORTAFOLIO CON SCROLL TRIGGER
========================================== */
function initPortfolioSystem() {
    const container = document.getElementById('slider');
    if (!container) return;
    
    // Registrar estado en history
    if (window.location.hash === '') {
        history.replaceState({ state: 'zoom', scale: 1, sliderX: 0 }, '', window.location.href);
    }
    
    // Escuchar cambios en history (botón atrás)
    window.addEventListener('popstate', (e) => {
        if (e.state) {
            scrollState = e.state.state;
            currentScale = e.state.scale;
            sliderX = e.state.sliderX;
            updateContainerTransform();
        }
    });
}

function updateContainerTransform() {
    const container = document.getElementById('slider');
    if (!container) return;
    
    if (scrollState === 'zoom') {
        container.style.transform = `scale(${currentScale})`;
    } else if (scrollState === 'slider') {
        container.style.transform = `scale(${currentScale}) translateX(${sliderX}px)`;
    }
}

function updateHistoryState() {
    history.pushState(
        { state: scrollState, scale: currentScale, sliderX: sliderX },
        '',
        window.location.href
    );
}

/* ==========================================
   HANDLER PRINCIPAL CON DEBOUNCE
========================================== */
window.addEventListener('wheel', (e) => {
    const container = document.getElementById('slider');
    if (!container) return;
    
    // Prevenir scroll nativo
    e.preventDefault();
    
    // Debounce: acumular delta dentro del timeout
    lastDeltaY += e.deltaY;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        procesarScroll(lastDeltaY, container);
        lastDeltaY = 0;
    }, SCROLL_DEBOUNCE);
    
}, { passive: false });

/* ==========================================
   PROCESAMIENTO DE SCROLL CON LÓGICA DE ESTADOS
========================================== */
function procesarScroll(deltaY, container) {
    // 1. ESTADO ZOOM: Escalar el contenedor
    if (scrollState === 'zoom') {
        const newScale = currentScale + deltaY * SCALE_SPEED;
        currentScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
        
        updateContainerTransform();
        updateHistoryState();
        
        console.log(`🔍 ZOOM: ${currentScale.toFixed(2)}x`);
        
        // Transición automática al llegar a MAX_SCALE
        if (currentScale >= MAX_SCALE - 0.1) {
            transicionarASlider();
        }
        return;
    }
    
    // 2. ESTADO SLIDER: Desplazamiento horizontal
    if (scrollState === 'slider') {
        const maxScroll = calcularMaxScroll(container);
        
        // Invertir dirección: scroll hacia abajo = movimiento izquierda
        sliderX -= deltaY * SLIDER_SPEED;
        sliderX = Math.max(maxScroll, Math.min(0, sliderX));
        
        updateContainerTransform();
        updateHistoryState();
        
        console.log(`📊 SLIDER: ${sliderX.toFixed(0)}px / ${maxScroll.toFixed(0)}px`);
        
        // Verificar si llegamos al final
        if (sliderX <= maxScroll * TRANSITION_THRESHOLD) {
            console.log("✨ Alcanzado final de slider - Revelando portafolio");
            setTimeout(revelarPortafolioCompleto, 300);
        }
        
        // Permitir regreso al zoom si volvemos al inicio
        if (sliderX >= -50 && deltaY < 0) {
            transicionarAZoom();
        }
        return;
    }
}

/* ==========================================
   CÁLCULO DINÁMICO DE MAX SCROLL
========================================== */
function calcularMaxScroll(container) {
    // El scrollWidth nos da el ancho total del contenedor con sus hijos
    const scrollableWidth = container.scrollWidth;
    
    // El ancho visible es el viewport
    const visibleWidth = window.innerWidth;
    
    // La diferencia es lo máximo que podemos desplazar
    // Multiplicamos por el scale para ajustar al zoom actual
    const maxScroll = -(scrollableWidth * currentScale - visibleWidth);
    
    // Asegurar que no sea un número inválido
    return isNaN(maxScroll) ? -2000 : maxScroll;
}

/* ==========================================
   TRANSICIONES DE ESTADO
========================================== */
function transicionarASlider() {
    if (scrollState !== 'zoom') return;
    
    scrollState = 'slider';
    sliderX = 0; // Reiniciar desde el inicio
    
    const container = document.getElementById('slider');
    if (container) {
        container.style.transition = 'transform 0.3s ease-out';
        updateContainerTransform();
        
        setTimeout(() => {
            container.style.transition = 'transform 0.1s ease-out';
        }, 300);
    }
    
    updateHistoryState();
    console.log("↔️  TRANSICIÓN: zoom → slider");
}

function transicionarAZoom() {
    if (scrollState !== 'slider') return;
    
    scrollState = 'zoom';
    
    const container = document.getElementById('slider');
    if (container) {
        container.style.transition = 'transform 0.3s ease-out';
        updateContainerTransform();
        
        setTimeout(() => {
            container.style.transition = 'transform 0.1s ease-out';
        }, 300);
    }
    
    updateHistoryState();
    console.log("↔️  TRANSICIÓN: slider → zoom");
}

/* ==========================================
   FUNCIÓN DE REVELACIÓN CON HISTORIAL
========================================== */
function revelarPortafolioCompleto() {
    const wrapper = document.querySelector('.portfolio-wrapper');
    const completo = document.querySelector('.portfolio-completo');
    
    if (!wrapper || !completo) return;
    
    // Guardar estado anterior en el historial
    history.pushState(
        { state: 'portfolio-complete', scale: currentScale, sliderX: sliderX },
        'Portafolio Completo',
        window.location.href
    );
    
    // Animar desaparición
    wrapper.style.transition = "opacity 0.8s ease";
    wrapper.style.opacity = '0';
    
    setTimeout(() => {
        wrapper.style.display = 'none';
        completo.style.display = 'block';
        completo.style.opacity = '0';
        
        // Trigger reflow para que se aplique el display
        void completo.offsetHeight;
        
        completo.style.transition = 'opacity 0.8s ease';
        completo.style.opacity = '1';
    }, 800);
    
    scrollState = 'portfolio-complete';
}

/* ==========================================
   FUNCIONES EXISTENTES (MANTENIDAS ÍNTEGRAS)
========================================== */
function inyectarElementos() {
    if (!document.querySelector('.site-loader')) {
        const elementos = `
            <div class="site-loader">
                <h1 class="loader-logo">Amplify<span>.</span></h1>
                <div class="loader-line"></div>
            </div>
            <div class="custom-cursor"></div>
            <div class="page-transition"></div>
        `;
        document.body.insertAdjacentHTML('afterbegin', elementos);
    }
}

function initCursor() {
    const cursor = document.querySelector(".custom-cursor");
    if (!cursor) return;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let currentScale = 1;

    function animateCursor() {
        currentX += (mouseX - currentX) * 0.14;
        currentY += (mouseY - currentY) * 0.14;
        cursor.style.left = currentX + "px";
        cursor.style.top = currentY + "px";
        cursor.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    window.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });
}

function initLoader() {
    const loader = document.querySelector(".site-loader");
    if (!loader) return;
    if (sessionStorage.getItem('loader-viewed')) {
        loader.style.display = 'none';
        return;
    }
    window.addEventListener('load', () => {
        loader.classList.add("hidden");
        sessionStorage.setItem('loader-viewed', 'true');
        setTimeout(() => loader.style.display = 'none', 1000);
    });
}

function initPageTransitions() {
    const transitionLayer = document.querySelector(".page-transition");
    document.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (href && (href.startsWith('/') || href.startsWith('.'))) {
                e.preventDefault();
                const loader = document.querySelector(".site-loader");
                if (loader) {
                    loader.style.display = 'flex';
                    loader.classList.remove("hidden");
                }
                setTimeout(() => { window.location.href = href; }, 800);
            }
        });
    });
}

function initHeaderBehavior() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    let lastScroll = 0;
    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 40) header.classList.add("scrolled");
        else header.classList.remove("scrolled");
        header.style.transform = (currentScroll > lastScroll && currentScroll > 120) 
            ? "translateY(-100%)" : "translateY(0%)";
        lastScroll = currentScroll;
    });
}

function initMobileMenu() {
    const btn = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".main-navigation");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
        nav.classList.toggle("mobile-active");
        btn.classList.toggle("active");
        document.body.style.overflow = nav.classList.contains("mobile-active") ? "hidden" : "";
    });
}

function initRevealAnimations() {
    const elements = document.querySelectorAll(".fade-up, .fade-left, .fade-right, .scale-in");
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = "running";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    elements.forEach(el => {
        el.style.animationPlayState = "paused";
        observer.observe(el);
    });
}
