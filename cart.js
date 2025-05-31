// cart.js
document.addEventListener('DOMContentLoaded', function() {
    // Обновление счетчика корзины
    function updateCartCounter() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const counter = document.getElementById('cart-counter');
        if (counter) counter.textContent = cart.length;
    }

    // Обработчик кнопок "В корзину"
    document.body.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = e.target.dataset.id;
            const product = {
                id: productId,
                name: e.target.closest('.product').querySelector('h3').textContent,
                price: e.target.closest('.product').querySelector('strong').textContent,
                image: e.target.closest('.product').querySelector('img').src
            };
            
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.push(product);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCounter();
            alert('Товар добавлен в корзину!');
        }
    });

    updateCartCounter();
});