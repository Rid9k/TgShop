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

// URL API для загрузки товаров (теперь читаем из GitHub)
const API_URL = 'https://raw.githubusercontent.com/rid9k/TgShop/main/products.json';

// Данные товаров
let products = [];

// Локальные товары (резерв)
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
    }
];

// Состояние приложения
let currentCategory = 'all';
let selectedProduct = null;
let cart = [];
let customerContact = '';

// DOM элементы
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const cartFloat = document.getElementById('cartFloat');
const cartCount = document.getElementById('cartCount');
const productModal = document.getElementById('productModal');
const cartModal = document.getElementById('cartModal');

// Загрузка товаров с GitHub
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
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
        products = defaultProducts;
    }
    renderProducts();
}

// Отображение товаров
function renderProducts(filterText = '') {
    productsGrid.innerHTML = '';

    const filtered = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.title.toLowerCase().includes(filterText.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; opacity: 0.6; color: #8b949e;">Товары не найдены</p>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => openProductModal(product);
        
        const stockBadge = product.in_stock ? '' : '<div style="position:absolute;top:8px;right:8px;background:#ff4444;color:white;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:bold;">НЕТ</div>';
        
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

// Переключение категорий
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderProducts(searchInput.value);
    });
});

// Поиск
searchInput.addEventListener('input', (e) => {
    renderProducts(e.target.value);
});

// Открытие модального окна товара
function openProductModal(product) {
    selectedProduct = product;

    document.getElementById('modalImage').src = product.image || 'https://via.placeholder.com/400x300';
    document.getElementById('modalImage').onerror = function() {
        this.src = 'https://via.placeholder.com/400x300?text=No+Image';
    };
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalPrice').textContent = `${product.price.toLocaleString()} ₽`;
    document.getElementById('modalDescription').textContent = product.description || '';

    // Скрываем выбор размера
    const sizeSelector = document.getElementById('sizeSelector');
    if (sizeSelector) {
        sizeSelector.innerHTML = '<span style="opacity:0.6; font-size:14px;">Размер не требуется</span>';
    }

    productModal.style.display = 'block';
}

// Добавление в корзину
function addToCart() {
    if (!selectedProduct) return;

    cart.push({
        ...selectedProduct,
        selectedSize: "One Size"
    });

    updateCartCount();
    closeModal();
    
    if (tg.showNotification) {
        tg.showNotification({
            type: 'success',
            title: 'Добавлено в корзину',
            duration: 2000
        });
    }
}

// Обновление счётчика корзины
function updateCartCount() {
    cartCount.textContent = cart.length;
    if (cart.length > 0) {
        cartFloat.style.display = 'flex';
    } else {
        cartFloat.style.display = 'none';
    }
}

// Открытие корзины
function showCart() {
    const cartItems = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart" style="text-align:center;padding:20px;opacity:0.6;">Корзина пуста</p>';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item" style="display:flex;align-items:center;gap:12px;padding:12px;background:#161b22;border-radius:8px;margin-bottom:12px;">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image" style="width:60px;height:60px;object-fit:cover;border-radius:6px;" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                <div class="cart-item-info" style="flex:1;">
                    <div class="cart-item-title" style="font-weight:600;margin-bottom:4px;">${item.title}</div>
                    <div class="cart-item-price" style="color:#2ea043;font-weight:700;">${item.price.toLocaleString()} ₽</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})" style="background:#ff4444;color:white;border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;font-weight:bold;">&times;</button>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cartTotal').textContent = total.toLocaleString();

    // Поле для контакта
    const contactSection = document.getElementById('contactSection');
    if (!contactSection) {
        const contactHtml = `
            <div id="contactSection" style="margin-top:20px;padding-top:20px;border-top:1px solid #30363d;">
                <label style="display:block;margin-bottom:8px;font-weight:600;color:#c9d1d9;">📱 Ваш контакт (обязательно)</label>
                <input type="text" id="customerContact" placeholder="@username или +7 999 123-45-67" 
                    style="width:100%;padding:12px;border:1px solid #30363d;border-radius:8px;background:#0d1117;color:#ffffff;font-size:16px;outline:none;"
                    oninput="validateContact()">
                <p id="contactError" style="color:#ff4444;font-size:14px;margin-top:8px;display:none;">⚠️ Пожалуйста, введите Telegram @username или номер телефона</p>
            </div>
        `;
        const cartTotal = document.querySelector('.cart-total');
        if (cartTotal) {
            cartTotal.insertAdjacentHTML('beforebegin', contactHtml);
        }
    }

    cartModal.style.display = 'block';
}

// Проверка контакта
function validateContact() {
    const contact = document.getElementById('customerContact').value.trim();
    const errorElement = document.getElementById('contactError');
    const isValid = contact.startsWith('@') || /^\+?\d[\d\s-]{8,}$/.test(contact);
    
    if (errorElement) {
        errorElement.style.display = isValid || contact.length === 0 ? 'none' : 'block';
    }
    
    return isValid && contact.length > 0;
}

// Удаление из корзины
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    showCart();
}

// Закрытие корзины
function closeCart() {
    cartModal.style.display = 'none';
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        tg.showAlert('Корзина пуста');
        return;
    }

    // Проверка контакта
    const contact = document.getElementById('customerContact').value.trim();
    if (!contact) {
        tg.showAlert('Пожалуйста, введите ваш Telegram @username или номер телефона');
        return;
    }

    const isValid = contact.startsWith('@') || /^\+?\d[\d\s-]{8,}$/.test(contact);
    if (!isValid) {
        tg.showAlert('Пожалуйста, введите корректный @username или номер телефона');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    // Формируем дату
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
    
    const orderText = cart.map(item => `${item.title} — ${item.price.toLocaleString()} ₽`).join('\n');

    const message = `🛒 **Новый заказ!**\n\n` +
        `👤 **Контакт:** ${contact}\n` +
        `📅 **Дата:** ${dateStr}\n\n` +
        `**Товары:**\n${orderText}\n\n` +
        `💰 **Итого:** ${total.toLocaleString()} ₽`;

    // Отправка данных боту
    tg.sendData(JSON.stringify({
        type: 'order',
        contact: contact,
        items: cart,
        total: total,
        date: dateStr
    }));

    // Очистка корзины
    cart = [];
    updateCartCount();
    closeCart();

    tg.showAlert(`✅ **Заказ оформлен!**\n\n${message}\n\nМенеджер свяжется с вами в ближайшее время.`);
}

// Закрытие модальных окон по клику вне контента
window.onclick = (event) => {
    if (event.target === productModal) closeModal();
    if (event.target === cartModal) closeCart();
};

// Закрытие модального окна товара
function closeModal() {
    productModal.style.display = 'none';
    selectedProduct = null;
}

// Инициализация
loadProducts();
updateCartCount();
