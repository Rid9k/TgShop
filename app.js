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

// URL API (замените на ваш URL после деплоя)
// Для локального тестирования: "http://localhost:8000"
// Для продакшена: "https://your-app.onrender.com"
const API_URL = "http://localhost:8000";

// Данные товаров (загружаются с API или используются локальные)
let products = [];

// Локальные товары (резерв, если API недоступен)
const defaultProducts = [
    {
        id: 1,
        title: "Куртка зимняя",
        price: 12990,
        category: "tops",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
        description: "Тёплая зимняя куртка с капюшоном. Водонепроницаемая ткань, утеплитель до -30°C.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: 2,
        title: "Футболка базовая",
        price: 1990,
        category: "tops",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        description: "Классическая хлопковая футболка. Идеально подходит для повседневной носки.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        id: 3,
        title: "Джинсы skinny",
        price: 4990,
        category: "bottoms",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400",
        description: "Узкие джинсы с высокой посадкой. Эластичный деним для комфорта.",
        sizes: ["25", "26", "27", "28", "29", "30"]
    },
    {
        id: 4,
        title: "Кроссовки Urban",
        price: 8990,
        category: "shoes",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        description: "Стильные городские кроссовки. Дышащая сетка, амортизирующая подошва.",
        sizes: ["36", "37", "38", "39", "40", "41", "42"]
    },
    {
        id: 5,
        title: "Свитер оверсайз",
        price: 5490,
        category: "tops",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400",
        description: "Объёмный свитер из мягкой пряжи. Уютный выбор для холодных дней.",
        sizes: ["S", "M", "L"]
    },
    {
        id: 6,
        title: "Брюки классические",
        price: 3990,
        category: "bottoms",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
        description: "Элегантные брюки со стрелками. Подходят для офиса и официальных мероприятий.",
        sizes: ["42", "44", "46", "48", "50"]
    },
    {
        id: 7,
        title: "Кеды классические",
        price: 5990,
        category: "shoes",
        image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400",
        description: "Классические белые кеды. Натуральная кожа, минималистичный дизайн.",
        sizes: ["36", "37", "38", "39", "40", "41"]
    },
    {
        id: 8,
        title: "Шарф кашемировый",
        price: 2990,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400",
        description: "Мягкий кашемировый шарф. Роскошный аксессуар для холодного сезона.",
        sizes: ["One Size"]
    },
    {
        id: 9,
        title: "Платье миди",
        price: 6990,
        category: "tops",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
        description: "Элегантное платье миди. Подчёркивает силуэт, подходит для любых случаев.",
        sizes: ["XS", "S", "M", "L"]
    },
    {
        id: 10,
        title: "Сумка тоут",
        price: 4490,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
        description: "Вместительная сумка-тоут. Натуральная кожа, минималистичный дизайн.",
        sizes: ["One Size"]
    },
    {
        id: 11,
        title: "Худи базовое",
        price: 3490,
        category: "tops",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400",
        description: "Классическое худи из плотного хлопка. Удобство и стиль в каждой детали.",
        sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
        id: 12,
        title: "Ботинки челси",
        price: 9990,
        category: "shoes",
        image: "https://images.unsplash.com/photo-1608256246200-53e632e0e56b?w=400",
        description: "Стильные ботинки челси. Натуральная замша, удобная колодка.",
        sizes: ["37", "38", "39", "40", "41", "42"]
    },
    {
        id: 13,
        title: "🔥 Ботинки Cumpus с мехом",
        price: 70000,
        category: "shoes",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
        description: "Премиальные зимние ботинки Cumpus с натуральным мехом. Максимальное тепло и комфорт в любую погоду. В наличии.",
        sizes: ["38", "39", "40", "41", "42", "43"]
    },
    {
        id: 14,
        title: "💰 Кофта Dragon Money",
        price: 15000,
        category: "tops",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400",
        description: "Стильная кофта Dragon Money с эксклюзивным принтом. Премиальное качество, лимитированная серия. В наличии.",
        sizes: ["S", "M", "L", "XL"]
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

// Загрузка товаров с API
async function loadProducts() {
    try {
        console.log('Загрузка товаров из API:', API_URL);
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
            const data = await response.json();
            products = data.products || [];
            console.log('Загружено товаров:', products.length);
        } else {
            console.warn('API вернул ошибку, используем локальные товары');
            products = defaultProducts;
        }
    } catch (error) {
        console.error('API недоступен:', error);
        console.log('Используем локальные товары');
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
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; opacity: 0.6;">Товары не найдены</p>';
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

// Выбор размера
function selectSize(size, btn) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// Закрытие модального окна товара
function closeModal() {
    productModal.style.display = 'none';
    selectedProduct = null;
    selectedSize = null;
}

// Добавление в корзину
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
    tg.showNotification({
        type: 'success',
        title: 'Добавлено в корзину',
        duration: 2000
    });
}

// Обновление счётчика корзины
function updateCartCount() {
    cartCount.textContent = cart.length;
    if (cart.length > 0) {
        cartFloat.style.display = 'flex';
    }
}

// Открытие корзины
function showCart() {
    const cartItems = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
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

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const orderText = cart.map(item => `${item.title} (${item.selectedSize}) - ${item.price.toLocaleString()} ₽`).join('\n');

    const message = `🛒 Новый заказ:\n\n${orderText}\n\n💰 Итого: ${total.toLocaleString()} ₽`;

    // Отправка данных боту
    tg.sendData(JSON.stringify({
        type: 'order',
        items: cart,
        total: total
    }));

    // Очистка корзины
    cart = [];
    updateCartCount();
    closeCart();

    tg.showConfirm(`Заказ оформлен!\n\n${message}\n\nМенеджер свяжется с вами в ближайшее время.`);
}

// Закрытие модальных окон по клику вне контента
window.onclick = (event) => {
    if (event.target === productModal) closeModal();
    if (event.target === cartModal) closeCart();
};

// Инициализация
loadProducts();
updateCartCount();
