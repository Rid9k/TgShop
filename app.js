// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Принудительная установка черно-зелёной темы
document.documentElement.style.setProperty('--tg-theme-bg-color', '#0d1117');
document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff');
document.documentElement.style.setProperty('--tg-theme-button-color', '#2ea043');
document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff');
document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#161b22');
document.documentElement.style.setProperty('--tg-theme-hint-color', '#8b949e');

// URL API
const API_URL = "http://91.197.99.231:8000";

// Данные товаров
let products = [];

// Локальные товары (резервные данные)
const defaultProducts = [
    {
        id: 1,
        title: "Куртка зимняя",
        price: 12990,
        category: "tops",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
        description: "Тёплая зимняя куртка с капюшоном",
        sizes: ["S", "M", "L", "XL"],
        in_stock: true
    },
    {
        id: 2,
        title: "Футболка базовая",
        price: 1990,
        category: "tops",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        description: "Классическая хлопковая футболка",
        sizes: ["XS", "S", "M", "L", "XL"],
        in_stock: true
    },
    {
        id: 3,
        title: "Джинсы skinny",
        price: 4990,
        category: "bottoms",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400",
        description: "Узкие джинсы с высокой посадкой",
        sizes: ["25", "26", "27", "28", "29", "30"],
        in_stock: true
    },
    {
        id: 4,
        title: "Кроссовки Urban",
        price: 8990,
        category: "shoes",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        description: "Стильные городские кроссовки",
        sizes: ["36", "37", "38", "39", "40", "41", "42"],
        in_stock: true
    },
    {
        id: 5,
        title: "🔥 Ботинки Cumpus с мехом",
        price: 70000,
        category: "shoes",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
        description: "Премиальные зимние ботинки с натуральным мехом",
        sizes: ["38", "39", "40", "41", "42", "43"],
        in_stock: true
    },
    {
        id: 6,
        title: "💰 Кофта Dragon Money",
        price: 15000,
        category: "tops",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400",
        description: "Стильная кофта с эксклюзивным принтом",
        sizes: ["S", "M", "L", "XL"],
        in_stock: true
    }
];

// Состояние приложения
let currentCategory = 'all';
let selectedProduct = null;
let selectedSize = null;
let cart = [];

// DOM элементы
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const cartFloat = document.getElementById('cartFloat');
const cartCount = document.getElementById('cartCount');
const productModal = document.getElementById('productModal');
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');

// ========== ЗАГРУЗКА И ОТОБРАЖЕНИЕ ТОВАРОВ ==========

async function loadProducts() {
    if (!API_URL) {
        products = defaultProducts;
        renderProducts();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
            const data = await response.json();
            products = data.products || [];
            if (products.length === 0) {
                products = defaultProducts;
            }
        } else {
            products = defaultProducts;
        }
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        products = defaultProducts;
    }
    renderProducts();
}

