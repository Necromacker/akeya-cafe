// Cart Data Definitions mapped by Page URL (roughly)
// Since we have specific pages for regular products, we can define the data here.
let PRODUCT_DATA = {};
window.PRODUCT_DATA = PRODUCT_DATA;

const PAGE_PRODUCT_MAP = {
  "candles.html": ["candle-1", "candle-2", "candle-3", "candle-4", "candle-5", "candle-6"],
  "diffuser.html": ["diffuser-1", "diffuser-2", "diffuser-3", "diffuser-4", "diffuser-5", "diffuser-6"],
  "hampers.html": ["hamper-1", "hamper-2", "hamper-3", "hamper-4", "hamper-5", "hamper-6"]
};
const API_BASE = 'https://cottage-candles.onrender.com/api';

async function loadProductsJson() {
  try {
    const res = await fetch('products.json');
    const data = await res.json();
    Object.assign(PRODUCT_DATA, data);
    updateFrontendUI();
  } catch (e) {
    console.error('Failed to load products.json', e);
  }
}

function updateFrontendUI() {
  // Dynamically update product listings in the frontend (such as candle-collection.html, diffuser.html)
  document.querySelectorAll('[onclick*="addToCart("]').forEach(btn => {
    const match = btn.getAttribute('onclick').match(/addToCart\(['"]([^'"]+)['"]\)/);
    if (match && match[1]) {
      const id = match[1];
      const data = PRODUCT_DATA[id];
      if (data) {
        const card = btn.closest('.product-card');
        if (card) {
          const priceEl = card.querySelector('.price');
          if (priceEl) priceEl.innerText = `$${data.price.toFixed(2)}`;

          const titleEl = card.querySelector('h3');
          if (titleEl) titleEl.innerText = data.name;

          const img = card.querySelector('.theme-switchable-image') || card.querySelector('img');
          if (img && (data.imageLight || data.imageDark)) {
            if (img.classList.contains('theme-switchable-image')) {
              img.setAttribute('data-light-src', data.imageLight);
              img.setAttribute('data-dark-src', data.imageDark);
              const isDark = document.body.classList.contains('dark-theme');
              img.src = isDark ? data.imageDark : data.imageLight;
            } else {
              img.src = data.imageLight || data.image;
            }
          }
        }
      }
    }
  });

  // Handle price-display elements in detail pages
  document.querySelectorAll('[data-product-id]').forEach(el => {
    const id = el.getAttribute('data-product-id');
    const data = PRODUCT_DATA[id];
    if (data) {
      // If it's a price-display container
      const priceDisplay = el.querySelector('.price-display');
      if (priceDisplay) {
        priceDisplay.innerText = `$${data.price.toFixed(2)}`;
      }
      // If the element itself is a price element
      if (el.classList.contains('price') || el.classList.contains('price-display')) {
        el.innerText = `$${data.price.toFixed(2)}`;
      }
      // Handle titles if needed
      const titleDisplay = el.querySelector('.title-display');
      if (titleDisplay) {
        titleDisplay.innerText = data.name;
      }
    }
  });
}
window.updateFrontendUI = updateFrontendUI;

