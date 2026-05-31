(function () {
  function splitTitle(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return [parts[0] || "", ""];
    const mid = Math.ceil(parts.length / 2);
    return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
  }

  function imageSrc(path) {
    if (!path) return "";
    return path.startsWith("http") ? path : `./${path}`;
  }

  function viewLayout(prefix) {
    if (prefix === "diffuser-") return "pastry";
    if (prefix === "hamper-") return "gift";
    return "coffee";
  }

  function tagWrapperId(index, layout) {
    if (index !== 0) return "";
    return layout === "pastry" ? ' id="Odour"' : ' id="Flavour"';
  }

  function titleId(index, layout) {
    if (layout === "coffee") {
      return index === 0 ? ' id="title-2"' : "";
    }
    return index === 0 ? "" : ' id="title-2"';
  }

  function buildBgBlocks(productCount) {
    let overlays1 = "";
    let overlays3 = "";
    let overlays4 = "";
    for (let n = 2; n <= productCount; n++) {
      overlays1 += `<div class="bg-overlay-1 p${n}-bg-1"></div>`;
      overlays3 += `<div class="bg-overlay-3 p${n}-bg-3"></div>`;
      overlays4 += `<div class="bg-overlay-4 p${n}-bg-4"></div>`;
    }
    return `
      <div class="block block-1">
        ${overlays1}
        <div class="block-3">${overlays3}</div>
        <div class="block-4">${overlays4}</div>
      </div>
      <div class="block block-2"></div>`;
  }

  function buildDetail(product, index) {
    const boxClass = index === 0 ? "description-box-1" : "description-box";
    return `
      <div class="${boxClass}">
        <div class="text-mask">
          <p class="desc-text anim-text">${product.description}</p>
        </div>
        <div class="specs">
          <div class="spec-item">
            <div class="text-mask">
              <span class="label anim-text">Notes</span>
            </div>
            <div class="text-mask">
              <span class="value anim-text">${product.notes || "—"}</span>
            </div>
          </div>
          <div class="spec-item">
            <div class="text-mask">
              <span class="label anim-text">Mood</span>
            </div>
            <div class="text-mask">
              <span class="value anim-text">${product.mood || "—"}</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  function buildProductInfo(product, index, layout) {
    const [line1, line2] = splitTitle(product.name);
    return `
      <div class="product-info info-${index + 1}">
        <div class="text-mask-flavour"${tagWrapperId(index, layout)}>
          <span class="tag anim-text">${product.tag || ""}</span>
        </div>
        <h1 class="title"${titleId(index, layout)}>
          <div class="text-mask"><span class="line anim-text">${line1}</span></div>
          <div class="text-mask"><span class="line anim-text">${line2}</span></div>
        </h1>
        ${buildDetail(product, index)}
      </div>`;
  }

  async function buildProductView() {
    const prefix = document.body.dataset.productPrefix;
    if (!prefix) return;

    const layout = viewLayout(prefix);
    const stack = document.querySelector(".products-stack");
    const infoStack = document.querySelector(".info-stack");
    const priceHolder = document.querySelector(".price-placeholder");
    const bgBlocks = document.querySelector(".bg-blocks");

    if (!stack || !infoStack || !priceHolder) return;

    const res = await fetch("products.json");
    const catalog = await res.json();
    const products = Object.values(catalog)
      .filter((p) => p.id.startsWith(prefix))
      .sort((a, b) => {
        const na = parseInt(a.id.replace(/\D/g, ""), 10);
        const nb = parseInt(b.id.replace(/\D/g, ""), 10);
        return na - nb;
      });

    if (products.length === 0) return;

    if (bgBlocks) {
      bgBlocks.innerHTML = buildBgBlocks(products.length);
    }

    stack.innerHTML = products
      .map(
        (p, i) => `
      <div class="product-item item-${i + 1}">
        <img src="${imageSrc(p.imageNb)}" alt="${p.name}" class="product-image" />
        <div class="product-shadow"></div>
      </div>`
      )
      .join("");

    infoStack.innerHTML = products
      .map((p, i) => buildProductInfo(p, i, layout))
      .join("");

    priceHolder.innerHTML = products
      .map(
        (p, i) => `
      <div class="price-item" data-product-id="${p.id}">
        <div class="text-mask"${i === 0 ? ' id="price1"' : ""}>
          <div class="price-display anim-text"></div>
        </div>
      </div>`
      )
      .join("");

    document.dispatchEvent(
      new CustomEvent("product-view-built", { detail: { count: products.length } })
    );
  }

  document.addEventListener("DOMContentLoaded", buildProductView);
})();
