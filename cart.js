let cart = JSON.parse(localStorage.getItem('frrorCart')) || {};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderCart();

    // Theme Switcher Logic
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerText = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.innerText = newTheme === 'dark' ? '☀️' : '🌙';
}

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
    renderCart(); // Re-render whole cart
}
