/* ==========================================
   CONFIGURACIÓN Y VARIABLES GLOBALES
========================================== */
let scrollState = 'zoom'; 
let currentScale = 1;
let sliderX = 0;

document.addEventListener("DOMContentLoaded", () => {
    // Inicialización de funciones existentes
    inyectarElementos();
    initLoader();
    initCursor();
    initPageTransitions();
    initHeaderBehavior();
    initMobileMenu();
    initRevealAnimations();
});

/* ==========================================
   LÓGICA DEL PORTAFOLIO (NUEVA)
========================================== */
window.addEventListener('wheel', (e) => {
    const container = document.getElementById('slider');
    if (!container) return; // Si no existe el slider, no ejecutamos esta lógica

    e.preventDefault();

    // 1. ESTADO ZOOM
    if (scrollState === 'zoom') {
        currentScale = Math.min(Math.max(currentScale + e.deltaY * 0.002, 1), 4);
        container.style.transform = `scale(${currentScale})`;
        
        if (currentScale >= 4) {
            scrollState = 'slider';
            console.log("Estado: SLIDER");
        }
    } 
    // 2. ESTADO SLIDER
    else if (scrollState === 'slider') {
        // Movimiento horizontal suave
        sliderX -= e.deltaY * 0.5;
        
        // Límite manual: Ajusta este -2000 según tus necesidades de ancho real
        sliderX = Math.max(-2000, Math.min(0, sliderX));
        
        container.style.transform = `scale(4) translateX(${sliderX}px)`;

        // Transición final (Solo se dispara al final del scroll)
        if (sliderX <= -1990) { 
            revelarPortafolioCompleto();
        }

        // Scroll inverso para regresar al zoom
        if (sliderX >= 0 && e.deltaY < 0) {
            scrollState = 'zoom';
        }
    }
}, { passive: false });

/* ==========================================
   FUNCIÓN DE REVELACIÓN
========================================== */
function revelarPortafolioCompleto() {
    const wrapper = document.querySelector('.portfolio-wrapper');
    const completo = document.querySelector('.portfolio-completo');
    
    if (wrapper && completo) {
        wrapper.style.transition = "opacity 0.8s ease";
        wrapper.style.opacity = '0';
        
        setTimeout(() => {
            wrapper.style.display = 'none';
            completo.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 800);
    }
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