function renderProducts(filterText = '') {
    productsGrid.innerHTML = '';

    const filtered = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.title.toLowerCase().includes(filterText.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; opacity: 0.6; color: var(--tg-theme-hint-color);">Товары не найдены</p>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => openProductModal(product);

        const stockBadge = product.in_stock ? '' : '<div style="position:absolute;top:8px;right:8px;background:var(--tg-theme-danger-color);color:white;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:bold;">НЕТ</div>';

        card.innerHTML = `
            <div style="position:relative">
                <img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                ${stockBadge}
            </div>
            <div class="product-info">
                <div class="product-title">${product.title}</div>
                <div class="product-price">${product.price.toLocaleString()} ₽</div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// ========== КАТЕГОРИИ И ПОИСК ==========

document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderProducts(searchInput.value);
    });
});

searchInput.addEventListener('input', (e) => {
    renderProducts(e.target.value);
});

// ========== МОДАЛЬНОЕ ОКНО ТОВАРА ==========

function openProductModal(product) {
    selectedProduct = product;
    selectedSize = null;

    document.getElementById('modalImage').src = product.image || 'https://via.placeholder.com/400x300';
    document.getElementById('modalImage').onerror = function() {
        this.src = 'https://via.placeholder.com/400x300?text=No+Image';
    };
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalPrice').textContent = `${product.price.toLocaleString()} ₽`;
    document.getElementById('modalDescription').textContent = product.description || '';

    const sizeSelector = document.getElementById('sizeSelector');
    sizeSelector.innerHTML = '';

    const sizes = product.sizes || ["S", "M", "L", "XL"];
    sizes.forEach(size => {
        const btn = document.createElement('button');
        btn.className = 'size-btn';
        btn.textContent = size;
        btn.onclick = () => selectSize(size, btn);
        sizeSelector.appendChild(btn);
    });

    productModal.style.display = 'block';
}

function selectSize(size, btn) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function closeModal() {
    productModal.style.display = 'none';
    selectedProduct = null;
    selectedSize = null;
}

function addToCart() {
    if (!selectedProduct) return;
    if (!selectedSize) {
        tg.showAlert('Пожалуйста, выберите размер');
        return;
    }

    cart.push({
        ...selectedProduct,
        selectedSize
    });

    updateCartCount();
    closeModal();
    
    // Вибрация при добавлении
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
    
    tg.showNotification({
        type: 'success',
        title: 'Добавлено в корзину',
        duration: 2000
    });
}

// ========== КОРЗИНА ==========

function updateCartCount() {
    cartCount.textContent = cart.length;
    if (cart.length > 0) {
        cartFloat.style.display = 'flex';
    } else {
        cartFloat.style.display = 'none';
    }
}

function showCart() {
    const cartItems = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">📦 Корзина пуста</p>';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                    <div class="cart-item-size">Размер: ${item.selectedSize}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">&times;</button>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cartTotal').textContent = total.toLocaleString();

    cartModal.style.display = 'block';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    
    if (cart.length === 0) {
        closeCart();
    } else {
        showCart();
    }
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

function closeCart() {
    cartModal.style.display = 'none';
}

// ========== ОФОРМЛЕНИЕ ЗАКАЗА ==========

function showCheckoutForm() {
    if (cart.length === 0) {
        tg.showAlert('Корзина пуста');
        return;
    }

    // Заполняем резюме заказа
    const orderSummary = document.getElementById('orderSummary');
    orderSummary.innerHTML = cart.map(item => `
        <div class="order-item">
            <div>
                <div class="order-item-name">${item.title}</div>
                <div class="order-item-size">Размер: ${item.selectedSize}</div>
            </div>
            <div class="order-item-price">${item.price.toLocaleString()} ₽</div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('orderTotal').textContent = total.toLocaleString();

    // Сбрасываем форму
    document.getElementById('contactInput').value = '';
    document.getElementById('agreeCheckbox').checked = false;
    document.getElementById('contactTelegram').checked = true;
    toggleContactType();
    
    // Скрываем сообщения об ошибках
    hideError();

    cartModal.style.display = 'none';
    checkoutModal.style.display = 'block';
}

function closeCheckoutForm() {
    checkoutModal.style.display = 'none';
}

function toggleContactType() {
    const isTelegram = document.getElementById('contactTelegram').checked;
    const contactInput = document.getElementById('contactInput');
    const contactHint = document.getElementById('contactHint');
    
    if (isTelegram) {
        contactInput.placeholder = '@username или ссылка на профиль';
        contactHint.textContent = 'Введите ваш @username или ссылку на Telegram профиль';
    } else {
        contactInput.placeholder = '+7 (999) 000-00-00';
        contactHint.textContent = 'Введите номер телефона в любом формате';
    }
}

function showError(message) {
    let errorEl = document.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        document.querySelector('.checkout-content h2').insertAdjacentElement('afterend', errorEl);
    }
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

function hideError() {
    const errorEl = document.querySelector('.error-message');
    if (errorEl) {
        errorEl.classList.remove('show');
    }
}

function validateContact(contact, type) {
    if (!contact || contact.trim().length === 0) {
        return { valid: false, message: 'Введите контактные данные' };
    }
    
    if (type === 'telegram') {
        // Проверка Telegram username или ссылки
        const usernamePattern = /^@?[a-zA-Z0-9_]{3,32}$/;
        const linkPattern = /^(https?:\/\/)?(t\.me\/|telegram\.me\/)?@?[a-zA-Z0-9_]{3,32}$/;
        
        if (usernamePattern.test(contact) || linkPattern.test(contact)) {
            return { valid: true };
        }
        return { valid: false, message: 'Неверный формат Telegram. Пример: @username или username' };
    } else {
        // Проверка телефона
        const phonePattern = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        const digitsOnly = contact.replace(/\D/g, '');
        
        if (digitsOnly.length >= 10 && digitsOnly.length <= 15 && phonePattern.test(contact)) {
            return { valid: true };
        }
        return { valid: false, message: 'Неверный формат телефона. Пример: +7 (999) 000-00-00' };
    }
}

function submitOrder() {
    if (cart.length === 0) {
        showError('Корзина пуста');
        return;
    }

    const contactType = document.querySelector('input[name="contactType"]:checked').value;
    const contact = document.getElementById('contactInput').value.trim();
    const agreeCheckbox = document.getElementById('agreeCheckbox');

    // Валидация контакта
    const validation = validateContact(contact, contactType);
    if (!validation.valid) {
        showError(validation.message);
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
        return;
    }

    // Проверка согласия
    if (!agreeCheckbox.checked) {
        showError('Необходимо согласие на обработку персональных данных');
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
        return;
    }

    hideError();

    // Формирование данных заказа
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;

    const orderData = {
        type: 'order',
        contactType: contactType,
        contact: contact,
        items: cart.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            selectedSize: item.selectedSize,
            category: item.category
        })),
        total: total,
        timestamp: formattedDate,
        customer: {
            tgId: tg.initDataUnsafe?.user?.id,
            username: tg.initDataUnsafe?.user?.username,
            firstName: tg.initDataUnsafe?.user?.first_name,
            lastName: tg.initDataUnsafe?.user?.last_name,
            contact: contact,
            contactType: contactType
        }
    };

    // Отправка данных боту
    tg.sendData(JSON.stringify(orderData));

    // Показываем успех
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }

    // Очистка и закрытие
    cart = [];
    updateCartCount();
    closeCheckoutForm();

    // Показываем сообщение об успехе
    showSuccessMessage();
}