class ShoppingCart {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem("cottageCart")) || [];
    this.init();
  }

  async init() {
    await loadProductsJson();
    this.injectCartHTML();
    this.renderCart();
    this.setupEventListeners();
    this.setupThemeObserver();
    await this.syncWithBackend();
  }

  async syncWithBackend() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
            const res = await fetch(`${API_BASE}/user/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const backendCart = await res.json();
        if (backendCart && backendCart.length > 0) {
          this.cart = backendCart.map(item => {
            const p = item.productId;
            return {
              id: (p && p._id) || p,
              name: (p && p.name) || item.name || 'Product',
              price: (p && p.price) || item.price || 0,
              quantity: item.quantity,
              imageLight: (p && p.imageLight) || item.imageLight || '',
              imageDark: (p && p.imageDark) || item.imageDark || ''
            };
          });
          this.saveCart();
          this.renderCart();
        }
      }
    } catch (err) {
      console.error('Failed to sync cart from backend:', err);
    }
  }

  setupThemeObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          this.renderCart();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  injectCartHTML() {
    if (window.location.pathname.includes("profile.html")) return;
    const cartHTML = `
            <div class="cart-overlay" id="cartOverlay"></div>
            <div class="cart-drawer" id="cartDrawer">
                <div class="cart-header">
                    <h2>Your Bag</h2>
                    <button class="close-cart-btn" id="closeCart">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="cart-items" id="cartItems">
                    <!-- Items injected here -->
                </div>
                <div class="cart-footer">
                    <div class="subtotal-row">
                        <span>Subtotal</span>
                        <span id="cartSubtotal">$0.00</span>
                    </div>
                    <button class="checkout-btn">Checkout</button>
                </div>
            </div>
        `;
    document.body.insertAdjacentHTML("beforeend", cartHTML);
  }

  setupEventListeners() {
    // Toggle Button (Nav Icon)
    document.querySelectorAll('button[aria-label="Shopping cart"], #cart-icon').forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.openCart();
      });
    });

    // Close Button & Overlay
    const closeBtn = document.getElementById("closeCart");
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeCart());

    const overlay = document.getElementById("cartOverlay");
    if (overlay) overlay.addEventListener("click", () => this.closeCart());

    // Add To Cart (Product Pages)
    const addBtns = document.querySelectorAll(".add-btn");
    addBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.handleAddToCart());
    });

    // Cart Items Container (Delegation)
    const itemsContainer = document.getElementById("cartItems");
    if (itemsContainer) {
      itemsContainer.addEventListener("click", (e) => {
        const target = e.target;
        const itemRow = target.closest(".cart-item");
        if (!itemRow) return;
        const id = itemRow.dataset.id;

        if (target.closest(".plus-btn")) {
          this.updateQuantity(id, 1);
        } else if (target.closest(".minus-btn")) {
          this.updateQuantity(id, -1);
        } else if (target.closest(".remove-item-btn")) {
          this.removeItem(id);
        }
      });
    }

    // Checkout Button
    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        if (localStorage.getItem("token")) {
          window.location.href = "profile.html?tab=cart";
        } else {
          alert("Please login to checkout");
          window.location.href = "auth.html";
        }
      });
    }
  }

  // Handle Add from Scroll Page (context based)
  handleAddToCart() {
    const path = window.location.pathname.split("/").pop();
    const productIds = PAGE_PRODUCT_MAP[path];

    if (productIds) {
      const index = window.activeProductIndex || 0;
      const productId = productIds[index];
      if (productId) {
        this.handleDirectAdd(productId);
      } else {
        console.error("Product ID not found for index:", index);
      }
    } else {
      // Fallback for pages not in map or if called incorrectly
      console.warn("No product map for this page, check PAGE_PRODUCT_MAP in cart.js");
    }
  }

  // Handle Direct Add by ID (for Collection Pages)
  handleDirectAdd(productId) {
    const product = PRODUCT_DATA[productId];
    if (product) {
      this.addItem(product);
      this.openCart();
    } else {
      console.error("Product not found:", productId);
    }
  }

  async addItem(product) {
    const productId = product.dbId || product.id;
    const existingItem = this.cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        imageLight: product.imageLight || product.image || '',
        imageDark: product.imageDark || product.image || '',
        quantity: 1
      });
    }

    this.saveCart();
    this.renderCart();

    const token = localStorage.getItem('token');
    if (token) {
      try {
                await fetch(`${API_BASE}/user/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: productId,
            quantity: 1,
            price: product.price
          })
        });
      } catch (err) {
        console.error('Failed to sync cart with backend:', err);
      }
    }
  }

  async removeItem(id) {
    this.cart = this.cart.filter((item) => item.id !== id);
    this.saveCart();
    this.renderCart();

    const token = localStorage.getItem('token');
    if (token) {
      try {
                await fetch(`${API_BASE}/user/cart/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to remove item from backend cart:', err);
      }
    }
  }

  async updateQuantity(id, change) {
    const item = this.cart.find((item) => item.id === id);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        this.removeItem(id);
      } else {
        this.saveCart();
        this.renderCart();

        const token = localStorage.getItem('token');
        if (token) {
          try {
                        await fetch(`${API_BASE}/user/cart/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ quantity: item.quantity })
            });
          } catch (err) {
            console.error('Failed to update quantity to backend:', err);
          }
        }
      }
    }
  }

  saveCart() {
    localStorage.setItem("cottageCart", JSON.stringify(this.cart));
  }

  renderCart() {
    const container = document.getElementById("cartItems");
    const subtotalEl = document.getElementById("cartSubtotal");
    container.innerHTML = "";

    let total = 0;
    const isDark = document.body.classList.contains("dark-theme");

    if (this.cart.length === 0) {
      container.innerHTML =
        '<p class="empty-cart-message">Your bag is empty.</p>';
    } else {
      this.cart.forEach((item) => {
        const data = PRODUCT_DATA[item.id] || item;
        total += item.price * item.quantity;

        let itemImage = '';
        if (isDark) {
          itemImage = data.imageDark || data.image || item.imageDark || item.image || item.imageLight;
        } else {
          itemImage = data.imageLight || data.image || item.imageLight || item.image || item.imageDark;
        }

        if (!itemImage || itemImage === 'undefined') {
          itemImage = 'images/placeholder.jpg';
        }

        const itemName = data.name || item.name || 'Product';

        const html = `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${itemImage}" alt="${itemName}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div>
                                <h3 class="item-name">${itemName}</h3>
                                <div class="item-price">$${item.price.toFixed(2)}</div>
                            </div>
                            <div class="item-controls">
                                <div class="quantity-controls">
                                    <button class="qty-btn minus-btn">-</button>
                                    <span class="item-qty">${item.quantity}</span>
                                    <button class="qty-btn plus-btn">+</button>
                                </div>
                                <button class="remove-item-btn">Remove</button>
                            </div>
                        </div>
                    </div>
                `;
        container.insertAdjacentHTML("beforeend", html);
      });
    }

    subtotalEl.textContent = `$${total.toFixed(2)}`;
  }

  openCart() {
    document.getElementById("cartOverlay").classList.add("open");
    document.getElementById("cartDrawer").classList.add("open");
  }

  closeCart() {
    document.getElementById("cartOverlay").classList.remove("open");
    document.getElementById("cartDrawer").classList.remove("open");
  }
}

// Initialize on load
// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  window.cartInstance = new ShoppingCart();
});

// Global Function for Buy Now Buttons
window.addToCart = function (productId) {
  if (window.cartInstance) {
    window.cartInstance.handleDirectAdd(productId);
  }
};
