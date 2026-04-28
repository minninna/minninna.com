// AUTO-GENERATED — non modificare manualmente. 
// Rigenera con doppio clic su update_musings.bat 
 
const MUSINGS = [ 
  {
    date: '20260428',
    title: 'The song behind the image',
    content: `It's a game I've been playing for years\nmy two oldest obsessions, talking to each other.\nEvery photograph has a song behind it.\nA title, a few lyrics.\nNot a caption, something that was already there, quietly.\nSomeone noticed. That made me smile.`
  }
,  
  {
    date: '20260427',
    title: 'The practice of seeing',
    content: `Observation is a beginning.\nHonesty is what makes it real.\nWithout it, you get lost\nin assumptions, projections, distortions.\nSo you train it.\nLike a muscle.\nAnd slowly, things clear.\nYou see more.\nAnd in seeing more,\nthere’s a little more freedom.`
  }
,  
  {
    date: '20260426',
    title: 'Twentyfive Twentysix',
    content: `That's how long it's been since I opened my first website. I didn't even know what a blog was. I was a kid, experimenting with HTML, trying to put something of myself into the web; whatever that meant back then.\nI don't remember exactly what I wrote in that first post. That was a fragment of a song, maybe. Something raw and unfinished, the way beginnings always are.\nNow I'm opening this space again.\nMusic and photography have always been here, they never really left. But they move like the ocean: waves coming in and pulling back, highs and lows, long silences and sudden, glorious returns. That's how it works. That's how it has always worked.\nThis place is called My Musings, The Daily Darkroom like a dark room, dark and luminous.\nDark because ideas need silence, or at least I do. I need to step away from the noise before I can enter the world of thought.\nLuminous because every idea, eventually, is a light switching on.\nA darkroom, after all, is where images are born.\nTwenty-five years and twenty-six days. Back to the beginning.`
  }
,  
  {
    date: '20260425',
    title: 'A free space',
    content: `This space sits next to the photographs.\nIf the rest of the site is made of images taken with a camera, this is where the images without a camera live.\nBecause photography, at least to me, does not begin with a device. It begins with observation. With the quiet act of noticing. You can photograph with a lens, or you can photograph without one, by paying attention, by staying with what is in front of you long enough for it to reveal something.\nMy Musings is that second space. A private area.\nA kind of notebook. Open, unfinished by design.\nSome entries might be fragments. Others might remain drafts. Observations caught in passing. Small anecdotes, almost like those curious pieces you find in old magazines. Thoughts on how things shift, culturally, socially, individually. Reflections that move between the personal and the collective, between what we are becoming and what we might be leaving behind.\nNothing here is meant to be definitive.\nThis is a place for notes, not statements. For questions more than answers. For thinking in public without the need to conclude.\nA free space.\nIt does not feel accidental that it begins today, on a day that here carries the meaning of freedom. Not only as a historical moment, but as a principle. A reminder.\nSo this will be that. A small exercise in freedom.\nTo observe.\nTo write.\nTo leave things open.`
  }
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
    const day   = d;
    const month = dateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
    const title = m.title.charAt(0).toUpperCase() + m.title.slice(1);

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
        // GA4 — traccia apertura musing
        if (expanded && typeof gtag === 'function') {
          gtag('event', 'musing_open', {
            musing_title: m.title,
            event_label: m.title
          });
        }
      };
      toggle.addEventListener('click', expand);
      entry.querySelector('.musing-title').addEventListener('click', expand);
    }

    list.appendChild(entry);
    inkObserver.observe(entry);
  });

  setTimeout(() => {
    document.querySelectorAll('.musing-entry:not(.ink-visible)').forEach((el, i) => {
      setTimeout(() => el.classList.add('ink-visible'), i * 80);
    });
  }, 300);
}

renderMusings();
