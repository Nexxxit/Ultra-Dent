export function timer({days = 0, hours = 0, minutes = 0, seconds = 0}) {
    let left = ((days * 24 + hours) * 60 + minutes) * 60 + seconds;

    const el = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds'),
    }

    const pad = (n) => String(n).padStart(2, '0');

    const render = () => {
        let t = left;
        const d = Math.floor(t/86400); t %= 86400;
        const h = Math.floor(t/3600); t%=3600;
        const m = Math.floor(t/60);
        const s = t%60;

        if(el.days) el.days.textContent = d;
        if(el.hours) el.hours.textContent = pad(h);
        if(el.minutes) el.minutes.textContent = pad(m);
        if(el.seconds) el.seconds.textContent = pad(s);
    }

    render();
    const id = setInterval(() => {
        left = Math.max(left - 1, 0);
        render();
        if (left === 0) clearInterval(id);
    }, 1000)
}