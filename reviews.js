document.addEventListener('DOMContentLoaded', function() {
    // Ключ для localStorage
    const STORAGE_KEY = 'product_reviews';
    
    // Элементы DOM
    const addReviewBtn = document.getElementById('addReviewBtn');
    const reviewForm = document.getElementById('reviewForm');
    const cancelReviewBtn = document.getElementById('cancelReviewBtn');
    const newReviewForm = document.getElementById('newReviewForm');
    const ratingStars = document.getElementById('ratingStars').querySelectorAll('.star');
    const reviewRatingInput = document.getElementById('reviewRating');
    const reviewsContainer = document.getElementById('reviewsContainer');
    
    // Загружаем отзывы при старте
    loadReviews();
    
    // Обработчики событий
    addReviewBtn.addEventListener('click', function() {
        reviewForm.style.display = 'block';
        addReviewBtn.style.display = 'none';
    });
    
    cancelReviewBtn.addEventListener('click', function() {
        reviewForm.style.display = 'none';
        addReviewBtn.style.display = 'block';
        newReviewForm.reset();
        resetStars();
    });
    
    // Выбор рейтинга звездами
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            reviewRatingInput.value = value;
            
            ratingStars.forEach((s, index) => {
                if (index < value) {
                    s.classList.add('selected');
                } else {
                    s.classList.remove('selected');
                }
            });
        });
    });
    
    // Отправка формы
    newReviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const authorName = document.getElementById('authorName').value.trim();
        const rating = document.getElementById('reviewRating').value;
        const reviewText = document.getElementById('reviewText').value.trim();
        
        if (rating === "0") {
            alert('Пожалуйста, выберите оценку');
            return;
        }
        
        if (!authorName || !reviewText) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        // Получаем выбранные плюсы
        const prosCheckboxes = document.querySelectorAll('.pros-checkboxes input[type="checkbox"]:checked');
        const selectedPros = Array.from(prosCheckboxes).map(cb => cb.value);
        
        // Создаем новый отзыв
        const newReview = {
            id: Date.now(), // Используем timestamp как уникальный ID
            author: authorName,
            rating: parseFloat(rating),
            text: reviewText,
            pros: selectedPros,
            date: new Date().toISOString()
        };
        
        // Добавляем отзыв и сохраняем
        addReview(newReview);
        
        // Сбрасываем форму
        newReviewForm.reset();
        resetStars();
        reviewForm.style.display = 'none';
        addReviewBtn.style.display = 'block';
    });
    
    // Функция загрузки отзывов из localStorage
    function loadReviews() {
        const savedReviews = localStorage.getItem(STORAGE_KEY);
        if (savedReviews) {
            const reviews = JSON.parse(savedReviews);
            renderReviews(reviews);
        } else {
            // Если нет сохраненных отзывов, показываем заглушку
            reviewsContainer.innerHTML = '<div class="no-reviews">Пока нет отзывов. Будьте первым!</div>';
        }
    }
    
    // Функция добавления нового отзыва
    function addReview(review) {
        // Получаем текущие отзывы
        const savedReviews = localStorage.getItem(STORAGE_KEY);
        let reviews = [];
        
        if (savedReviews) {
            reviews = JSON.parse(savedReviews);
        }
        
        // Добавляем новый отзыв
        reviews.push(review);
        
        // Сохраняем обновленный список
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
        
        // Перерисовываем отзывы
        renderReviews(reviews);
    }
    
    // Функция отрисовки всех отзывов
    function renderReviews(reviews) {
        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<div class="no-reviews">Пока нет отзывов. Будьте первым!</div>';
            updateRatingStats();
            return;
        }
        
        // Сортируем отзывы по дате (новые сначала)
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let reviewsHTML = '';
        
        reviews.forEach(review => {
            const date = new Date(review.date);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const dateString = `${month}.${year}`;
            
            // Создаем HTML для плюсов, если они есть
            let prosHTML = '';
            if (review.pros && review.pros.length > 0) {
                prosHTML = `
                    <div class="review-pros">
                        <div class="pros-title">Плюсы продукции:</div>
                        <div class="pros-list">
                            ${review.pros.map(pro => `<div class="pros-item">${pro}</div>`).join('')}
                        </div>
                    </div>
                `;
            }
            
            reviewsHTML += `
                <div class="review" data-id="${review.id}">
                    <div class="review-rating">${review.rating.toFixed(1).replace('.', ',')}</div>
                    <div class="review-title">Общая оценка</div>
                    
                    <div class="review-author">
                        <div class="author-name">${review.author}</div>
                        <div class="review-date">${dateString}</div>
                    </div>
                    
                    <div class="review-text">${review.text.replace(/\n/g, '<br>')}</div>
                    ${prosHTML}
                </div>
                <div class="divider"></div>
            `;
        });
        
        reviewsContainer.innerHTML = reviewsHTML;
        updateRatingStats();
    }
    
    // Функция сброса звезд рейтинга
    function resetStars() {
        ratingStars.forEach(star => {
            star.classList.remove('selected');
        });
        reviewRatingInput.value = "0";
    }
    
    // Функция обновления статистики рейтинга
    function updateRatingStats() {
        const ratingElements = document.querySelectorAll('.review-rating');
        let totalRating = 0;
        let reviewCount = ratingElements.length;
        
        ratingElements.forEach(element => {
            const ratingText = element.textContent.replace(',', '.');
            const rating = parseFloat(ratingText);
            totalRating += rating;
        });
        
        const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
        const formattedAverage = averageRating.toFixed(1).replace('.', ',');
        
        document.getElementById('averageRating').textContent = formattedAverage;
        document.getElementById('reviewsCount').textContent = 
            reviewCount + ' ' + getReviewsWordForm(reviewCount);
    }
    
    // Функция для правильного склонения слова "отзыв"
    function getReviewsWordForm(number) {
        const lastDigit = number % 10;
        const lastTwoDigits = number % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return 'отзывов';
        }
        
        if (lastDigit === 1) {
            return 'отзыв';
        }
        
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'отзыва';
        }
        
        return 'отзывов';
    }
});

//localStorage.removeItem('product_reviews');