function showSuccessMessage() {
    const successHtml = `
        <div class="modal" id="successModal" style="display: block;">
            <div class="modal-content" style="text-align: center; padding: 40px 24px;">
                <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
                <h2 style="margin-bottom: 12px;">Заказ оформлен!</h2>
                <p style="color: var(--tg-theme-hint-color); margin-bottom: 24px; line-height: 1.6;">
                    Спасибо за заказ! Наш менеджер свяжется с вами в ближайшее время для уточнения деталей доставки.
                </p>
                <button class="checkout-btn" onclick="document.getElementById('successModal').remove(); tg.close();" style="max-width: 200px;">
                    Закрыть
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', successHtml);
}

// ========== ОБРАБОТКА КЛИКОВ ==========

window.onclick = (event) => {
    if (event.target === productModal) closeModal();
    if (event.target === cartModal) closeCart();
    if (event.target === checkoutModal) closeCheckoutForm();
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========

loadProducts();
updateCartCount();

// Экспорт функций для глобального доступа
window.toggleContactType = toggleContactType;
window.showCheckoutForm = showCheckoutForm;
window.closeCheckoutForm = closeCheckoutForm;
window.submitOrder = submitOrder;
window.showCart = showCart;
window.closeCart = closeCart;
window.removeFromCart = removeFromCart;
window.addToCart = addToCart;
window.selectSize = selectSize;
window.closeModal = closeModal;
window.openProductModal = openProductModal;
