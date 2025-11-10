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

timer({days: 5, hours: 2, minutes: 29, seconds: 46});

slider();

