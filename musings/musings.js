async function loadMusings() {
    const response = await fetch('/data/');
    const text = await response.text();
    
    const fileNames = text.match(/href="([^" ];

    for (let file of fileNames) {
        const name = file.match(/href="([^" 1];
        
        const titleMatch = name.match(/^(\d{4}-\d{2}-\d{2})\s+(.+)\.txt$/);
        if (!titleMatch) continue;

        const dateStr = titleMatch[1];
        let title = titleMatch[2];

        const fileResponse = await fetch('/data/' + name);
        const content = await fileResponse.text();

        musings.push({
            date: new Date(dateStr),
            title: title,
            content: content
        });
    }

    musings.sort((a, b) => b.date - a.date);

    const container = document.getElementById('musings-container');
    container.innerHTML = '';

    musings.forEach(m => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h2>${m.title}</h2>
            <p class="date">${m.date.toLocaleDateString('it-IT')}</p>
            <p>${m.content}</p>
        `;
        container.appendChild(div);
    });
}

loadMusings();