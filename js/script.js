import { LitElement, html, css } from "https://esm.sh/lit";
// GSAP should be loaded via script tags in HTML.


document.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === 'undefined') return;
  gsap.from(".Branding", {
    duration: 1,
    x: -50,
    opacity: 0,
    ease: "power2.out",
  });

  gsap.from(".Nav-links", {
    duration: 1,
    y: -30,
    opacity: 0,
    ease: "power2.out",
    delay: 0.2,
  });

  gsap.from(".nav-actions", {
    duration: 1,
    x: 50,
    opacity: 0,
    ease: "power2.out",
    delay: 0.4,
  });

  gsap.from(".MobileMenu", {
    duration: 1,
    x: 30,
    opacity: 0,
    ease: "power2.out",
    delay: 0.6,
  });

  // Animate nav buttons on hover
  const navButtons = document.querySelectorAll("#buttons");
  navButtons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      gsap.to(button, {
        duration: 0.3,
        scale: 1.05,
        ease: "power2.out",
      });
    });

    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        duration: 0.3,
        scale: 1,
        ease: "power2.out",
      });
    });
  });

  // Animate nav action buttons on hover
  const actionButtons = document.querySelectorAll(".nav-btn");
  actionButtons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      gsap.to(button, {
        duration: 0.3,
        scale: 1.1,
        rotation: 5,
        ease: "power2.out",
      });
    });

    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        duration: 0.3,
        scale: 1,
        rotation: 0,
        ease: "power2.out",
      });
    });
  });

  // Animate mobile menu toggle
  const mobileToggle = document.querySelector(".toggle2");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      gsap.to(mobileToggle, {
        duration: 0.3,
        rotation: 180,
        ease: "power2.out",
      });
    });
  }
});

// Pin content and move Brand-name to bottom-left on scroll
document.addEventListener("DOMContentLoaded", function () {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const Est = document.querySelector(".Est");
    const welcome = document.querySelector(".Welcome");
    const contentSection = document.querySelector(".content");
    const welcomeSection = document.querySelector(".welcome-section");
    const mainContent = document.querySelector(".main-content");
    const brand = document.querySelector(".Brand-name");
    const intro = document.querySelector(".Intro-line");
    const homemade = document.querySelector(".Homemade");
    const brandWord = document.querySelector(".BrandWord");
    if (!contentSection || !brand) return;

    // Prevent layout shift by promoting Brand-name to its own layer
    gsap.set(brand, { willChange: "transform" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: contentSection,
        start: "top 71px",
        end: "+=200%",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    // Responsive helpers for corner placement
    const getCornerOffsets = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // left padding scales with viewport width, clamped to desktop values
      const leftPadding = Math.max(24, Math.min(520, Math.round(vw * 0.11))); // ~11vw, 24px–520px
      const bottomPadding = Math.max(80, Math.min(300, Math.round(vh * 0.22))); // ~22vh, 80px–300px
      // scale adjusts slightly with width, clamped
      const scale = Math.max(0.5, Math.min(0.85, 0.7 * (vw / 1440)));
      return { leftPadding, bottomPadding, scale };
    };

    // First, fade out Welcome and Est
    tl.to([welcome, Est], {
      duration: 0.3,
      ease: "power2.inOut",
      opacity: 0,
    })
      // Reveal main content (We're, a homemade, brand)
      .to(
        contentSection,
        {
          duration: 1,
          ease: "power2.inOut",
          x: window.innerWidth < 1000 ? 0 : "-28vw",
        },
        ">"
      )
      // Animate individual elements in sequence
      .to(
        intro,
        {
          duration: 0.5,
          ease: "power2.out",
          opacity: 1,
        },
        ">+0.2"
      )
      .to(
        homemade,
        {
          duration: 0.5,
          ease: "power2.out",
          opacity: 1,
          x: 0,
        },
        ">+0.1"
      )
      .to(
        brandWord,
        {
          duration: 0.5,
          ease: "power2.out",
          opacity: 1,
          x: 0,
        },
        ">+0.1"
      );

    // ensure pin and its spacer do not cover the navbar
    const st = tl.scrollTrigger;
    if (st) {
      if (st.pin) st.pin.style.zIndex = "0";
      if (st.pinSpacer) st.pinSpacer.style.zIndex = "0";
    }

    // Recompute on resize/orientation change to keep responsive offsets
    const refreshResponsive = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", refreshResponsive);
    window.addEventListener("orientationchange", refreshResponsive);

    // Set initial states for main content and individual elements
    gsap.set(intro, { opacity: 0 });
    gsap.set(homemade, { opacity: 0, x: -40 });
    gsap.set(brandWord, { opacity: 0, x: -40 });
  }
});

