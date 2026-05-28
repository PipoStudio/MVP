/* =========================
   DOM
========================= */
document.addEventListener(
    "DOMContentLoaded",
    () => {
        initExperience();
    }
);
/* =========================================================
   INIT
========================================================= */
function initExperience() {
    initBodyMode();
    initCursor();
    initPageTransitions();
    initImmersiveSlider();
    initFooterUnlock();
    initHeroFade();
}
/* =========================================================
   BODY MODE
========================================================= */
function initBodyMode() {
    document.body.classList.add(
        "horizontal-mode"
    );
}
/* =========================================================
   CURSOR
========================================================= */
function initCursor() {
    const cursor =
        document.querySelector(
            ".magnify-cursor"
        );
    if (!cursor) return;
    /* =========================
       VALUES
    ========================= */
    let mouseX =
        window.innerWidth / 2;
    let mouseY =
        window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let currentScale = 1;
    let targetScale = 1;
    /* =========================
       READY
    ========================= */
    document.body.classList.add(
        "cursor-ready"
    );
    /* =========================
       MOVE
    ========================= */
    window.addEventListener(
        "mousemove",
        (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    );
    /* =========================
       HOVER
    ========================= */
    const hoverTargets =
        document.querySelectorAll(
            "a, button, .discipline-card"
        );
    hoverTargets.forEach((el) => {
        el.addEventListener(
            "mouseenter",
            () => {
                targetScale = 1.4;
            }
        );
        el.addEventListener(
            "mouseleave",
            () => {
                targetScale = 1;
            }
        );
    });
    /* =========================
       RAF
    ========================= */
    function animateCursor() {
        currentX +=
            (mouseX - currentX) * 0.12;
        currentY +=
            (mouseY - currentY) * 0.12;
        currentScale +=
            (targetScale - currentScale)
            * 0.1;
        cursor.style.left =
            currentX + "px";
        cursor.style.top =
            currentY + "px";
        cursor.style.transform =
            `
            translate(-50%, -50%)
            scale(${currentScale})
            `;
        requestAnimationFrame(
            animateCursor
        );
    }
    animateCursor();
}
/* =========================================================
   TRANSITIONS
========================================================= */
function initPageTransitions() {
    const links =
        document.querySelectorAll(
            "[data-transition]"
        );
    links.forEach((link) => {
        link.addEventListener(
            "click",
            (e) => {
                const href =
                    link.getAttribute(
                        "href"
                    );
                if (!href) return;
                e.preventDefault();
                document.body.classList.add(
                    "is-transitioning"
                );
                setTimeout(() => {
                    window.location.href =
                        href;
                }, 900);
            }
        );
    });
}
/* =========================================================
   HERO FADE
========================================================= */
function initHeroFade() {
    const hero =
        document.querySelector(
            ".experience-hero"
        );
    if (!hero) return;
    let hidden = false;
    window.addEventListener(
        "wheel",
        () => {
            if (!hidden) {
                hero.classList.add(
                    "hero-hidden"
                );
                hidden = true;
            }
        },
        { passive: true }
    );
}
/* =========================================================
   IMMERSIVE
========================================================= */
function initImmersiveSlider() {
    const section =
        document.getElementById(
            "immersiveSection"
        );
    const wrapper =
        document.getElementById(
            "zoomWrapper"
        );
    const track =
        document.getElementById(
            "horizontalTrack"
        );
    const cards =
        document.querySelectorAll(
            ".discipline-card"
        );
    if (
        !section ||
        !wrapper ||
        !track
    ) return;
    /* =========================
       STATES
    ========================= */
    const STATES = {
        ZOOM: "zoom",
        HORIZONTAL:
            "horizontal",
        END: "end"
    };
    let currentState =
        STATES.ZOOM;
    /* =========================
       VALUES
    ========================= */
    let currentScale = 1;
    let targetScale = 1;
    let currentX = 0;
    let targetX = 0;
    /* =========================
       CONFIG
    ========================= */
    const MAX_SCALE = 4;
    const MIN_SCALE = 1;
    const SCALE_SPEED = 0.0022;
    const HORIZONTAL_SPEED = 1.15;
    const LERP = 0.08;
    /* =========================
       LIMITS
    ========================= */
    let maxTranslate = 0;
    let firstOffset = 0;
    /* =========================
       CALCULATE
    ========================= */
    function calculateLimits() {
        const viewport =
            window.innerWidth;
        const totalWidth =
            track.scrollWidth;
        const firstCard =
            cards[0];
        if (!firstCard) return;
        firstOffset =
            firstCard.offsetLeft
            -
            (
                viewport
                -
                firstCard.offsetWidth
            ) / 2;
        maxTranslate =
            totalWidth
            -
            viewport
            +
            (
                viewport
                -
                firstCard.offsetWidth
            ) / 2;
    }
    calculateLimits();
    window.addEventListener(
        "resize",
        calculateLimits
    );
    /* =========================
       INITIAL POSITION
    ========================= */
    targetX = firstOffset;
    currentX = firstOffset;
    /* =========================
       RAF
    ========================= */
    function animateScene() {
        currentScale +=
            (targetScale - currentScale)
            * LERP;
        currentX +=
            (targetX - currentX)
            * LERP;
        /* =====================
           SCALE
        ===================== */
        wrapper.style.transform =
            `
            translate(-50%, -50%)
            scale(${currentScale})
            `;
        /* =====================
           TRACK
        ===================== */
        track.style.transform =
            `
            translate3d(
                ${-currentX}px,
                0,
                0
            )
            `;
        /* =====================
           CARD MODES
        ===================== */
        updateCards();
        requestAnimationFrame(
            animateScene
        );
    }
    animateScene();
    /* =========================
       UPDATE CARDS
    ========================= */
    function updateCards() {
        const progress =
            currentX /
            Math.max(maxTranslate, 1);
        cards.forEach((card, index) => {
            const trigger =
                index * 0.22;
            if (
                progress >= trigger
            ) {
                card.classList.add(
                    "horizontal-mode"
                );
            } else {
                card.classList.remove(
                    "horizontal-mode"
                );
            }
        });
    }
    /* =========================
       WHEEL
    ========================= */
    window.addEventListener(
        "wheel",
        handleWheel,
        { passive: false }
    );
    /* =========================
       HANDLE
    ========================= */
    function handleWheel(e) {
        const body =
            document.body;
        /* =====================
           VERTICAL MODE
        ===================== */
        if (
            body.classList.contains(
                "vertical-mode"
            )
        ) {
            return;
        }
        e.preventDefault();
        const delta =
            e.deltaY;
                    /* =================================================
           STATE — ZOOM
        ================================================= */
        if (
            currentState === STATES.ZOOM
        ) {
            targetScale +=
                delta * SCALE_SPEED;
            targetScale =
                clamp(
                    targetScale,
                    MIN_SCALE,
                    MAX_SCALE
                );
            /* =============================================
               ENTER HORIZONTAL
            ============================================= */
            if (
                targetScale >= MAX_SCALE
            ) {
                targetScale =
                    MAX_SCALE;
                currentState =
                    STATES.HORIZONTAL;
            }
            /* =============================================
               LIMIT
            ============================================= */
            if (
                targetScale <= MIN_SCALE
            ) {
                targetScale =
                    MIN_SCALE;
            }
        }
        /* =================================================
           STATE — HORIZONTAL
        ================================================= */
        else if (
            currentState ===
            STATES.HORIZONTAL
        ) {
            targetX +=
                delta * HORIZONTAL_SPEED;
            targetX =
                clamp(
                    targetX,
                    firstOffset,
                    maxTranslate
                );
            /* =============================================
               RETURN TO ZOOM
            ============================================= */
            if (
                targetX <= firstOffset &&
                delta < 0
            ) {
                currentState =
                    STATES.ZOOM;
            }
            /* =============================================
               FINAL STATE
            ============================================= */
            if (
                targetX >=
                maxTranslate - 4
            ) {
                currentState =
                    STATES.END;
            }
        }
        /* =================================================
           STATE — END
        ================================================= */
        else if (
            currentState === STATES.END
        ) {
            targetX +=
                delta * HORIZONTAL_SPEED;
            targetX =
                clamp(
                    targetX,
                    firstOffset,
                    maxTranslate
                );
            /* =============================================
               RETURN
            ============================================= */
            if (delta < 0) {
                currentState =
                    STATES.HORIZONTAL;
            }
        }
    }
    /* =========================
       PARALLAX
    ========================= */
    cards.forEach((card) => {
        const image =
            card.querySelector("img");
        if (!image) return;
        card.addEventListener(
            "mousemove",
            (e) => {
                const rect =
                    card.getBoundingClientRect();
                const x =
                    (
                        e.clientX -
                        rect.left
                    ) / rect.width;
                const y =
                    (
                        e.clientY -
                        rect.top
                    ) / rect.height;
                const moveX =
                    (x - 0.5) * 22;
                const moveY =
                    (y - 0.5) * 22;
                image.style.transform =
                    `
                    scale(1.08)
                    translate(
                        ${moveX}px,
                        ${moveY}px
                    )
                    `;
            }
        );
        card.addEventListener(
            "mouseleave",
            () => {
                image.style.transform =
                    `
                    scale(1)
                    translate(0px,0px)
                    `;
            }
        );
    });
}
/* =========================================================
   FOOTER UNLOCK
========================================================= */
function initFooterUnlock() {
    const unlockButton =
        document.getElementById(
            "footerUnlock"
        );
    const footer =
        document.querySelector(
            ".site-footer"
        );
    if (
        !unlockButton ||
        !footer
    ) return;
    /* =========================
       CLICK
    ========================= */
    unlockButton.addEventListener(
        "click",
        () => {
            const body =
                document.body;
            /* =====================
               ENABLE VERTICAL
            ===================== */
            body.classList.remove(
                "horizontal-mode"
            );
            body.classList.add(
                "vertical-mode"
            );
            /* =====================
               SCROLL
            ===================== */
            footer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    );
    /* =========================
       RELOCK
    ========================= */
    window.addEventListener(
        "scroll",
        () => {
            const body =
                document.body;
            const scrollY =
                window.scrollY;
            /* =====================
               TOP AREA
            ===================== */
            if (
                scrollY <= 120 &&
                body.classList.contains(
                    "vertical-mode"
                )
            ) {
                body.classList.remove(
                    "vertical-mode"
                );
                body.classList.add(
                    "horizontal-mode"
                );
            }
        }
    );
}
/* =========================================================
   HELPERS
========================================================= */
function clamp(
    value,
    min,
    max
) {
    return Math.min(
        Math.max(value, min),
        max
    );
}
