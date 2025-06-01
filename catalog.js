
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'reg.html';
        return;
    }

    // Определяем текущую категорию из имени файла
    const currentPage = window.location.pathname.split('/').pop();
    let currentCategory = '';
    
    // Сопоставляем страницы с категориями
    const categoryMap = {
        'catalogverh.html': 'verh',
        'catalogobyv.html': 'obuv',
        'catalogniz.html': 'niz',
        'catalogekip.html': 'ekip',
        'cataloginv.html': 'inv'
    };
    
    currentCategory = categoryMap[currentPage] || '';

    // Загрузка товаров (если категория есть - фильтруем, если нет - показываем все)
    loadProducts(currentCategory);
    
    // Инициализация корзины (общая для всех)
    initCart();

    // Функционал для админа
    if (currentUser.email === 'karpala628@gmail.com') {
        document.getElementById('admin-panel').style.display = 'block';
        
        document.getElementById('add-product-btn').addEventListener('click', function() {
            document.getElementById('add-product-modal').style.display = 'flex';
        });
        
        document.getElementById('cancel-add').addEventListener('click', function() {
            document.getElementById('add-product-modal').style.display = 'none';
        });
        
        document.getElementById('product-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('product-name').value;
            const description = document.getElementById('product-description').value;
            const price = parseFloat(document.getElementById('product-price').value);
            const image = document.getElementById('product-image').value;
            
            if (!name || !description || isNaN(price) || !image) {
                showNotification('Заполните все поля корректно!', 'error');
                return;
            }
            
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            
            // Определяем текущую категорию из URL
            const currentPage = window.location.pathname.split('/').pop().toLowerCase();
            let category = '';
            
            if (currentPage.includes('verh')) category = 'verh';
            else if (currentPage.includes('obuv')) category = 'obuv';
            else if (currentPage.includes('niz')) category = 'niz';
            else if (currentPage.includes('ekip')) category = 'ekip';
            else if (currentPage.includes('inv')) category = 'inv';
            
            if (!category) {
                showNotification('Не удалось определить категорию товара!', 'error');
                return;
            }
            
            products.push({
                id: newId,
                name: name,
                description: description,
                price: price.toFixed(2) + ' BYN',
                image: image,
                category: category // Устанавливаем категорию явно
            });
            
            localStorage.setItem('products', JSON.stringify(products));
            loadProducts(category); // Загружаем товары только этой категории
            document.getElementById('add-product-modal').style.display = 'none';
            this.reset();
            
            showNotification(`Товар успешно добавлен в каталог ${category}!`, 'success');
        });
    }
});

function loadProducts(category = '') {
    const productsContainer = document.getElementById('products-container');
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Фильтруем товары по категории, если категория указана
    if (category) {
        products = products.filter(product => product.category === category);
    } else {
        // Если категория не указана, показываем все товары (или ничего, в зависимости от требований)
        products = []; // или оставьте products без изменений, если нужно показывать все
    }
    
    productsContainer.innerHTML = '';
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="empty-catalog">
                <p>Каталог ${category ? 'этой категории' : ''} пуст</p>
                ${currentUser?.email === 'karpala628@gmail.com' ? 
                    '<p>Используйте кнопку "Добавить товар"</p>' : 
                    '<p>Администратор скоро добавит товары</p>'}
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.dataset.id = product.id;
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" 
                 onerror="this.src='https://via.placeholder.com/250x200?text=Нет+изображения'">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p><strong>${product.price}</strong></p>
            <button class="add-to-cart" data-id="${product.id}">В корзину</button>
        `;
        productsContainer.appendChild(productElement);
    });
}

// Функции для работы с корзиной (остаются без изменений)
function initCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const cartIcon = document.getElementById('cart-icon');
    const cartPanel = document.getElementById('cart-panel');
    const cartCounter = document.getElementById('cart-counter');
    const cartItems = document.getElementById('cart-items');
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout');
    
    function updateCart() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const validCartItems = cart.filter(item => 
            products.some(product => product.id.toString() === item.id)
        );
        
        if (validCartItems.length !== cart.length) {
            cart = validCartItems;
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        
        cartCounter.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
            return;
        }
        
        let total = 0;
        
        cart.forEach(item => {
            const priceNumber = parseFloat(item.price.replace(' BYN', ''));
            total += priceNumber * item.quantity;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">${item.price} × ${item.quantity}</span>
                </div>
                <button class="remove-item" data-id="${item.id}">×</button>
            `;
            cartItems.appendChild(itemElement);
        });
        
        const totalElement = document.createElement('div');
        totalElement.className = 'cart-total';
        totalElement.innerHTML = `
            <div class="total-line"></div>
            <div class="total-sum">
                <span>Итого:</span>
                <span>${total.toFixed(2)} BYN</span>
            </div>
        `;
        cartItems.appendChild(totalElement);
    }
    
    function addToCart(productId) {
        const products = JSON.parse(localStorage.getItem('products'));
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showNotification('Товар не найден!', 'error');
            return;
        }
        
        const existingItem = cart.find(item => item.id === productId.toString());
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId.toString(),
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        showNotification(`${product.name} добавлен в корзину!`, 'success');
        animateAddToCart();
    }
    
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId.toString());
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }
    
    function toggleCart() {
        cartPanel.classList.toggle('active');
        if (cartPanel.classList.contains('active')) {
            updateCart();
        }
    }
    
    function clearCart() {
        if (confirm('Вы уверены, что хотите очистить корзину?')) {
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
            showNotification('Корзина очищена', 'info');
        }
    }
    
    function checkout() {
        if (cart.length === 0) {
            showNotification('Корзина пуста!', 'error');
            return;
        }
        
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const invalidItems = cart.filter(item => 
            !products.some(product => product.id.toString() === item.id)
        );
        
        if (invalidItems.length > 0) {
            showNotification('Некоторые товары были удалены администратором', 'error');
            clearCart();
            return;
        }
        
        showNotification('Заказ оформлен! Спасибо за покупку!', 'success');
        clearCart();
    }
    
    function animateAddToCart() {
        const cartIconRect = cartIcon.getBoundingClientRect();
        const animation = document.createElement('div');
        animation.className = 'cart-animation';
        animation.innerHTML = '+1';
        animation.style.top = `${cartIconRect.top}px`;
        animation.style.left = `${cartIconRect.left}px`;
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 1000);
    }
    
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    cartIcon.addEventListener('click', toggleCart);
    clearCartBtn.addEventListener('click', clearCart);
    checkoutBtn.addEventListener('click', checkout);
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            addToCart(parseInt(e.target.getAttribute('data-id')));
        }
        
        if (e.target.classList.contains('remove-item')) {
            removeFromCart(e.target.getAttribute('data-id'));
        }
    });
    
    setInterval(() => {
        const newCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (JSON.stringify(cart) !== JSON.stringify(newCart)) {
            cart = newCart;
            updateCart();
        }
    }, 1000);
    
    updateCart();
}