document.addEventListener('DOMContentLoaded', function() {
    // Проверка прав администратора
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || !currentUser.isAdmin) {
        alert('Доступ запрещен!');
        window.location.href = 'index.html';
        return;
    }
    
    // Элементы DOM
    const manageProductsBtn = document.getElementById('manageProductsBtn');
    const manageOrdersBtn = document.getElementById('manageOrdersBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const productsSection = document.getElementById('productsSection');
    const ordersSection = document.getElementById('ordersSection');
    const addProductForm = document.getElementById('addProductForm');
    const productsList = document.getElementById('productsList');
    
    // Переключение между разделами
    manageProductsBtn.addEventListener('click', () => {
        manageProductsBtn.classList.add('active');
        manageOrdersBtn.classList.remove('active');
        productsSection.style.display = 'block';
        ordersSection.style.display = 'none';
        loadProducts();
    });
    
    manageOrdersBtn.addEventListener('click', () => {
        manageOrdersBtn.classList.add('active');
        manageProductsBtn.classList.remove('active');
        productsSection.style.display = 'none';
        ordersSection.style.display = 'block';
        loadOrders();
    });
    
    // Выход из системы
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // Добавление нового товара
    addProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newProduct = {
            id: Date.now().toString(),
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value).toFixed(2) + ' BYN',
            image: document.getElementById('productImage').value || 'https://via.placeholder.com/250x200?text=Товар'
        };
        
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        
        alert('Товар успешно добавлен!');
        addProductForm.reset();
        loadProducts();
    });
    
    // Загрузка товаров
    function loadProducts() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        productsList.innerHTML = '';
        
        if (products.length === 0) {
            productsList.innerHTML = '<p>Нет товаров в каталоге</p>';
            return;
        }
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/250x200?text=Товар'">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p><strong>${product.price}</strong></p>
                <div class="product-actions">
                    <button class="edit-btn" data-id="${product.id}">Редактировать</button>
                    <button class="delete-btn" data-id="${product.id}">Удалить</button>
                </div>
            `;
            productsList.appendChild(productCard);
        });
        
        // Обработчики для кнопок редактирования и удаления
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteProduct(this.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                editProduct(this.getAttribute('data-id'));
            });
        });
    }
    
    // Удаление товара
    function deleteProduct(productId) {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            let products = JSON.parse(localStorage.getItem('products')) || [];
            products = products.filter(p => p.id !== productId);
            localStorage.setItem('products', JSON.stringify(products));
            loadProducts();
        }
    }
    
    // Редактирование товара (упрощенная версия)
    function editProduct(productId) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = parseFloat(product.price);
        document.getElementById('productImage').value = product.image;
        
        // Удаляем старую версию товара
        deleteProduct(productId);
        
        // Прокручиваем к форме
        document.getElementById('addProductForm').scrollIntoView();
    }
    
    // Загрузка заказов
    function loadOrders() {
        // В реальном приложении здесь была бы загрузка заказов
        ordersSection.innerHTML = '<p>Функционал заказов будет реализован в будущем</p>';
    }
    
    // Инициализация
    loadProducts();
});