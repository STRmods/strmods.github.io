const BAGGY_SECTIONS_URL = 'https://strmods.github.io/site/baggy-sections.json';

async function buildBaggyMenu(isEmbed = false, theme = 'green') {
  const assetPath = isEmbed ? 'https://strmods.github.io/assets/' : 'assets/';
  const useAltIcons = theme === 'orange';

  const res = await baggyCachedFetch(BAGGY_SECTIONS_URL);
  const sections = await res.json();

  let html = '';

  sections.forEach(section => {
    const iconFile = useAltIcons ? section.iconAlt : section.icon;

    if (section.type === 'click-card') {
      html += `
      <section class="card click-card" data-section="${section.id}">
        <h2 class="card-title click-title">
          <img class="icon-img" src="${assetPath}${iconFile}" alt="${section.title}"> ${section.title}
        </h2>
        <div class="click-panel">`;

      section.items.forEach(item => {
        const itemIcon = useAltIcons ? item.iconAlt : item.icon;
        html += `
          <a class="sublink" href="${item.url}" target="_blank">
            <img class="icon-img" src="${assetPath}${itemIcon}" alt="${item.text}"> ${item.text}
          </a>`;
      });

      html += `</div></section>`;
    }

    if (section.type === 'info-card') {
      html += `
      <section class="card info-card" data-info="${section.id}">
        <h2 class="card-title info-title">
          <img class="icon-img" src="${assetPath}${iconFile}" alt="${section.title}"> ${section.title}
        </h2>
        <div class="info-panel">`;

      section.lists.forEach(list => {
        const listIcon = useAltIcons ? list.iconAlt : list.icon;
        html += `
          <button class="info-subtoggle" data-json="${list.json}">
            <img class="icon-img" src="${assetPath}${listIcon}" alt="${list.text}"> ${list.text} ▾
          </button>
          <ul class="dynamic-list"></ul>`;
      });

      html += `</div></section>`;
    }
  });

  return html;
}
