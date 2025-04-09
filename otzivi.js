document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');
    let currentIndex = 0;
    
    // Функция для обновления слайдера
    function updateSlider(index) {
        // Удаляем активные классы у всех элементов
        cards.forEach(card => card.classList.remove('active', 'prev', 'next'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Обновляем текущий слайд
        currentIndex = index;
        cards[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
        
        // Обновляем соседние слайды для анимации
        if (cards[currentIndex - 1]) {
            cards[currentIndex - 1].classList.add('prev');
        }
        if (cards[currentIndex + 1]) {
            cards[currentIndex + 1].classList.add('next');
        }
    }
    
    // Навигация по точкам
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            updateSlider(index);
        });
    });
    
    // Кнопка "Назад"
    prevBtn.addEventListener('click', function() {
        const newIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
        updateSlider(newIndex);
    });
    
    // Кнопка "Вперед"
    nextBtn.addEventListener('click', function() {
        const newIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
        updateSlider(newIndex);
    });
    
    // Автопрокрутка
    let autoSlide = setInterval(() => {
        const newIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
        updateSlider(newIndex);
    }, 5000);
    
    // Остановка автопрокрутки при наведении
    const sliderContainer = document.querySelector('.testimonials-container');
    sliderContainer.addEventListener('mouseenter', () => {
        clearInterval(autoSlide);
    });
    
    sliderContainer.addEventListener('mouseleave', () => {
        autoSlide = setInterval(() => {
            const newIndex = currentIndex === cards.length - 1 ? 0 : currentIndex + 1;
            updateSlider(newIndex);
        }, 5000);
    });
});