// Theme Toggle Functionality
document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;
  const brandLogo = document.querySelector(".Brand-logo");


  if (!themeToggle) {
    console.error("Theme toggle button not found!");
    return;
  }

  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem("theme") || "light";

  // Apply the saved theme
  applyTheme(currentTheme);

  // Theme toggle event listener
  themeToggle.addEventListener("click", function () {
    const isDark = body.classList.contains("dark-theme");
    const newTheme = isDark ? "light" : "dark";

    // GSAP animation for theme toggle
    gsap.to(themeToggle, {
      duration: 0.3,
      rotation: 360,
      scale: 1.2,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(themeToggle, {
          duration: 0.2,
          scale: 1,
          ease: "power2.out",
        });
      },
    });

    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  });

  function applyTheme(theme) {
    if (theme === "dark") {
      body.classList.add("dark-theme");
      themeToggle.classList.remove("light-mode");
      themeToggle.classList.add("dark-mode");
      if (brandLogo) brandLogo.src = "/images/logo.avif";

    } else {
      body.classList.remove("dark-theme");
      themeToggle.classList.remove("dark-mode");
      themeToggle.classList.add("light-mode");
      if (brandLogo) brandLogo.src = "/images/logo.avif";

    }
  }
});

// Mobile Menu Functionality
document.addEventListener("DOMContentLoaded", function () {
  const checkbox = document.getElementById("checkbox2");

  if (!checkbox) {
    console.error("Mobile menu checkbox not found!");
    return;
  }

  // Create mobile menu overlay
  const menuOverlay = document.createElement("div");
  menuOverlay.className = "mobile-menu-overlay";
  menuOverlay.innerHTML = `
        <div class="mobile-menu-top">
            <div class="mobile-menu-items">
                <a href="index.html" class="mobile-menu-item">Home</a>
                <a href="shop.html" class="mobile-menu-item">Shop</a>
                <a href="about.html" class="mobile-menu-item">About</a>
                <a href="blog.html" class="mobile-menu-item">Blog</a>
            </div>
        </div>
        <div class="mobile-menu-icons">
            <button class="mobile-icon-btn mobile-theme-toggle" aria-label="Toggle theme">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                  class="mobile-moon-icon">
                  <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                  class="mobile-sun-icon" style="display:none;">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2"/><path d="M12 20v2"/>
                  <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
                  <path d="M2 12h2"/><path d="M20 12h2"/>
                  <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                </svg>
                <span>Theme</span>
            </button>
            <a href="profile.html" class="mobile-icon-btn" aria-label="Profile">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Profile</span>
            </a>
            <button class="mobile-icon-btn mobile-cart-btn" aria-label="Cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                  <path d="M3.103 6.034h17.794"/>
                  <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"/>
                </svg>
                <span>Cart</span>
            </button>
        </div>
    `;

  document.body.appendChild(menuOverlay);

  // Sync mobile theme toggle icon with current theme state
  function syncMobileThemeIcon() {
    const isDark = document.body.classList.contains("dark-theme");
    const moonIcon = menuOverlay.querySelector(".mobile-moon-icon");
    const sunIcon  = menuOverlay.querySelector(".mobile-sun-icon");
    if (moonIcon) moonIcon.style.display = isDark ? "none"  : "block";
    if (sunIcon)  sunIcon.style.display  = isDark ? "block" : "none";
  }

  // Wire mobile theme button to the existing desktop theme toggle
  const mobileThemeBtn = menuOverlay.querySelector(".mobile-theme-toggle");
  const desktopThemeBtn = document.getElementById("theme-toggle");
  if (mobileThemeBtn && desktopThemeBtn) {
    mobileThemeBtn.addEventListener("click", function () {
      desktopThemeBtn.click();
      syncMobileThemeIcon();
    });
  }

  // Wire mobile cart button to the existing desktop cart button
  const mobileCartBtn = menuOverlay.querySelector(".mobile-cart-btn");
  const desktopCartBtn = document.querySelector('.nav-btn[aria-label="Shopping cart"]');
  if (mobileCartBtn && desktopCartBtn) {
    mobileCartBtn.addEventListener("click", function () {
      desktopCartBtn.click();
    });
  }

  // Toggle menu when checkbox changes
  checkbox.addEventListener("change", function () {
    if (this.checked) {
      menuOverlay.classList.add("active");
      syncMobileThemeIcon();
    } else {
      menuOverlay.classList.remove("active");
    }
  });

  // Close menu when clicking outside
  menuOverlay.addEventListener("click", function (e) {
    if (e.target === menuOverlay) {
      checkbox.checked = false;
      menuOverlay.classList.remove("active");
    }
  });

  // Close menu when clicking on nav links
  const menuItems = menuOverlay.querySelectorAll(".mobile-menu-item");
  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      checkbox.checked = false;
      menuOverlay.classList.remove("active");
    });
  });
});

