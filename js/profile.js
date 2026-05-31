const API_BASE = 'https://cottage-candles.onrender.com/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    initTabs();
    loadProfile();
    setupEventListeners();

    // Handle tab from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
        const tabBtn = document.querySelector(`.nav-item[data-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();
    }
});

function initTabs() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            item.classList.add('active');
            document.getElementById(tab).classList.add('active');

            // Load specific tab data
            if (tab === 'cart') loadCart();
            if (tab === 'orders') loadOrders();
            if (tab === 'addresses') loadAddresses();
        });
    });
}

async function loadProfile() {
    try {
        const res = await fetch(`${API_BASE}/user/profile`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to load profile');

        currentUser = await res.json();
        const details = currentUser.profileDetails || {};
        
        document.getElementById('user-name').innerText = `${details.firstName || 'User'} ${details.lastName || ''}`;
        document.getElementById('user-email').innerText = details.email || '';

        // Populate form
        document.getElementById('firstName').value = details.firstName || '';
        document.getElementById('lastName').value = details.lastName || '';
        document.getElementById('email').value = details.email || '';
        document.getElementById('contact').value = details.contact || '';
    } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        window.location.href = 'auth.html';
    }
}

function setupEventListeners() {
    // Profile Update
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(profileForm);
        const data = Object.fromEntries(formData.entries());

        const res = await fetch(`${API_BASE}/user/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert('Profile updated successfully!');
            loadProfile();
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // Address Modal
    const modal = document.getElementById('address-modal');
    const closeBtn = document.querySelector('.close');
    const addBtn = document.getElementById('add-address-btn');

    addBtn.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // Add Address
    const addressForm = document.getElementById('address-form');
    addressForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addressForm);
        const data = Object.fromEntries(formData.entries());

        const res = await fetch(`${API_BASE}/user/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            modal.style.display = 'none';
            addressForm.reset();
            loadAddresses();
        }
    });

    // Checkout Button
    document.getElementById('checkout-btn').addEventListener('click', () => {
        handleCheckout();
    });
}

async function loadCart() {
    const res = await fetch(`${API_BASE}/user/cart`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const cart = await res.json();
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.style = "display: flex; gap: 20px; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;";
        const isDark = document.body.classList.contains('dark-theme');
        
        let itemImage = '';
        if (isDark) {
            itemImage = item.imageDark || item.imageLight || item.productId?.imageDark || item.productId?.images?.[0];
        } else {
            itemImage = item.imageLight || item.imageDark || item.productId?.imageLight || item.productId?.images?.[0];
        }
        
        // Fallback ProductData lookup if needed
        const tempId = item.productId?._id || item.productId || item.id;
        if (window.PRODUCT_DATA && window.PRODUCT_DATA[tempId]) {
            const data = window.PRODUCT_DATA[tempId];
            itemImage = itemImage || data.imageLight || data.imageDark || data.image;
        }

        if (!itemImage || itemImage === 'undefined') {
            itemImage = `images/placeholder.jpg`;
        }

        let itemName = item.name || item.productId?.name;
        if (!itemName && window.PRODUCT_DATA && window.PRODUCT_DATA[tempId]) {
            itemName = window.PRODUCT_DATA[tempId].name;
        }
        itemName = itemName || 'Product';

        itemEl.innerHTML = `
            <img src="${itemImage}" alt="${itemName}" class="item-img">
            <div class="item-details">
                <h4 class="cart-item-name">${itemName}</h4>
                <p class="cart-item-qty">Qty: ${item.quantity}</p>
                <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
            </div>
            <button class="btn-delete" onclick="removeFromCart('${item.productId || item._id}')"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(itemEl);
    });

    document.getElementById('cart-total').innerText = `₹${total.toFixed(2)}`;
}

