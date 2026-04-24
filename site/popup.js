// Load Baggy configuration and build menu
document.addEventListener('DOMContentLoaded', async () => {
  await baggyInitCache();
  const container = document.getElementById('baggy-menu-container');
  if (container) {
    container.innerHTML = await buildBaggyMenu(false, 'green');
    initializeBaggyMenu();
  }
});


// Initialize Baggy menu interactions
function initializeBaggyMenu() {
  document.querySelectorAll(".click-card").forEach(card => {
    const title = card.querySelector(".click-title");
    title.addEventListener("click", () => {
      card.classList.toggle("open");
    });
  });

  document.querySelectorAll(".info-card").forEach(card => {
    const title = card.querySelector(".info-title");
    title.addEventListener("click", () => {
      card.classList.toggle("open");
    });
  });

  document.querySelectorAll(".info-subtoggle").forEach(btn => {
    btn.addEventListener("click", async () => {
      const jsonFile = btn.dataset.json;
      const list = btn.nextElementSibling;

      const icon = btn.querySelector('.icon-img');
      const iconClone = icon ? icon.cloneNode(true) : null;

      let textWithoutIcon = '';
      btn.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          textWithoutIcon += node.textContent;
        }
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
        const res = await baggyCachedFetch(jsonFile);
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
              const previewWrap = document.createElement("div");
              previewWrap.className = "preview-wrap";
              const img = document.createElement("img");
              img.src = item.preview;
              img.className = "preview-img";
              img.alt = item.name;
              const caption = document.createElement("span");
              caption.className = "preview-caption";
              caption.textContent = item.name;
              previewWrap.appendChild(img);
              previewWrap.appendChild(caption);
              trackHeader.appendChild(previewWrap);
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
                  const previewWrap = document.createElement("div");
                  previewWrap.className = "preview-wrap";
                  const varImg = document.createElement("img");
                  varImg.src = variation.preview;
                  varImg.className = "preview-img";
                  varImg.alt = variation.name;
                  const caption = document.createElement("span");
                  caption.className = "preview-caption";
                  caption.textContent = variation.name;
                  previewWrap.appendChild(varImg);
                  previewWrap.appendChild(caption);
                  varLi.appendChild(previewWrap);
                }

                variationsList.appendChild(varLi);
              });

              li.appendChild(variationsList);
            }

            trackHeader.addEventListener("click", () => {
              li.classList.toggle("expanded");
            });

          } else {
            li.appendChild(document.createTextNode(`${item.name} - ${item.id}`));

            if (item.preview) {
              const previewWrap = document.createElement("div");
              previewWrap.className = "preview-wrap";
              const img = document.createElement("img");
              img.src = item.preview;
              img.className = "preview-img";
              img.alt = item.name;
              const caption = document.createElement("span");
              caption.className = "preview-caption";
              caption.textContent = item.name;
              previewWrap.appendChild(img);
              previewWrap.appendChild(caption);
              li.appendChild(previewWrap);
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
}

// CRT Power-on effect
window.addEventListener('load', () => {
  document.body.style.visibility = 'hidden';

  const powerup = document.createElement('div');
  powerup.className = 'crt-powerup';
  document.body.appendChild(powerup);

  const scanline = document.createElement('div');
  scanline.className = 'crt-scanline-boot';
  document.body.appendChild(scanline);

  setTimeout(() => {
    document.body.style.visibility = 'visible';
    document.body.classList.add('powered-on');
  }, 400);

  setTimeout(() => {
    powerup.remove();
    scanline.remove();
  }, 1000);
});

// Search form submit
document.getElementById("search").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.target.form.submit();
  }
});

