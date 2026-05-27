/* ==========================================
   CONFIGURACIÓN Y VARIABLES GLOBALES
========================================== */
let scrollState = 'zoom'; 
let currentScale = 1;
let sliderPosition = 0;

document.addEventListener("DOMContentLoaded", () => {
    // Inicialización de funciones existentes
    inyectarElementos();
    initLoader();
    initCursor();
    initPageTransitions();
    initHeaderBehavior();
    initMobileMenu();
    initRevealAnimations();

    // Lógica del Portafolio (Iniciada una sola vez aquí)
    const container = document.getElementById('slider');
    if (container) {
        window.addEventListener('wheel', (e) => {
            e.preventDefault();

            // 1. ESTADO ZOOM
            if (scrollState === 'zoom') {
                currentScale += e.deltaY * 0.002;
                currentScale = Math.min(Math.max(currentScale, 1), 5);
                container.style.transform = `scale(${currentScale}) translateX(0px)`;

                if (currentScale >= 5) {
                    scrollState = 'slider';
                    console.log("Estado: SLIDER ACTIVADO");
                }
            } 
            // 2. ESTADO SLIDER
            else if (scrollState === 'slider') {
                const maxScroll = (container.scrollWidth) - window.innerWidth;
                
                sliderPosition += e.deltaY * 0.8; 
                sliderPosition = Math.max(0, Math.min(sliderPosition, maxScroll));
                
                container.style.transform = `scale(5) translateX(${-sliderPosition / 5}px)`;
                
                // Transición al portafolio completo
                if (sliderPosition >= maxScroll - 10 && e.deltaY > 0) {
                     scrollState = 'portfolio';
                     revelarPortafolioCompleto();
                }
                
                if (sliderPosition <= 0 && e.deltaY < 0) {
                    scrollState = 'zoom';
                }
            }
        }, { passive: false });
    }
});

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
   FUNCIONES EXISTENTES
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

// Nota: Asegúrate de tener implementadas las funciones restantes que llamaste en DOMContentLoaded
function initLoader() {} 
function initPageTransitions() {} 
function initHeaderBehavior() {} 
function initMobileMenu() {} 
function initRevealAnimations() {}