window.removeFromCart = async (id) => {
    await fetch(`${API_BASE}/user/cart/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    loadCart();
};

async function loadAddresses() {
    const res = await fetch(`${API_BASE}/user/addresses`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const addresses = await res.json();
    const container = document.getElementById('addresses-list');
    container.innerHTML = '';

    addresses.forEach(addr => {
        const card = document.createElement('div');
        card.className = 'address-card';
        card.innerHTML = `
            <p>${addr.street}</p>
            <p>${addr.city}, ${addr.state} - ${addr.zipCode}</p>
            <p>${addr.country}</p>
            <div class="address-actions">
                <button class="btn-delete" onclick="deleteAddress('${addr._id}')">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

window.deleteAddress = async (id) => {
    await fetch(`${API_BASE}/user/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    loadAddresses();
};

async function loadOrders() {
    const res = await fetch(`${API_BASE}/user/orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const orders = await res.json();
    const container = document.getElementById('orders-list');
    container.innerHTML = '';

    orders.forEach(order => {
        const orderEl = document.createElement('div');
        orderEl.className = 'order-card';
        
        let userName = "User";
        if (currentUser && currentUser.profileDetails) {
            userName = `${currentUser.profileDetails.firstName} ${currentUser.profileDetails.lastName || ''}`;
        }
        
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        
        // Header HTML
        const headerHtml = `
            <div style="background-color: #f0f2f2; padding: 14px 18px; border-bottom: 1px solid #d5d9d9; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 15px; font-size: 13px; color: #565959;">
                <div style="display: flex; gap: 40px;">
                    <div style="display: flex; flex-direction: column;">
                        <span style="text-transform: uppercase; font-size: 11px; margin-bottom: 4px;">Order Placed</span>
                        <span style="color: #0f1111; font-weight: 500;">${orderDate}</span>
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <span style="text-transform: uppercase; font-size: 11px; margin-bottom: 4px;">Total</span>
                        <span style="color: #0f1111; font-weight: 500;">₹${order.totalAmount}</span>
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <span style="text-transform: uppercase; font-size: 11px; margin-bottom: 4px;">Ship To</span>
                        <span style="color: #007185; font-weight: 500; cursor: pointer;">${userName} <i class="fas fa-chevron-down" style="font-size: 10px;"></i></span>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="text-transform: uppercase; font-size: 11px; margin-bottom: 4px;">Order # ${order.orderId || order._id.slice(-10)}</span>
                    <div style="display: flex; gap: 10px;">
                        <a href="#" style="color: #007185; text-decoration: none; font-weight: 500;">View order details</a>
                        <span style="color: #ddd;">|</span>
                        <a href="#" style="color: #007185; text-decoration: none; font-weight: 500;">Invoice <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
                    </div>
                </div>
            </div>
        `;
        
        // Body HTML
        const itemsHtml = order.items.map(item => {
            let productImg = 'images/placeholder.jpg';
            if (item.productId && typeof item.productId === 'object') {
                if (item.productId.images && item.productId.images.length > 0) {
                    productImg = item.productId.images[0];
                } else if (item.productId.imageLight) {
                    productImg = item.productId.imageLight;
                }
            } else if (window.PRODUCT_DATA && window.PRODUCT_DATA[item.productId || item.id]) {
                const data = window.PRODUCT_DATA[item.productId || item.id];
                productImg = data.imageLight || data.imageDark || data.image || productImg;
            }
                
            const itemName = item.name || (item.productId && item.productId.name) || 'Product';
            
            return `
            <div class="order-item">
                <img src="${productImg}" alt="${itemName}" class="item-img">
                <div class="item-details">
                    <h4 class="cart-item-name">${itemName}</h4>
                    <p class="cart-item-qty">Qty: ${item.quantity}</p>
                    <div class="cart-item-price">₹${item.price}</div>
                </div>
                <div>
                    <button class="btn-premium-outline contact-seller-btn">
                        Contact Seller
                    </button>
                </div>
            </div>
            `;
        }).join('');
        
        let statusText = order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Processing';
        let statusColor = 'var(--text-primary)';
        if (order.orderStatus === 'delivered') statusColor = 'green';
        else if (order.orderStatus === 'cancelled') statusColor = 'red';
        else if (statusText === 'Processing') statusColor = '#e67a00';
        
        const bodyHtml = `
            <div style="padding: 20px;">
                <div class="order-status-header" style="color: ${statusColor};">
                    ${statusText}
                </div>
                ${itemsHtml}
            </div>
        `;
        
        orderEl.innerHTML = headerHtml + bodyHtml;
        container.appendChild(orderEl);
    });
}

async function handleCheckout() {
    // Check if contact number exists
    if (!currentUser || !currentUser.profileDetails || !currentUser.profileDetails.contact || currentUser.profileDetails.contact.trim() === "") {
        alert('Please enter your contact number in Profile Details before proceeding to buy.');
        // Switch to profile tab and focus contact input
        const profileTab = document.querySelector('.nav-item[data-tab="profile"]');
        if (profileTab) profileTab.click();
        setTimeout(() => document.getElementById('contact').focus(), 100);
        return;
    }

    const res = await fetch(`${API_BASE}/user/cart`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const cart = await res.json();
    if (cart.length === 0) return alert('Cart is empty');

    let total = 0;
    cart.forEach(item => total += item.price * item.quantity);

    // Select address
    const addrRes = await fetch(`${API_BASE}/user/addresses`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const addresses = await addrRes.json();
    if (addresses.length === 0) return alert('Please add an address first');

    // For simplicity, pick first address (or show a prompt)
    const selectedAddress = addresses[0];

    // Create Razorpay Order
    const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: total })
    });
    const rzpOrder = await orderRes.json();

    // Get Razorpay Key from backend
    const keyRes = await fetch(`${API_BASE}/payments/key`);
    const { key } = await keyRes.json();

    const options = {
        key: key,
        amount: rzpOrder.amount,
        currency: "INR",
        name: "Aeka's Coffee",
        description: "Café order",
        order_id: rzpOrder.id,
        handler: async function (response) {
            // Verify payment
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                })
            });

            if (verifyRes.ok) {
                // Save Order to DB
                const saveRes = await fetch(`${API_BASE}/user/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        items: cart.map(i => {
                            const pId = i.productId?._id || i.productId || i.id;
                            const pName = i.name || i.productId?.name || 'Product';
                            return { productId: pId, name: pName, quantity: i.quantity, price: i.price };
                        }),
                        totalAmount: total,
                        shippingAddress: selectedAddress,
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id
                    })
                });

                if (saveRes.ok) {
                    localStorage.removeItem('cottageCart');
                    alert('Order placed successfully!');
                    window.location.reload();
                } else {
                    const errData = await saveRes.json();
                    alert(`Failed to save order: ${errData.message || 'Unknown error'}`);
                }
            } else {
                alert('Payment verification failed');
            }
        },
        prefill: {
            name: `${currentUser.profileDetails.firstName} ${currentUser.profileDetails.lastName}`,
            email: currentUser.profileDetails.email,
            contact: currentUser.profileDetails.contact
        },
        theme: { color: "#d4a373" }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}