// ASCII Art for desktop
const asciiArtLines = [
  "   ███████╗████████╗██████╗·███╗···███╗·██████╗·██████╗·███████╗",
  "   ██╔════╝╚══██╔══╝██╔══██╗████╗·████║██╔═══██╗██╔══██╗██╔════╝",
  "   ███████╗···██║···██████╔╝██╔████╔██║██║···██║██║··██║███████╗",
  "   ╚════██║···██║···██╔══██╗██║╚██╔╝██║██║···██║██║··██║╚════██║",
  "   ███████║···██║···██║··██║██║·╚═╝·██║╚██████╔╝██████╔╝███████║",
  "   ╚══════╝···╚═╝···╚═╝··╚═╝╚═╝·····╚═╝·╚═════╝·╚═════╝·╚══════╝"
];

function typeWriterASCII(element, lines, charSpeed, lineDelay, callback) {
  let lineIndex = 0;
  let charIndex = 0;
  let currentText = '';
  let lastTime = performance.now();
  let accumulated = 0;

  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';

  element.innerText = '';
  element.style.opacity = '1';
  element.appendChild(cursor);

  function typeChar(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    accumulated += deltaTime;

    while (accumulated >= charSpeed && lineIndex < lines.length) {
      const currentLine = lines[lineIndex];
      if (charIndex < currentLine.length) {
        currentText += currentLine[charIndex];
        charIndex++;
        accumulated -= charSpeed;
      } else {
        currentText += '\n';
        lineIndex++;
        charIndex = 0;
        accumulated -= lineDelay;
        break;
      }
    }

    element.innerText = currentText;
    element.appendChild(cursor);

    if (lineIndex < lines.length) {
      requestAnimationFrame(typeChar);
    } else {
      if (callback) callback(cursor);
    }
  }

  requestAnimationFrame(typeChar);
}

function typeWriter(element, html, speed, cursor, callback) {
  let i = 0;
  let lastTime = performance.now();
  let accumulated = 0;

  const img = element.querySelector('img');

  const temp = document.createElement('div');
  temp.innerHTML = html;
  const textContent = temp.textContent || temp.innerText;

  element.textContent = '';
  element.style.opacity = '1';

  if (img) element.appendChild(img);
  element.appendChild(cursor);

  function type(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    accumulated += deltaTime;

    while (accumulated >= speed && i < textContent.length) {
      i++;
      accumulated -= speed;
    }

    if (i > 0) {
      element.innerHTML = '';
      if (img) element.appendChild(img);
      const span = document.createElement('span');
      span.innerHTML = html.substring(0, findHTMLPosition(html, i));
      element.appendChild(span);
      element.appendChild(cursor);
    }

    if (i < textContent.length) {
      requestAnimationFrame(type);
    } else {
      cursor.remove();
      element.innerHTML = '';
      if (img) element.appendChild(img);
      const span = document.createElement('span');
      span.innerHTML = html;
      element.appendChild(span);
      if (callback) callback();
    }
  }

  function findHTMLPosition(html, textPos) {
    let textCount = 0;
    let htmlPos = 0;
    let inTag = false;
    while (htmlPos < html.length && textCount < textPos) {
      if (html[htmlPos] === '<') {
        inTag = true;
      } else if (html[htmlPos] === '>') {
        inTag = false;
        htmlPos++;
        continue;
      }
      if (!inTag) textCount++;
      htmlPos++;
    }
    return htmlPos;
  }

  requestAnimationFrame(type);
}

