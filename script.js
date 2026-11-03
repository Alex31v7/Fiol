document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid     = document.getElementById('galleryGrid');
    const counter         = document.getElementById('photoCounter');
    const lightbox        = document.getElementById('lightbox');
    const lightboxInner   = document.getElementById('lightboxInner');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose   = document.getElementById('lightboxClose');
    const lightboxPrev    = document.getElementById('lightboxPrev');
    const lightboxNext    = document.getElementById('lightboxNext');


    const photos = [
        { img: 'photos/01.png', label: '',     isNew: false  },
        { img: 'photos/02.png', label: '',   isNew: false  },
        { img: 'photos/03.png', label: '',    isNew: false },
        { img: 'photos/04.png', label: '',     isNew: false },
        { img: 'photos/05.png', label: '',   isNew: false },
        { img: 'photos/06.png', label: '',    isNew: false },
         { img: 'photos/07.png', label: '',    isNew: false },

        

    ];

    let currentIndex = 0;

    function buildGallery() {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';

        photos.forEach((item, i) => {
            const card = document.createElement('div');
            card.className = 'photo-card has-photo';
            card.setAttribute('data-index', i);
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Открыть фото: ${item.label}`);

            card.innerHTML = `
                ${item.isNew ? '<span class="badge-new">new</span>' : ''}
                <img src="${item.img}" alt="${item.label}" loading="lazy">
            `;

            card.addEventListener('click', () => openLightbox(i));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(i);
                }
            });

            galleryGrid.appendChild(card);
        });

        updateCounter();
    }

    function updateCounter() {
        if (!counter) return;
        const total = String(photos.length).padStart(2, '0');
        const current = lightbox?.classList.contains('is-open')
            ? String(currentIndex + 1).padStart(2, '0')
            : '00';
        counter.textContent = `${current} / ${total}`;
    }

    function openLightbox(index) {
        currentIndex = index;
        renderLightbox();
        preloadNeighbors();
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        updateCounter();
        lightboxClose?.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        updateCounter();
    }

    function renderLightbox() {
        const item = photos[currentIndex];
        if (!item || !lightboxInner) return;

        lightboxInner.innerHTML = `
            <div class="lb-content">
                <div class="lb-frame">
                    <img src="${item.img}" alt="${item.label}">
                </div>
                <div class="lb-meta">
                    <span class="lb-index">${String(currentIndex + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}</span>
                    <span class="lb-caption">${item.label}</span>
                </div>
            </div>
        `;

        if (lightboxCaption) {
            lightboxCaption.textContent = '';
        }
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + photos.length) % photos.length;
        renderLightbox();
        preloadNeighbors();
        updateCounter();
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % photos.length;
        renderLightbox();
        preloadNeighbors();
        updateCounter();
    }
    function preloadNeighbors() {
        if (photos.length < 2) return;
        const prev = photos[(currentIndex - 1 + photos.length) % photos.length];
        const next = photos[(currentIndex + 1) % photos.length];
        [prev, next].forEach(p => {
            if (!p?.img) return;
            const im = new Image();
            im.src = p.img;
        });
    }

    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxPrev?.addEventListener('click', showPrev);
    lightboxNext?.addEventListener('click', showNext);

    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('is-open')) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrev();
                break;
            case 'ArrowRight':
                showNext();
                break;
        }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const SWIPE_MIN_DISTANCE = 50;
    const SWIPE_MAX_VERTICAL = 80; 

    lightbox?.addEventListener('touchstart', (e) => {
        const t = e.changedTouches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchEndX = t.clientX;
        touchEndY = t.clientY;
    }, { passive: true });

    lightbox?.addEventListener('touchmove', (e) => {
        const t = e.changedTouches[0];
        touchEndX = t.clientX;
        touchEndY = t.clientY;
    }, { passive: true });

    lightbox?.addEventListener('touchend', () => {
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        if (Math.abs(dy) > SWIPE_MAX_VERTICAL) return;
        if (Math.abs(dx) < SWIPE_MIN_DISTANCE) return;

        if (dx < 0) {
            showNext();
        } else {
            showPrev();
        }
    });

    lightbox?.addEventListener('touchcancel', () => {
        touchStartX = touchStartY = touchEndX = touchEndY = 0;
    });
    buildGallery();
});