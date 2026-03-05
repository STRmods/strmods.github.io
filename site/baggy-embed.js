const EMBED_SECTIONS_URL = 'https://strmods.github.io/site/baggy-sections.json';

async function buildAndInitEmbed(theme = 'green') {
  await baggyInitCache();
  const container = document.getElementById('baggy-menu-container');
  if (!container) return;

  const assetPath = 'https://strmods.github.io/assets/';
  const useAltIcons = theme === 'orange';

  try {
    const res = await baggyCachedFetch(EMBED_SECTIONS_URL);
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

    container.innerHTML = html;
    initializeEmbedMenu(theme);

  } catch (err) {
    console.error('Failed to load Baggy sections:', err);
    container.innerHTML = '<p style="color:#f00;padding:12px;">Failed to load menu.</p>';
  }
}

function initializeEmbedMenu(theme = 'green') {

  function altVariationSrc(path) {
    const full = `https://strmods.github.io/${path}`;
    return theme === 'orange' ? full.replace('.webp', '-alt.webp') : full;
  }

  document.querySelectorAll(".click-card").forEach(card => {
    const title = card.querySelector(".click-title");
    title.addEventListener("click", () => card.classList.toggle("open"));
  });

  document.querySelectorAll(".info-card").forEach(card => {
    const title = card.querySelector(".info-title");
    title.addEventListener("click", () => card.classList.toggle("open"));
  });

  document.querySelectorAll(".info-subtoggle").forEach(btn => {
    btn.addEventListener("click", async () => {
      const jsonFile = btn.dataset.json;
      const list = btn.nextElementSibling;

      const icon = btn.querySelector('.icon-img');
      const iconClone = icon ? icon.cloneNode(true) : null;

      let textWithoutIcon = '';
      btn.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) textWithoutIcon += node.textContent;
      });
      const baseText = textWithoutIcon.replace(/[▾▴⏳]/g, '').trim();

      if (list.dataset.loaded === "true") {
        const isVisible = list.style.display === "block";
        list.style.display = isVisible ? "none" : "block";
        btn.innerHTML = '';
        if (iconClone) btn.appendChild(iconClone);
        btn.appendChild(document.createTextNode(' ' + baseText + (isVisible ? ' ▾' : ' ▴')));
        return;
      }

      btn.innerHTML = '';
      if (iconClone) btn.appendChild(iconClone);
      btn.appendChild(document.createTextNode(' ' + baseText + ' '));
      const loader = document.createElement('span');
      loader.className = 'loader';
      btn.appendChild(loader);

      try {
        const res = await baggyCachedFetch(`https://strmods.github.io/${jsonFile}`);
        const data = await res.json();
        list.innerHTML = "";

        const hasTracks = data.some(item => item.variations);

        data.forEach(item => {
          const li = document.createElement("li");

          if (hasTracks) {
            const trackHeader = document.createElement("div");
            trackHeader.className = "track-header";
            trackHeader.appendChild(document.createTextNode(`${item.name} - ${item.id}`));

            if (item.preview) {
              const img = document.createElement("img");
              img.src = `https://strmods.github.io/${item.preview}`;
              img.className = "preview-img";
              img.alt = item.name;
              const caption = document.createElement("span");
              caption.className = "preview-caption";
              caption.textContent = item.name;
              trackHeader.appendChild(img);
              trackHeader.appendChild(caption);
            }

            li.appendChild(trackHeader);

            if (item.variations && item.variations.length > 0) {
              const variationsList = document.createElement("ul");
              variationsList.className = "variations-list";

              item.variations.forEach(variation => {
                const varLi = document.createElement("li");
                varLi.className = "variation-item";
                varLi.appendChild(document.createTextNode(`${variation.name} - ${variation.id}`));

                if (variation.preview) {
                  const varImg = document.createElement("img");
                  varImg.src = altVariationSrc(variation.preview);
                  varImg.className = "preview-img";
                  varImg.alt = variation.name;
                  const caption = document.createElement("span");
                  caption.className = "preview-caption";
                  caption.textContent = variation.name;
                  varLi.appendChild(varImg);
                  varLi.appendChild(caption);
                }

                variationsList.appendChild(varLi);
              });

              li.appendChild(variationsList);
            }

            trackHeader.addEventListener("click", () => li.classList.toggle("expanded"));

          } else {
            li.appendChild(document.createTextNode(`${item.name} - ${item.id}`));

            if (item.preview) {
              const img = document.createElement("img");
              img.src = `https://strmods.github.io/${item.preview}`;
              img.className = "preview-img";
              img.alt = item.name;
              const caption = document.createElement("span");
              caption.className = "preview-caption";
              caption.textContent = item.name;
              li.appendChild(img);
              li.appendChild(caption);
            }
          }

          list.appendChild(li);
        });

        list.dataset.loaded = "true";
        list.style.display = "block";
        btn.innerHTML = '';
        if (iconClone) btn.appendChild(iconClone);
        btn.appendChild(document.createTextNode(' ' + baseText + ' ▴'));

      } catch (error) {
        console.error("Failed to load JSON:", error);
        btn.innerHTML = '';
        if (iconClone) btn.appendChild(iconClone);
        btn.appendChild(document.createTextNode(' ' + baseText + ' ▾ (Error)'));
      }
    });
  });

  initEmbedPreviews();
}

function initEmbedPreviews() {
  const box = document.getElementById('preview-box');
  const img = document.getElementById('preview-img');
  const caption = document.getElementById('preview-caption');

  function positionBox(e) {
    const w = window.innerWidth;
    const boxWidth = 200;
    const offset = 12;
    let x = e.clientX + offset;
    if (x + boxWidth > w) x = e.clientX - boxWidth - offset;
    box.style.left = x + 'px';
    box.style.top = Math.max(4, e.clientY - 60) + 'px';
  }

  function showPreview(src, name) {
    img.src = src;
    caption.textContent = name;
    box.style.display = 'block';
  }

  function hidePreview() {
    box.style.display = 'none';
    img.src = '';
  }

  document.addEventListener('mousemove', e => {
    if (box.style.display === 'block') positionBox(e);
  });

  document.addEventListener('mouseover', e => {
    const target = e.target.closest('.track-header, .variation-item, .dynamic-list > li');
    if (!target) return;
    if (target.classList.contains('track-header')) {
      const li = target.closest('li');
      if (li && li.classList.contains('expanded')) return;
    }
    const previewImg = target.querySelector(':scope > .preview-img');
    const previewCap = target.querySelector(':scope > .preview-caption');
    if (previewImg) {
      positionBox(e);
      showPreview(previewImg.src, previewCap ? previewCap.textContent : '');
    }
  });

  document.addEventListener('mouseout', e => {
    const target = e.target.closest('.track-header, .variation-item, .dynamic-list > li');
    if (!target) return;
    if (!target.contains(e.relatedTarget)) hidePreview();
  });
}
