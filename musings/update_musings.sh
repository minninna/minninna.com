#!/bin/bash
# update_musings.sh — Mac/Linux
# Doppio clic o: bash update_musings.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$SCRIPT_DIR/data"
OUTPUT="$SCRIPT_DIR/musings.js"

cat > "$OUTPUT" << 'HEADER'
// AUTO-GENERATED — non modificare manualmente.
// Rigenera con doppio clic su update_musings.sh (Mac) o update_musings.bat (Windows)

const MUSINGS = [
HEADER

first=true
for filepath in $(ls -r "$DATA_DIR"/*.txt 2>/dev/null); do
  filename=$(basename "$filepath")
  if [[ "$filename" =~ ^([0-9]{8})\ (.+)\.txt$ ]]; then
    date="${BASH_REMATCH[1]}"
    title="${BASH_REMATCH[2]}"
    content=$(cat "$filepath" | sed "s/\\\\/\\\\\\\\/g" | sed "s/\`/\\\\\`/g" | sed "s/\$/\\\$/g")
    if [ "$first" = true ]; then first=false; else echo "," >> "$OUTPUT"; fi
    printf '  {\n    date: '"'"'%s'"'"',\n    title: '"'"'%s'"'"',\n    content: `%s`\n  }' "$date" "$title" "$content" >> "$OUTPUT"
  fi
done

cat >> "$OUTPUT" << 'FOOTER'

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
    const y = m.date.slice(0,4), mo = m.date.slice(4,6), d = m.date.slice(6,8);
    const dateObj = new Date(`${y}-${mo}-${d}`);
    const day   = d;
    const month = dateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
    const title = m.title.charAt(0).toUpperCase() + m.title.slice(1);
    const entry = document.createElement('article');
    entry.className = 'musing-entry';
    entry.dataset.idx = i;
    const bodyHtml = m.content.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    const needsToggle = m.content.length > 220;
    entry.innerHTML = `
      <div class="musing-datecol">
        <span class="musing-day">${day}</span>
        <span class="musing-month">${month}</span>
      </div>
      <div class="musing-content">
        <h2 class="musing-title">${title}</h2>
        <div class="musing-body">${bodyHtml}</div>
        ${needsToggle ? `<button class="musing-toggle" aria-expanded="false"><span class="toggle-label">Read more</span><span class="musing-toggle-arrow"></span></button>` : ''}
      </div>
      <div class="musing-ghost" aria-hidden="true">${title}</div>`;
    if (needsToggle) {
      const toggle = entry.querySelector('.musing-toggle');
      const label  = entry.querySelector('.toggle-label');
      const expand = () => { const expanded = entry.classList.toggle('expanded'); toggle.setAttribute('aria-expanded', String(expanded)); label.textContent = expanded ? 'Close' : 'Read more'; };
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
FOOTER

count=$(ls "$DATA_DIR"/*.txt 2>/dev/null | wc -l | tr -d ' ')
echo "✓ musings.js aggiornato con $count musings."
