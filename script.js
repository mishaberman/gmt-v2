// Create global variables
let userEmail = '';
let userCity = '';
let userZip = '';

// Function to update global variables
function updateVariables() {
    const emailInput = document.getElementById('email');
    const cityInput = document.getElementById('city');
    const zipInput = document.getElementById('zip');
    if (emailInput) userEmail = emailInput.value;
    if (cityInput) userCity = cityInput.value;
    if (zipInput) userZip = zipInput.value;
}

// Add event listeners to input boxes
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const cityInput = document.getElementById('city');
    const zipInput = document.getElementById('zip');
    updateVariables();
    if (emailInput) emailInput.addEventListener('input', updateVariables);
    if (cityInput) cityInput.addEventListener('input', updateVariables);
    if (zipInput) zipInput.addEventListener('input', updateVariables);
});

// Initialize the cart
let cart = {};

// Get the cart count element
const cartCountElement = document.getElementById('cart-count');

// Update the cart count in UI
function updateCartCount() {
    const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = cartCount;
}

// Add an item to the cart
function addToCart(name, price) {
    if (cart[name]) {
        cart[name].quantity++;
    } else {
        cart[name] = { price, quantity: 1 };
    }
    updateCartCount();
    showNotification(`Added ${name} to cart!`);
    saveCartToLocalStorage();

    // Push GTM dataLayer event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
            currency: 'USD',
            value: price,
            items: [{
                item_name: name,
                price: price,
                quantity: 1
            }]
        }
    });
}

// Remove an item from the cart
function removeFromCart(name) {
    if (cart[name]) {
        const removedItem = cart[name];
        delete cart[name];
        updateCartCount();
        saveCartToLocalStorage();

        // Push GTM dataLayer event
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'remove_from_cart',
            ecommerce: {
                currency: 'USD',
                value: removedItem.price * removedItem.quantity,
                items: [{
                    item_name: name,
                    price: removedItem.price,
                    quantity: removedItem.quantity
                }]
            }
        });

        // Optional: Facebook Pixel (no direct remove event, so you might skip or log)
    }
}

// Save cart to local storage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from local storage
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartCount();
    }
}

// Load cart at start
loadCartFromLocalStorage();

// Display cart table
function displayCartTable() {
    const cartTableBody = document.getElementById('cart-body');
    if (!cartTableBody) return;
    cartTableBody.innerHTML = '';
    for (const name in cart) {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = `$${cart[name].price}`;
        row.appendChild(priceCell);

        const quantityCell = document.createElement('td');
        quantityCell.textContent = cart[name].quantity;
        row.appendChild(quantityCell);

        const totalCell = document.createElement('td');
        totalCell.textContent = `$${cart[name].price * cart[name].quantity}`;
        row.appendChild(totalCell);

        cartTableBody.appendChild(row);
    }

    document.getElementById('cart-total').textContent = getCartTotal().toFixed(2);
}

// Display if cart table exists
if (document.getElementById('cart-table')) {
    displayCartTable();
}

// Get total cart value
function getCartTotal() {
    return Object.values(cart).reduce((acc, item) => acc + (item.price * item.quantity), 0);
}

// Display cart summary (checkout)
function displayCartSummary() {
    const cartSummaryBody = document.getElementById('cart-summary-body');
    if (!cartSummaryBody) return;
    cartSummaryBody.innerHTML = '';
    for (const name in cart) {
        const row = document.createElement('tr');

        const productCell = document.createElement('td');
        productCell.textContent = name;
        productCell.style.width = '40%';
        row.appendChild(productCell);

        const quantityCell = document.createElement('td');
        quantityCell.textContent = cart[name].quantity;
        quantityCell.style.width = '20%';
        quantityCell.style.textAlign = 'center';
        row.appendChild(quantityCell);

        const totalCell = document.createElement('td');
        totalCell.textContent = `$${cart[name].price * cart[name].quantity}`;
        totalCell.style.width = '40%';
        totalCell.style.textAlign = 'right';
        row.appendChild(totalCell);

        cartSummaryBody.appendChild(row);
    }

    document.getElementById('cart-total').textContent = getCartTotal().toFixed(2);
}

// Display if checkout summary exists
if (document.getElementById('cart-summary-table')) {
    loadCartFromLocalStorage();
    displayCartSummary();
}

// Complete purchase
function completePurchase() {
    const total = getCartTotal();
    const items = Object.entries(cart).map(([name, data]) => ({
        item_name: name,
        price: data.price,
        quantity: data.quantity
    }));

    // Push GTM dataLayer purchase event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
            transaction_id: 'txn_' + Date.now(), // create unique ID
            value: total,
            currency: 'USD',
            items: items
        }
    });

    // Clear cart and redirect
    cart = {};
    saveCartToLocalStorage();
    updateCartCount();
    window.location.href = 'purchase-confirmation.html';
}

// Add listener to purchase button
if (document.getElementById('purchase-btn')) {
    document.getElementById('purchase-btn').addEventListener('click', completePurchase);
}

// Initiate checkout
function initiateCheckout() {
    window.location.href = 'checkout.html';
}

// Notification helper
function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `
        <span>${message}</span>
        <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M10 2C5.14 2 1 5.14 1 10s4.14 8 9 8 9-4.14 9-8S14.86 2 10 2z" fill="#fff" />
        </svg>
    `;
    document.body.appendChild(notification);
    setTimeout(() => { notification.remove(); }, 3000);
}