document.addEventListener('DOMContentLoaded', async () => {
  const title = document.getElementById('ascii-title');
  const content = document.querySelector('.typewriter-content');
  const paragraph = content.querySelector('p, h1');
  const sections = content.querySelectorAll('section');
  const links = content.querySelectorAll('.main-link');

  const paragraphHTML = paragraph.innerHTML.replace(/<img[^>]*>/g, '').trim();

  title.style.opacity = '0';
  content.style.opacity = '1';
  paragraph.style.opacity = '0';
  sections.forEach(s => s.style.opacity = '0');
  links.forEach(l => l.style.opacity = '0');

  setTimeout(() => {
    title.style.opacity = '1';
    title.classList.add('typing');

    typeWriterASCII(title, asciiArtLines, 5, 20, (cursor) => {
      setTimeout(() => {
        paragraph.style.opacity = '1';
        typeWriter(paragraph, paragraphHTML, 2.25, cursor, () => {
          setTimeout(() => {
            sections[0].style.opacity = '1';
            sections[0].style.animation = 'fadeInTerminal 0.3s ease forwards';
            setTimeout(() => { links[0].style.animation = 'glitchIn 0.6s ease forwards'; }, 200);
            setTimeout(() => { links[1].style.animation = 'glitchIn 0.6s ease forwards'; }, 400);
            setTimeout(() => { links[2].style.animation = 'glitchIn 0.6s ease forwards'; }, 600);
			setTimeout(() => { links[3].style.animation = 'glitchIn 0.6s ease forwards'; }, 800);
            setTimeout(() => {
              sections[1].style.opacity = '1';
              sections[1].style.animation = 'fadeInTerminal 0.3s ease forwards';
            }, 1000);
          }, 300);
        });
      }, 300);
    });
  }, 900);
});

// ========== MOBILE BAGGY TOGGLE ==========
const mobileBaggyBtn = document.getElementById('mobileBaggyBtn');
const sidebar = document.querySelector('.sticky-sidebar');

mobileBaggyBtn.addEventListener('click', () => {
  sidebar.classList.add('mobile-open');
  mobileBaggyBtn.classList.add('hidden');
});

sidebar.addEventListener('click', (e) => {
  const rect = sidebar.getBoundingClientRect();
  if (e.clientY < rect.top + 50) {
    sidebar.classList.remove('mobile-open');
    mobileBaggyBtn.classList.remove('hidden');
  }
});

// ========== BAGGY EMBED MODAL ==========
const embedBtn = document.getElementById('embedBtn');
const embedModal = document.getElementById('embedModal');
const embedClose = document.querySelector('.embed-close');
const embedModalContent = document.querySelector('.embed-modal-content');
const embedCode = document.getElementById('embedCode');
const copyEmbedBtn = document.getElementById('copyEmbedBtn');
const copyFeedback = document.getElementById('copyFeedback');
const closeModalBtn = document.getElementById('closeModalBtn');
const themeButtons = document.querySelectorAll('.theme-btn');

document.body.appendChild(embedModal);

let currentTheme = 'green';

const embedCodes = {
  green: `<iframe src="https://strmods.github.io/site/baggy-embed-green.html" 
  width="400" height="600" 
  style="border: 2px solid #00ff41; border-radius: 8px; box-shadow: 0 0 20px rgba(0,255,65,0.3);"
  title="Baggy - Wreckfest Modding Companion">
</iframe>`,
  orange: `<iframe src="https://strmods.github.io/site/baggy-embed-orange.html" 
  width="400" height="600" 
  style="border: 2px solid #ff8800; border-radius: 8px; box-shadow: 0 0 20px rgba(255,136,0,0.3);"
  title="Baggy - Wreckfest Modding Companion">
</iframe>`
};

function closeModal() {
  embedModal.style.display = 'none';
}

embedBtn.addEventListener('click', () => {
  embedModal.style.display = 'block';
  embedCode.value = embedCodes[currentTheme];
});

embedClose.addEventListener('click', closeModal);
closeModalBtn.addEventListener('click', closeModal);

embedModal.addEventListener('click', (e) => {
  if (e.target === embedModal) closeModal();
});

embedModalContent.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && embedModal.style.display === 'block') closeModal();
});

themeButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    themeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTheme = btn.dataset.theme;
    embedCode.value = embedCodes[currentTheme];
    const container = document.getElementById('baggy-menu-container');
    container.innerHTML = await buildBaggyMenu(false, currentTheme);
    initializeBaggyMenu();
  });
});


copyEmbedBtn.addEventListener('click', () => {
  embedCode.select();
  document.execCommand('copy');
  copyFeedback.classList.add('show');
  setTimeout(() => { copyFeedback.classList.remove('show'); }, 2000);
});
