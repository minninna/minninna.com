// AUTO-GENERATED — non modificare manualmente.
// Rigenera con doppio clic su update_musings.sh (Mac) o update_musings.bat (Windows)

const MUSINGS = [
  {
    date: '20260428',
    title: 'preghiera dei fonici',
    content: `Master fader che sei sul mixer\nsia santificato il tuo test-tone\nvenga il tuo headroom\nsia amplificata la tua volontà\ncome in palco, così in sala\nDacci oggi il nostro panpot quotidiano\ne rimetti a noi i potenziometri\ncome noi li rimettiamo ai nostri preamplificatori\ne non ci indurre in equalizzazione\nma liberaci dal larsen\n\nAmek`
  },
  {
    date: '20260427',
    title: 'questo il terzo',
    content: `Un atleta vero non ti giudicherà per il solo fatto che ti alleni. Un milionario non ti giudicherà per il solo fatto di aver aperto un'azienda. Un musicista non ti giudicherà per il solo fatto che ti eserciti su un brano fino allo sfinimento.\n\nSono le persone senza obiettivi, quelle che non stanno andando da nessuna parte a trovare una ragione per giudicarti.`
  },
  {
    date: '20260426',
    title: 'questo il secondo',
    content: `Tutto quello che sentiamo è un'opinione, non un fatto; tutto quello che vediamo è una prospettiva. Non la verità.\n\nMarco Aurelio`
  },
  {
    date: '20260425',
    title: 'questo il primo',
    content: `Se qualcuno è in grado di mostrarmi che quello che penso o faccio non è giusto, cambierò volentieri, perché cerco la verità, dalla quale nessuno è mai stato veramente ferito. È la persona che continua a ingannare se stessa e a ignorare se stessa, che viene danneggiata.\n\nMarco Aurelio`
  },
  {
    date: '20260410',
    title: 'il testo che mancava',
    content: `Se vuoi dire la verità alla gente, falla ridere altrimenti ti uccideranno.\n\nO. Wilde`
  },
];

const inkObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.dataset.idx || 0) * 60;
      setTimeout(() => e.target.classList.add('ink-visible'), delay);
      inkObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.04, rootMargin: '0px 0px -10px 0px' });

function renderMusings() {
  const list   = document.getElementById('musingsList');
  const loader = document.getElementById('loadingState');
  const sorted = [...MUSINGS].sort((a, b) => b.date.localeCompare(a.date));
  loader.remove();

  sorted.forEach((m, i) => {
    const y  = m.date.slice(0,4);
    const mo = m.date.slice(4,6);
    const d  = m.date.slice(6,8);
    const dateObj = new Date(`${y}-${mo}-${d}`);
    const day     = d;
    const month   = dateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
    const title   = m.title.charAt(0).toUpperCase() + m.title.slice(1);

    const entry = document.createElement('article');
    entry.className = 'musing-entry';
    entry.dataset.idx = i;

    const bodyHtml = m.content.split(/\n\n+/)
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    const needsToggle = m.content.length > 220;

    entry.innerHTML = `
      <div class="musing-datecol">
        <span class="musing-day">${day}</span>
        <span class="musing-month">${month}</span>
      </div>
      <div class="musing-content">
        <h2 class="musing-title">${title}</h2>
        <div class="musing-body">${bodyHtml}</div>
        ${needsToggle ? `<button class="musing-toggle" aria-expanded="false">
          <span class="toggle-label">Read more</span>
          <span class="musing-toggle-arrow"></span>
        </button>` : ''}
      </div>
      <div class="musing-ghost" aria-hidden="true">${title}</div>`;

    if (needsToggle) {
      const toggle = entry.querySelector('.musing-toggle');
      const label  = entry.querySelector('.toggle-label');
      const expand = () => {
        const expanded = entry.classList.toggle('expanded');
        toggle.setAttribute('aria-expanded', String(expanded));
        label.textContent = expanded ? 'Close' : 'Read more';
      };
      toggle.addEventListener('click', expand);
      entry.querySelector('.musing-title').addEventListener('click', expand);
    }

    list.appendChild(entry);
    inkObserver.observe(entry);
  });

  // Fallback per file://
  setTimeout(() => {
    document.querySelectorAll('.musing-entry:not(.ink-visible)').forEach((el, i) => {
      setTimeout(() => el.classList.add('ink-visible'), i * 80);
    });
  }, 300);
}

renderMusings();
