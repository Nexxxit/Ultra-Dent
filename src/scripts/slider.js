export function slider(root = document) {
    Array.from(root.querySelectorAll('.slider')).forEach(init);
}

function init(slider) {
    const viewport = slider.querySelector('.slider__viewports');
    const track = slider.querySelector('.slider__track');
    const slides = Array.from(track?.children || []).filter(n => n.classList.contains('slider__slide'));
    const prevBtn = slider.querySelector('.slider__nav .prev');
    const nextBtn = slider.querySelector('.slider__nav .next');
    const pagList = slider.querySelector('.slider__pagination');

    if (!viewport || !track || slides.length === 0) return;

    let page = 0;
    let pages = 1;
    let perView = 1;
    let offsetsByPage = [0];
    let maxScroll = 0;

    build();
    bind();

    function build() {
        const cs = getComputedStyle(track);
        const gapStr = cs.gap || cs.columnGap || '0';
        const gap = parseFloat(gapStr) || 0;
        const vW = viewport.clientWidth;

        const sRect = slides[0].getBoundingClientRect();
        const sW = sRect.width;
        const outer = sW + gap;

        perView = Math.max(1, Math.floor((vW + gap) / outer));
        pages = Math.max(1, Math.ceil(slides.length / perView));

        offsetsByPage = [];
        for (let p = 0; p < pages; p++) {
            const i = Math.min(p * perView, slides.length - 1);
            offsetsByPage.push(slides[i].offsetLeft);
        }

        maxScroll = Math.max(0, track.scrollWidth - vW);
        page = Math.min(page, pages - 1);

        apply();
        buildPagination();
        updateUI();
    }

    function apply() {
        const x = -(offsetsByPage[page] ?? 0);
        track.style.transform = `translateX(${x}px)`;
    }

    function go(to) {
        page = Math.max(0, Math.min(pages - 1, to));
        apply();
        updateUI();
    }

    function nearestPageByOffset(offset) {
        let best = 0, bestDx = Infinity;
        for (let p = 0; p < offsetsByPage.length; p++) {
            const dx = Math.abs(offsetsByPage[p] - offset);
            if (dx < bestDx) { bestDx = dx; best = p; }
        }
        return best;
    }

    function updateUI() {
        if (prevBtn) prevBtn.disabled = page <= 0;
        if (nextBtn) nextBtn.disabled = page >= pages - 1;
        if (!pagList) return;
        const bullets = pagList.querySelectorAll('.slider__bullet');
        bullets.forEach((b, i) => {
            const inner = b.firstElementChild || b;
            inner.classList.toggle('is-active', i === page);
            b.setAttribute('aria-selected', i === page ? 'true' : 'false');
            b.tabIndex = i === page ? 0 : -1;
        });
    }

    function buildPagination() {
        if (!pagList) return;
        pagList.innerHTML = '';
        const frag = document.createDocumentFragment();
        for (let p = 0; p < pages; p++) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'slider__bullet';
            btn.setAttribute('role', 'tab');
            btn.setAttribute('aria-controls', `page-${p + 1}`);
            btn.setAttribute('aria-selected', p === page ? 'true' : 'false');
            btn.tabIndex = p === page ? 0 : -1;
            const span = document.createElement('span');
            span.textContent = String(p + 1);
            if (p === page) span.className = 'is-active';
            btn.appendChild(span);
            btn.addEventListener('click', () => go(p));
            li.appendChild(btn);
            frag.appendChild(li);
        }
        pagList.appendChild(frag);
    }

    function bind() {
        prevBtn?.addEventListener('click', () => go(page - 1));
        nextBtn?.addEventListener('click', () => go(page + 1));

        viewport.tabIndex = 0;
        viewport.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); go(page - 1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); go(page + 1); }
        });

        viewport.addEventListener('pointerdown', onDown, { passive: true });
        viewport.addEventListener('pointermove', onMove, { passive: false });
        viewport.addEventListener('pointerup', onUp, { passive: true });
        viewport.addEventListener('pointercancel', onUp, { passive: true });

        const ro = new ResizeObserver(build);
        ro.observe(track);
        window.addEventListener('resize', build, { passive: true });
    }

    let dragging = false;
    let startX = 0;
    let startTX = 0;
    let activeId = null;

    function onDown(e) {
        dragging = true;
        activeId = e.pointerId ?? 0;
        viewport.setPointerCapture?.(activeId);
        slider.classList.add('is-dragging');
        track.style.transition = 'none';
        startX = e.clientX;
        const m = getComputedStyle(track).transform;
        startTX = (m && m !== 'none') ? parseFloat(m.split(',')[4]) : 0;
    }

    function onMove(e) {
        if (!dragging || (activeId !== null && e.pointerId !== activeId)) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        let tx = startTX + dx;
        const minTX = -maxScroll;
        const maxTX = 0;
        if (tx < minTX) tx = minTX;
        if (tx > maxTX) tx = maxTX;
        track.style.transform = `translateX(${tx}px)`;
    }

    function onUp(e) {
        if (!dragging || (activeId !== null && e.pointerId !== activeId)) return;
        dragging = false;
        viewport.releasePointerCapture?.(activeId);
        activeId = null;
        slider.classList.remove('is-dragging');
        track.style.transition = '';
        const m = getComputedStyle(track).transform;
        const tx = (m && m !== 'none') ? parseFloat(m.split(',')[4]) : 0;
        const offset = -tx;
        const threshold = 40;
        let target = nearestPageByOffset(offset);
        if (Math.abs(e.clientX - startX) > threshold) {
            if (e.clientX < startX) target = Math.min(pages - 1, page + 1);
            else target = Math.max(0, page - 1);
        }
        page = target;
        apply();
        updateUI();
    }
}