// GSAP Animation for Category Divs Height to 0 with ScrollTrigger
document.addEventListener("DOMContentLoaded", function () {
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const categoriesDiv = document.querySelector(".Categories-Div");
    const hamperCategory = document.querySelector(".Hamper-Category");
    const diffuserCategory = document.querySelector(".Diffuser-Category");
    const slideImages = document.querySelectorAll(".slide-image");
    if (!categoriesDiv || !hamperCategory || !diffuserCategory) return;

    // Set initial states for the background images
    gsap.set(".Hamper-Bg", {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
    });

    gsap.set(".Diffuser-Bg", {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
    });

    // Create timeline for the height animations
    const categoryTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: categoriesDiv,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    // Animate Hamper-Category height to 0
    categoryTimeline
      .to(hamperCategory, {
        height: 0,

        ease: "power2.inOut",
      })
      .to(
        slideImages[2],
        {
          y: "30vh",
          ease: "power2.inOut",
        },
        "<"
      )

      .to(diffuserCategory, {
        height: 0,
        ease: "power2.inOut",
      })
      .to(
        slideImages[1],
        {
          y: "30vh",
          ease: "power2.inOut",
        },
        "<"
      );
  }
});

// 000 //
// Best Sellers Carousel Functionality
document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.getElementById("productsCarousel");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const productCards = document.querySelectorAll(".product-card");
  const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");

  if (!carousel || !prevBtn || !nextBtn) return;

  // Create infinite scroll setup
  const totalCards = productCards.length;
  const visibleCards = 3;
  const cardWidth = 350; // 320px card + 30px gap

  let currentIndex = 0;
  let isTransitioning = false;

  // Clone cards for infinite scroll
  function setupInfiniteScroll() {
    // Clone first 3 cards and append to end
    for (let i = 0; i < visibleCards; i++) {
      const clone = productCards[i].cloneNode(true);
      clone.classList.add("clone");
      carousel.appendChild(clone);
    }

    // Clone last 3 cards and prepend to start
    for (let i = totalCards - visibleCards; i < totalCards; i++) {
      const clone = productCards[i].cloneNode(true);
      clone.classList.add("clone");
      carousel.insertBefore(clone, carousel.firstChild);
    }

    // Set initial position to show real first 3 cards
    currentIndex = visibleCards;
    updateCarousel(false);
  }

  // Auto-scroll functionality
  let autoScrollInterval;

  function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, 4000); // Auto-scroll every 4 seconds
  }

  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }

  function updateCarousel(animate = true) {
    if (animate) {
      isTransitioning = true;
      carousel.style.transition = "transform 0.6s ease-in-out";
    } else {
      carousel.style.transition = "none";
    }

    const translateX = -currentIndex * cardWidth;
    carousel.style.transform = `translateX(${translateX}px)`;

    if (animate) {
      setTimeout(() => {
        isTransitioning = false;
      }, 600);
    }
  }

  function nextSlide() {
    currentIndex++;
    updateCarousel();

    // Check if we need to reset position for infinite scroll
    setTimeout(() => {
      if (currentIndex >= totalCards + visibleCards) {
        currentIndex = visibleCards;
        updateCarousel(false);
      }
    }, 600);
  }

  function prevSlide() {
    currentIndex--;
    updateCarousel();

    // Check if we need to reset position for infinite scroll
    setTimeout(() => {
      if (currentIndex < visibleCards) {
        currentIndex = totalCards + visibleCards - 1;
        updateCarousel(false);
      }
    }, 600);
  }

  // Navigation buttons
  prevBtn.addEventListener("click", () => {
    if (!isTransitioning) {
      prevSlide();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (!isTransitioning) {
      nextSlide();
    }
  });

  // Pause auto-scroll on hover
  carousel.addEventListener("mouseenter", stopAutoScroll);
  carousel.addEventListener("mouseleave", startAutoScroll);

  // Add to cart functionality
  addToCartBtns.forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      // GSAP animation for button click
      gsap.to(btn, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
          // Change button text temporarily
          const originalText = btn.querySelector(".btn-text").textContent;
          btn.querySelector(".btn-text").textContent = "Added!";
          btn.style.background =
            "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)";

          // Reset after 2 seconds
          setTimeout(() => {
            btn.querySelector(".btn-text").textContent = originalText;
            btn.style.background =
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
          }, 2000);
        },
      });
    });
  });

  // Initialize
  setupInfiniteScroll();
  startAutoScroll();

  // Pause auto-scroll when page is not visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  });

  // Add ScrollTrigger animation for best sellers section
  const bestSellersSection = document.querySelector(".best-sellers-section");

  if (bestSellersSection && window.ScrollTrigger) {
    gsap.fromTo(
      bestSellersSection,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: bestSellersSection,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Animate product cards with stagger
    gsap.fromTo(
      productCards,
      {
        opacity: 0,
        y: 30,
        scale: 0.9,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: bestSellersSection,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }
});

class ActivitiesWidget extends LitElement {
  // Types without TypeScript? I guess??
  static properties = {
    count: { type: Number },
    activeActivity: { type: Number },
  };

  constructor() {
    super(); // makes `this` work
    this.activeActivity = 1;
  }

  // DOM-releated stuff needs DOM to be ready.
  connectedCallback() {
    super.connectedCallback();
    this.allActivities = this.querySelectorAll(".activity");
    this.allActivities[0].classList.add("active");
    this.count = this.allActivities.length;
    console.log("connectedCallback called");
    console.log("Total activities:", this.count);
  }

  _makeActive(index) {
    console.log("Activating card at index:", index);

    this.allActivities.forEach((activity, i) => {
      activity.classList.remove("active");
      // Reset animation by removing animation style/classes
      activity.style.animation = "none";
    });

    const activeActivity = this.allActivities[index];

    // Force reflow to restart animation
    void activeActivity.offsetWidth;

    activeActivity.classList.add("active");
    activeActivity.style.animation = ""; // Re-enable animation via CSS

    // Animation end event listener remains unchanged
    activeActivity.addEventListener(
      "animationend",
      () => {
        this.classList.remove("children-animating");
        console.log("Animation ended for card index:", index);
      },
      { once: true }
    );

    this.classList.add("children-animating");
  }

  _movePrevious() {
    const currentIndex = this.activeActivity;
    let previousIndex = this.activeActivity - 1;
    if (previousIndex < 0) previousIndex = this.count - 1;

    // immediately set current active card z-index to 2 (on top)
    this.allActivities[currentIndex].style.zIndex = "2";

    // set previous card z-index to 1 (below current)
    this.allActivities[previousIndex].style.zIndex = "1";

    // activate previous card with animation
    this._makeActive(currentIndex);

    // after delay, swap z-index to make previous card top and current card back
    setTimeout(() => {
      this.allActivities[currentIndex].style.zIndex = "0";
      this.allActivities[previousIndex].style.zIndex = "2";
    }, 330); // animation midpoint delay

    // reset all other cards z-index to 0
    this.allActivities.forEach((card, index) => {
      if (index !== currentIndex && index !== previousIndex) {
        card.style.zIndex = "0";
      }
    });

    // update activeActivity index
    this.activeActivity = previousIndex;
  }

  _moveNext() {
    // current active card z-index 1
    this.allActivities[this.activeActivity].style.zIndex = "1";

    // increment activeActivity index
    this.activeActivity = (this.activeActivity + 1) % this.count;

    // activate next card with animation
    this._makeActive(this.activeActivity);

    // next card z-index 2 to appear on top during animation
    setTimeout(() => {
      this.allActivities[this.activeActivity].style.zIndex = "2";
    }, 330);

    // reset other cards z-index to 0 or lower
    this.allActivities.forEach((card, index) => {
      if (
        index !== this.activeActivity &&
        index !== (this.activeActivity - 1 + this.count) % this.count
      ) {
        card.style.zIndex = "0";
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.allActivities = this.querySelectorAll(".activity");
    this.allActivities[0].classList.add("active");
    this.count = this.allActivities.length;

    const left_btn = document.getElementById("left");
    const right_btn = document.getElementById("right");

    left_btn.addEventListener("click", () => {
      console.log("Left button clicked");
      this._movePrevious();
    });
    right_btn.addEventListener("click", () => {
      console.log("Right button clicked");
      this._moveNext();
    });
  }

  // Light DOM!
  createRenderRoot() {
    return this;
  }

  // Inject additional stuff into DOM (stays Light DOM), and allow Lit-style reactivity and event handling.
  render() {
    return html`
      <div class="activities-count">
        ${this.activeActivity + 1}/${this.count}
      </div>
    `;
  }
}

customElements.define("activities-widget", ActivitiesWidget);
