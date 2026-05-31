const mm = gsap.matchMedia();

mm.add("(min-width: 1001px)", () => {
  // Desktop animations
  var tl = gsap.timeline({
    scrollTrigger: {

      trigger: ".two",
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
    }
  });

  tl.to("#hero-candle", {
    top: "120%",
    left: "5%",
    x: 0,
    y: 0,
    xPercent: 0,
    yPercent: 0
  }, 'orange')
  tl.to("#dried-orange", {
    top: "160%",
    left: "23%"
  }, 'orange')
  tl.to("#lavender", {
    width: "10%",
    top: "160%",
    right: "10%"
  }, 'orange')
  tl.to("#flower-petal", {
    top: "110%",
    rotate: "130deg",
    left: "70%"
  }, 'orange')
  tl.to("#flower-petal2", {
    top: "110%",
    rotate: "130deg",
    left: "0%"
  }, 'orange')

  var tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".three",
      start: "0% 95%",
      end: "60% 50%",
      scrub: 1,
    }
  })

  tl2.from(".petal1", {
    rotate: "-90deg",
    left: "-100%",
    top: "110%"
  }, 'ca')
  tl2.from("#diffuser", {
    rotate: "-90deg",
    top: "110%",
    left: "-100%",
  }, 'ca')

  tl2.to("#dried-orange", {
    width: "10%",
    left: "42%",
    top: "204%"
  }, 'ca')

  // LANDING CANDLE IN CARD (Desktop)
  tl2.to("#hero-candle", {
    width: "15%",
    top: "222%",
    left: "42%",
  }, 'ca')
});

mm.add("(max-width: 1000px)", () => {
  // Mobile animations
  gsap.from(".card-shop", {
    y: 50,
    duration: 1,

    scrollTrigger: {
      // markers: true,
      trigger: ".two",
      start: "top bottom",
      end: "bottom bottom",

    }
  });

  // Re-enable and animate the floating hero elements for mobile scroll
  var tl_mobile = gsap.timeline({
    scrollTrigger: {
      // markers: true,
      trigger: ".two",
      start: "0% bottom",
      end: "bottom bottom",
      scrub: 1,
    }
  });

  tl_mobile.to("#hero-candle", {
    top: "160%", // Move towards the first card (Candle)
    left: "22%",
    width: "25%",
  }, 'm1')

  tl_mobile.to("#dried-orange", {
    top: "120%",
    left: "30%",
    width: "15%"
  }, 'm1')

  tl_mobile.to("#lavender", {
    top: "160%",
    right: "5%",
    width: "15%"
  }, 'm1')

  tl_mobile.to("#flower-petal", {
    top: "110%",
    left: "10%",
    rotate: "120deg"
  }, 'm1')

  tl_mobile.to("#flower-petal2", {
    top: "180%",
    left: "60%",
    rotate: "-60deg"
  }, 'm1')

  // Prevent overlap in the third section and LAND CANDLE
  var tl2_mobile = gsap.timeline({
    scrollTrigger: {
      trigger: ".three",
      start: "top bottom",
      end: "500vh bottom",
      scrub: 1,
    }
  });
  tl2_mobile.to("#hero-candle", {
    top: "225%",
    left: "26%",
    width: "25%",
    opacity: 1,

  })
  tl2_mobile.to("#dried-orange", {
    top: "190%",
    left: "35%"

  }, "<")


});

// Initial state check and resize listener for the tall-screen static layout
function updateLayout() {
  const isTall = window.innerHeight > window.innerWidth - 100;
  if (isTall) {
    document.body.classList.add('static-layout');
    // Disable all scroll triggers to stop animations
    ScrollTrigger.getAll().forEach(st => st.disable());
    // Reset transforms on hero elements
    gsap.set(["#hero-candle", "#diffuser", "#hamper", "#dried-orange", "#lavender", "#flower-petal", "#flower-petal2"], {
      clearProps: "all"
    });
    ScrollTrigger.refresh();
  } else {
    document.body.classList.remove('static-layout');
    // Re-enable scroll triggers
    ScrollTrigger.getAll().forEach(st => st.enable());
    ScrollTrigger.refresh();
  }
}

// Ensure the layout logic runs after everything is loaded
window.addEventListener('load', () => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
});
