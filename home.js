// Cart & Menu State Management
let cart = JSON.parse(localStorage.getItem('frrorCart')) || {};

// Default menu fallback
const defaultMenu = [
    { name: "Deluxe Sandwich", price: 12.99, img: "Reference Images/food1.png" },
    { name: "Savory Platter", price: 18.50, img: "Reference Images/food2.jpg" },
    { name: "Breakfast Special", price: 9.00, img: "Reference Images/food3.svg" },
    { name: "Hearty Meal", price: 15.75, img: "Reference Images/food4.jpg" },
    { name: "Signature Burger", price: 14.20, img: "Reference Images/card.png" }
];

let menu = JSON.parse(localStorage.getItem('frrorMenu'));

if (!menu) {
    menu = defaultMenu;
    localStorage.setItem('frrorMenu', JSON.stringify(menu));
}

document.addEventListener('DOMContentLoaded', () => {
    initCart();
    renderMenu();

    // Search Logic
    const searchInput = document.getElementById('menu-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            renderMenu(query);
        });
    }

    // Secret Staff Portal navigation logic (5 clicks on logo)
    let logoClicks = 0;
    const secretLink = document.getElementById('secret-brand-link');
    if (secretLink) {
        secretLink.addEventListener('click', () => {
            logoClicks++;
            if (logoClicks >= 5) {
                window.location.href = 'staff-login.html';
            }
            // Reset after 2 seconds of inactivity
            setTimeout(() => {
                logoClicks = 0;
            }, 2000);
        });
    }
});

function renderMenu(filterQuery = '') {
    const grid = document.getElementById('dynamic-food-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filteredMenu = menu.filter(item =>
        item.name.toLowerCase().includes(filterQuery)
    );

    if (filteredMenu.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; width:100%;">No items found matching your search.</p>';
        return;
    }

    filteredMenu.forEach(item => {
        const card = document.createElement('div');
        card.className = 'neo-card';

        // Read current quantity from cart if it exists
        const currentQty = cart[item.name] ? cart[item.name].quantity : 0;

        card.innerHTML = `
            <div class="card-image-wrap neo-inset">
                <img src="${item.img}" alt="${item.name}">
            </div>
            <div class="card-content">
                <h3>${item.name}</h3>
                <p class="price">$${item.price.toFixed(2)}</p>
                <div class="qty-controls">
                    <button class="qty-btn decrement" onclick="handleQtyChange('${item.name.replace(/'/g, "\\'")}', -1, ${item.price}, '${item.img}')">-</button>
                    <span class="qty-display count" id="qty-${encodeURIComponent(item.name)}">${currentQty}</span>
                    <button class="qty-btn increment" onclick="handleQtyChange('${item.name.replace(/'/g, "\\'")}', 1, ${item.price}, '${item.img}')">+</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.handleQtyChange = function (itemName, change, price, img) {
    let currentQty = cart[itemName] ? cart[itemName].quantity : 0;

    // Calculate new qty, prevent going below 0
    let newQty = Math.max(0, currentQty + change);

    // If no change happened (e.g. trying to decrement 0), do nothing
    if (newQty === currentQty) return;

    updateCart(itemName, newQty, price, img);

    // Update local UI
    const display = document.getElementById(`qty-${encodeURIComponent(itemName)}`);
    if (display) display.innerText = newQty;

    // Visual feedback
    if (change > 0) {
        showToast(`${itemName} added!`);
    }
}

function updateCart(itemName, qty, price, img) {
    if (qty === 0) {
        delete cart[itemName];
    } else {
        cart[itemName] = {
            quantity: qty,
            price: price,
            img: img
        };
    }

    localStorage.setItem('frrorCart', JSON.stringify(cart));
    updateCartCount();
}

function initCart() {
    updateCartCount();
}

function updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
        animateBtn(document.querySelector('.cart-icon'));
    }
}

function animateBtn(element) {
    if (!element) return;
    element.style.transform = 'scale(0.9)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 150);
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'neo-toast';
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(120%)';
        toast.style.transition = 'all 0.3s ease-in';

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}
