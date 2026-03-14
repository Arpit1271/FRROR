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
    renderStaffMenu();

    setupDropzone('dropzone', 'file-input', 'dropzone-preview', 'item-img-base64');
    setupDropzone('edit-dropzone', 'edit-file-input', 'edit-dropzone-preview', 'edit-item-img-base64');

    // Add Item Modal Logic
    const addModal = document.getElementById('add-glass-modal');
    document.getElementById('btn-open-add').addEventListener('click', () => {
        addModal.classList.add('active');
    });
    document.getElementById('btn-close-add').addEventListener('click', () => {
        addModal.classList.remove('active');
    });

    // Add Item Logic
    document.getElementById('btn-add-item').addEventListener('click', () => {
        const nameInput = document.getElementById('item-name');
        const priceInput = document.getElementById('item-price');
        const imgInput = document.getElementById('item-img-base64');

        const name = nameInput.value.trim();
        const price = parseFloat(priceInput.value);
        const img = imgInput.value || 'Reference Images/card.png'; // Fallback image

        if (!name || isNaN(price)) {
            showToast("Please provide a valid name and price.");
            return;
        }

        // Check for duplicates
        if (menu.find(item => item.name.toLowerCase() === name.toLowerCase())) {
            showToast("An item with this name already exists.");
            return;
        }

        menu.push({ name, price, img });
        saveMenu();
        renderStaffMenu();

        // Clear fields and close modal
        nameInput.value = '';
        priceInput.value = '';
        imgInput.value = '';
        document.getElementById('dropzone-preview').style.display = 'none';
        document.getElementById('dropzone-preview').src = '';
        document.getElementById('dropzone').querySelector('span').style.display = 'block';
        document.getElementById('add-glass-modal').classList.remove('active');
        showToast(`${name} added successfully!`);
    });

    // Edit Modal Cancels
    document.getElementById('btn-cancel-edit').addEventListener('click', () => {
        document.getElementById('edit-modal').classList.remove('active');
    });

    // Edit Complete Logic
    document.getElementById('btn-save-edit').addEventListener('click', () => {
        const originalName = document.getElementById('edit-original-name').value;
        const newName = document.getElementById('edit-item-name').value.trim();
        const newPrice = parseFloat(document.getElementById('edit-item-price').value);
        const newImg = document.getElementById('edit-item-img-base64').value || 'Reference Images/card.png';

        if (!newName || isNaN(newPrice)) {
            showToast("Valid name and price required.");
            return;
        }

        const itemIndex = menu.findIndex(item => item.name === originalName);
        if (itemIndex > -1) {
            // Also need to update the cart if they renamed the item
            updateCartItemName(originalName, newName, newPrice, newImg);

            menu[itemIndex] = { name: newName, price: newPrice, img: newImg };
            saveMenu();
            renderStaffMenu();
            document.getElementById('edit-modal').classList.remove('active');
            showToast(`${newName} updated!`);
        }
    });
});

function renderStaffMenu() {
    const list = document.getElementById('staff-menu-list');
    list.innerHTML = '';

    if (menu.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding: 2rem;">Menu is totally empty. Add an item above!</p>';
        return;
    }

    menu.forEach(item => {
        const row = document.createElement('div');
        row.className = 'menu-item-row';
        row.innerHTML = `
            <div class="item-row-info">
                <img src="${item.img}" class="item-row-img" alt="${item.name}">
                <div>
                    <h3 style="margin:0; font-size:1.2rem;">${item.name}</h3>
                    <p style="margin:0; color:var(--accent); font-weight:700;">$${item.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="neo-btn action-btn btn-edit" onclick="openEditModal('${item.name.replace(/'/g, "\\'")}')">Edit</button>
                <button class="neo-btn action-btn btn-delete" onclick="deleteMenuItem('${item.name.replace(/'/g, "\\'")}')">Remove</button>
            </div>
        `;
        list.appendChild(row);
    });
}

window.deleteMenuItem = function (name) {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
        menu = menu.filter(item => item.name !== name);
        saveMenu();

        // Also remove from cart if it exists
        let cart = JSON.parse(localStorage.getItem('frrorCart')) || {};
        if (cart[name]) {
            delete cart[name];
            localStorage.setItem('frrorCart', JSON.stringify(cart));
        }

        renderStaffMenu();
        showToast(`${name} removed.`);
    }
}

window.openEditModal = function (name) {
    const item = menu.find(i => i.name === name);
    if (!item) return;

    document.getElementById('edit-original-name').value = item.name;
    document.getElementById('edit-item-name').value = item.name;
    document.getElementById('edit-item-price').value = item.price;
    document.getElementById('edit-item-img-base64').value = item.img;

    // Set preview
    const preview = document.getElementById('edit-dropzone-preview');
    const span = document.getElementById('edit-dropzone').querySelector('span');
    if (item.img !== 'Reference Images/card.png') {
        preview.src = item.img;
        preview.style.display = 'block';
        span.style.display = 'none';
    } else {
        preview.src = '';
        preview.style.display = 'none';
        span.style.display = 'block';
    }

    document.getElementById('edit-modal').classList.add('active');
}

function saveMenu() {
    localStorage.setItem('frrorMenu', JSON.stringify(menu));
}

function updateCartItemName(originalName, newName, newPrice, newImg) {
    let cart = JSON.parse(localStorage.getItem('frrorCart')) || {};
    if (cart[originalName]) {
        const qty = cart[originalName].quantity;
        delete cart[originalName]; // Remove old mapping

        // Re-inject with new name/price mapping
        cart[newName] = {
            quantity: qty,
            price: newPrice,
            img: newImg
        };
        localStorage.setItem('frrorCart', JSON.stringify(cart));
    }
}

// Reuse toast logic from home.js
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

// Drag and Drop Logic
function setupDropzone(zoneId, inputId, previewId, base64Id) {
    const dropzone = document.getElementById(zoneId);
    const fileInput = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const base64Store = document.getElementById(base64Id);
    if (!dropzone || !fileInput) return;
    const spanText = dropzone.querySelector('span');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (!file.type.match('image.*')) {
                showToast("Please drop an image file.");
                return;
            }
            compressImage(file, (base64) => {
                // Update preview
                preview.src = base64;
                preview.style.display = 'block';
                spanText.style.display = 'none';

                // Store base64 string in hidden input
                base64Store.value = base64;
            });
        }
    }
}

// Client-side canvas compression for localStorage quotas
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');

            // Max width/height to limit base64 string size
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;

            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Export as compressed JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            callback(dataUrl);
        };
    };
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}
