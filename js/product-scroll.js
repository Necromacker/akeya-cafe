function initProductScroll() {
  if (typeof gsap === "undefined" || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const products = gsap.utils.toArray(".product-item");
  const infos = gsap.utils.toArray(".product-info");
  const priceItems = gsap.utils.toArray(".price-item");

  if (!products.length || !infos.length) return;

  const spacerHeight = products.length * 190;
  gsap.set(".scroll-spacer", { height: spacerHeight + "vh" });

  gsap.set(products, { y: window.innerHeight, opacity: 1 });
  gsap.set(products[0], { y: 0, opacity: 1 });

  function setActiveInfoPanel(index) {
    infos.forEach((info, idx) => {
      info.style.zIndex = idx === index ? "2" : "1";
      info.style.pointerEvents = idx === index ? "auto" : "none";
    });
  }

  setActiveInfoPanel(0);

  infos.forEach((info, i) => {
    const texts = [
      ...info.querySelectorAll(".anim-text"),
      ...(priceItems[i] ? priceItems[i].querySelectorAll(".anim-text") : []),
    ];
    gsap.set(texts, { y: i === 0 ? "0%" : "200%" });
  });

  ScrollTrigger.getAll().forEach((t) => t.kill());

  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-spacer",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
    },
  });

  window.activeProductIndex = 0;

  const urlParams = new URLSearchParams(window.location.search);
  const targetProduct = urlParams.get("product");

  if (targetProduct !== null) {
    const productIndex = parseInt(targetProduct, 10);
    if (!isNaN(productIndex) && productIndex >= 0 && productIndex < products.length) {
      window.activeProductIndex = productIndex;
      setActiveInfoPanel(productIndex);
      window.addEventListener("load", () => {
        setTimeout(() => {
          const scrollPerProduct = 200;
          const targetScrollPx = productIndex * scrollPerProduct * (window.innerHeight / 100);
          window.scrollTo({ top: targetScrollPx, behavior: "smooth" });
        }, 500);
      });
    }
  }

  for (let i = 0; i < products.length - 1; i++) {
    scrollTl.to({}, { duration: 1 });

    const label = `transition${i + 1}`;
    scrollTl.addLabel(label);

    scrollTl.call(() => {
      const isReversed = scrollTl.scrollTrigger && scrollTl.scrollTrigger.direction < 0;
      const nextIndex = isReversed ? i : i + 1;
      window.activeProductIndex = nextIndex;
      setActiveInfoPanel(nextIndex);
    }, null, label);

    const currentTexts = [
      ...infos[i].querySelectorAll(".anim-text"),
      ...(priceItems[i] ? priceItems[i].querySelectorAll(".anim-text") : []),
    ];

    scrollTl.to(
      currentTexts,
      { y: "-105%", stagger: 0.02, duration: 1, ease: "power2.inOut" },
      label
    );

    scrollTl.to(
      products[i],
      { y: -window.innerHeight * 1.2, rotation: 5, ease: "power1.inOut", duration: 2 },
      label
    );

    scrollTl.to(
      products[i + 1],
      { y: 0, rotation: 0, ease: "power1.inOut", duration: 2 },
      label
    );

    const bgIndex = i + 2;
    const suffixes = [1, 3, 4];
    const directions = ["top", "bottom", "left", "right"];

    suffixes.forEach((suffix) => {
      const bgSelector = `.p${bgIndex}-bg-${suffix}`;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      let fromVars = {};
      let toVars = { duration: 2, ease: "power2.inOut" };

      if (dir === "top") {
        fromVars = { top: 0, bottom: "auto", left: 0, right: "auto", width: "100%", height: "0%" };
        toVars.height = "100%";
      } else if (dir === "bottom") {
        fromVars = { top: "auto", bottom: 0, left: 0, right: "auto", width: "100%", height: "0%" };
        toVars.height = "100%";
      } else if (dir === "left") {
        fromVars = { left: 0, right: "auto", top: 0, bottom: "auto", height: "100%", width: "0%" };
        toVars.width = "100%";
      } else {
        fromVars = { left: "auto", right: 0, top: 0, bottom: "auto", height: "100%", width: "0%" };
        toVars.width = "100%";
      }

      scrollTl.fromTo(bgSelector, fromVars, toVars, label);
    });

    const nextTexts = [
      ...infos[i + 1].querySelectorAll(".anim-text"),
      ...(priceItems[i + 1] ? priceItems[i + 1].querySelectorAll(".anim-text") : []),
    ];

    scrollTl.to(
      nextTexts,
      { y: "0%", stagger: 0.05, duration: 1, ease: "power2.out" },
      label + "+=1"
    );
  }

  gsap.utils.toArray(".leaf").forEach((leaf, i) => {
    gsap.to(leaf, {
      y: "-=15",
      rotation: i % 2 === 0 ? 10 : -10,
      duration: 2 + i,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: Math.random() * 2,
    });
  });

  if (window.PRODUCT_DATA && typeof window.updateFrontendUI === "function") {
    window.updateFrontendUI();
  } else if (typeof window.loadProductsJson === "function") {
    window.loadProductsJson();
  }
}

document.addEventListener("product-view-built", initProductScroll);
