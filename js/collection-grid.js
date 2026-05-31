(function () {
  function updateThemeImages() {
    const isDark = document.body.classList.contains("dark-theme");
    document.querySelectorAll(".theme-switchable-image").forEach((img) => {
      const lightSrc = img.getAttribute("data-light-src");
      const darkSrc = img.getAttribute("data-dark-src");
      if (lightSrc && darkSrc) {
        img.src = isDark ? darkSrc : lightSrc;
      }
    });
  }

  function loadCollectionGrid(gridId, prefix, viewPage) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const promoCard = grid.querySelector(".promo-card");

    fetch("products.json")
      .then((r) => r.json())
      .then((catalog) => {
        grid.querySelectorAll(".product-card:not(.promo-card)").forEach((c) => c.remove());

        const products = Object.values(catalog)
          .filter((p) => p.id.startsWith(prefix))
          .sort((a, b) => parseInt(a.id.replace(/\D/g, ""), 10) - parseInt(b.id.replace(/\D/g, ""), 10));

        products.forEach((p, index) => {
          const card = document.createElement("div");
          card.className = "product-card";
          card.innerHTML = `
            <div class="card-image">
              <img src="${p.imageLight}" alt="${p.name}"
                data-light-src="${p.imageLight}"
                data-dark-src="${p.imageDark}" class="theme-switchable-image">
            </div>
            <div class="card-details">
              <h3>${p.name}</h3>
              <p class="sub-text">${p.subtext || ""}</p>
              <div class="card-actions">
                <button class="btn-view"
                  onclick="event.stopPropagation(); location.href='${viewPage}?product=${index}'">View</button>
                <button class="btn-buy" onclick="event.stopPropagation(); addToCart('${p.id}')">Buy Now</button>
              </div>
              <div class="price-row">
                <span class="price">$${p.price.toFixed(2)}</span>
              </div>
            </div>`;
          if (promoCard) {
            grid.insertBefore(card, promoCard);
          } else {
            grid.appendChild(card);
          }
        });

        updateThemeImages();
      });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const cfg = document.body.dataset.collection;
    if (!cfg) return;

    const [gridId, prefix, viewPage] = cfg.split("|");
    loadCollectionGrid(gridId, prefix, viewPage);

    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => setTimeout(updateThemeImages, 50));
    }

    new MutationObserver(() => updateThemeImages()).observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
  });
})();
