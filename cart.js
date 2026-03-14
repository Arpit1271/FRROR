let cart = JSON.parse(localStorage.getItem('frrorCart')) || {};

document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    // Checkout Logic
    document.getElementById('btn-checkout').addEventListener('click', handleCheckout);

    // Close Token Modal
    document.getElementById('btn-close-token').addEventListener('click', () => {
        document.getElementById('token-modal').classList.remove('active');
        window.location.href = 'home.html';
    });
});

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    const totalPriceEl = document.getElementById('total-price');
    const cartCountEl = document.getElementById('cart-count');

    container.innerHTML = '';

    const itemKeys = Object.keys(cart);
    let totalItems = 0;
    let totalPrice = 0;

    if (itemKeys.length === 0) {
        container.innerHTML = '<div class="empty-cart-msg">Your cart is empty. <br><br> <button class="neo-btn" onclick="window.location.href=\'home.html\'">Go back to menu</button></div>';
        summary.style.display = 'none';
        cartCountEl.textContent = '0';
        return;
    }

    itemKeys.forEach(itemName => {
        const item = cart[itemName];
        totalItems += item.quantity;
        totalPrice += (item.quantity * item.price);

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';

        itemDiv.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.img}" class="cart-item-img" alt="${itemName}">
                <div class="item-details">
                    <h3>${itemName}</h3>
                    <p class="price">$${item.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn decrement" onclick="updateItem('${itemName}', -1)">-</button>
                <span class="qty-display count">${item.quantity}</span>
                <button class="qty-btn increment" onclick="updateItem('${itemName}', 1)">+</button>
            </div>
        `;

        container.appendChild(itemDiv);
    });

    summary.style.display = 'block';
    totalPriceEl.textContent = totalPrice.toFixed(2);
    cartCountEl.textContent = totalItems;
}

window.updateItem = function (itemName, change) {
    if (!cart[itemName]) return;

    cart[itemName].quantity += change;

    if (cart[itemName].quantity <= 0) {
        delete cart[itemName];
    }

    localStorage.setItem('frrorCart', JSON.stringify(cart));
    renderCart();
}

function handleCheckout() {
    if (Object.keys(cart).length === 0) return;

    // Generate random 3-digit token (100–999)
    const token = Math.floor(100 + Math.random() * 900);

    // Build order object
    const order = {
        token: token,
        items: { ...cart },
        total: Object.values(cart).reduce((sum, item) => sum + (item.quantity * item.price), 0),
        timestamp: new Date().toISOString()
    };

    // Save to orders array in localStorage
    let orders = JSON.parse(localStorage.getItem('frrorOrders')) || [];
    orders.push(order);
    localStorage.setItem('frrorOrders', JSON.stringify(orders));

    // Clear the cart
    cart = {};
    localStorage.setItem('frrorCart', JSON.stringify(cart));

    // Show the token modal
    document.getElementById('token-display').textContent = token;
    document.getElementById('token-modal').classList.add('active');

    // Re-render empty cart behind the modal
    renderCart();
}
