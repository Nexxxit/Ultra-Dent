import './components/index.css';
import {timer} from "./scripts/timer.js";
import {slider} from "./scripts/slider.js";

const head = document.querySelector('.head');
if (head) {
    const toggle = head.querySelector('.nav-buttons__toggle');
    const panel = head.querySelector('.head__panel')

    const setOpen = (v) => {
        head.classList.toggle('is-open', v);
        toggle?.setAttribute('aria-expanded', String(v));
    }

    toggle?.addEventListener('click', () => {
        setOpen(!head.classList.contains('is-open'))
    })

    panel?.addEventListener('click', (e) => {
        if(e.target.closest('.nav__link')) setOpen(false);
    })

    document.addEventListener('click', (e) => {
        if(!head.contains(e.target)) setOpen(false);
    })
}

document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();

    const header = document.querySelector('.head');
    const offset = (header?.offsetHeight || 0) + 8;

    const scrollTop = window.scrollY ?? document.documentElement.scrollTop ?? 0;
    const y = target.getBoundingClientRect().top + scrollTop - offset;

    window.scrollTo({ top: y, behavior: 'smooth' });

    header?.classList.remove('is-open');
});

timer({days: 5, hours: 2, minutes: 29, seconds: 46});

slider();

