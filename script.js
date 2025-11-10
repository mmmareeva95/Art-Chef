// Основное приложение
class SweetArtApp {
    constructor() {
        this.desserts = desserts;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupPortfolio();
        this.setupForm();
        this.setupScrollEffects();
        this.setupServiceCardButtons();
    }
    
    // Навигация
    setupNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav__link');
        const header = document.querySelector('.header');
        
        // Проверка существования критических элементов
        if (!navToggle || !navMenu || !header) {
            console.error('Не найдены необходимые элементы навигации');
            return;
        }

        let lastScrollY = window.scrollY;
        let isScrolling;

        // Mobile menu toggle
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Header scroll effect - скрытие/показ хедера
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Эффект scrolled для фона
            if (currentScrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Скрытие/показание хедера при скролле (только для десктопа)
            if (window.innerWidth > 768) {
                // Прячем хедер при скролле вниз
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    header.classList.add('hidden');
                } 
                // Показываем хедер при скролле вверх
                else if (currentScrollY < lastScrollY) {
                    header.classList.remove('hidden');
                }
                
                // Автоматически показываем хедер когда доскроллили до верха
                if (currentScrollY <= 100) {
                    header.classList.remove('hidden');
                }
            }

            lastScrollY = currentScrollY;
            
            // Очищаем таймер скролла
            clearTimeout(isScrolling);

            // Когда скролл остановился, показываем хедер
            isScrolling = setTimeout(() => {
                if (window.innerWidth > 768 && currentScrollY > 100) {
                    header.classList.remove('hidden');
                }
            }, 150);
        };

        // Используем throttling для оптимизации скролла
        let isThrottled = false;
        const throttledScroll = () => {
            if (!isThrottled) {
                handleScroll();
                isThrottled = true;
                setTimeout(() => {
                    isThrottled = false;
                }, 100);
            }
        };

        window.addEventListener('scroll', throttledScroll);

        // Показываем хедер при наведении (только для десктопа)
        if (window.innerWidth > 768) {
            header.addEventListener('mouseenter', () => {
                header.classList.remove('hidden');
            });
        }

        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            // При переходе на мобильную версию убираем скрытие хедера
            if (window.innerWidth <= 768) {
                header.classList.remove('hidden');
            }
        });

        // Active navigation on scroll
        this.setupActiveNavigation();
    }

    setupActiveNavigation() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav__link');

        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-100px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${currentId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // Портфолио
    setupPortfolio() {
        const portfolioGrid = document.getElementById('portfolio-grid');
        const filterButtons = document.querySelectorAll('.filter-btn');

        if (!portfolioGrid) return;

        this.renderPortfolio(this.desserts);

        // Filter functionality
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter items
                const filter = button.dataset.filter;
                if (filter === 'all') {
                    this.renderPortfolio(this.desserts);
                } else {
                    const filteredItems = this.desserts.filter(item => item.category === filter);
                    this.renderPortfolio(filteredItems);
                }
            });
        });
    }

    renderPortfolio(items) {
        const portfolioGrid = document.getElementById('portfolio-grid');
        if (!portfolioGrid) return;

        portfolioGrid.innerHTML = items.map(item => `
            <div class="portfolio-item" data-category="${item.category}">
                <div class="portfolio-item__image">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="portfolio-item__overlay">
                        <button class="btn btn--primary view-details" data-id="${item.id}">
                            Подробнее
                        </button>
                    </div>
                </div>
                <div class="portfolio-item__content">
                    <span class="portfolio-item__category">${this.getCategoryName(item.category)}</span>
                    <h3 class="portfolio-item__title">${item.name}</h3>
                    <p class="portfolio-item__price">${item.price}</p>
                </div>
            </div>
        `).join('');

        // Add event listeners to view buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(button.dataset.id);
                this.showItemDetails(id);
            });
        });

        // Add click event to entire portfolio item
        document.querySelectorAll('.portfolio-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.querySelector('.view-details').dataset.id);
                this.showItemDetails(id);
            });
        });
    }

    getCategoryName(category) {
        const categories = {
            'wedding': 'Свадебные',
            'kids': 'Детские',
            'cupcakes': 'Капкейки',
            'cakepops': 'Кейк-попсы'
        };
        return categories[category] || category;
    }

showItemDetails(id) {
    const item = this.desserts.find(d => d.id === id);
    if (!item) return;

    // Создаем кастомное модальное окно
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 30px rgba(46, 0, 0, 0.12);
            border: 1px solid #E8E8E8;
        ">
            <h3 style="
                color: #2E0000; 
                margin-bottom: 1rem;
                font-family: 'Playfair Display', serif;
                font-size: 1.5rem;
            ">${item.name}</h3>
            
            <p style="
                color: #A45B45; 
                font-weight: bold; 
                margin-bottom: 1rem;
                font-size: 1.125rem;
            ">${item.price}</p>
            
            <p style="
                color: #42170A; 
                line-height: 1.6; 
                margin-bottom: 1.5rem;
                font-size: 1rem;
            ">${item.description}</p>
            
            <p style="
                color: #666; 
                font-style: italic; 
                margin-bottom: 1.5rem;
                font-size: 0.9rem;
            ">Для заказа заполните форму на сайте!</p>
            
            <button id="close-modal-btn" style="
                background: linear-gradient(135deg, #A45B45, #42170A);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-family: inherit;
                font-weight: 500;
                transition: all 0.3s ease;
            ">
                Закрыть
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчик для кнопки закрыть
    const closeBtn = modal.querySelector('#close-modal-btn');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Добавляем hover эффекты для кнопки
    closeBtn.addEventListener('mouseover', () => {
        closeBtn.style.transform = 'translateY(-2px)';
        closeBtn.style.boxShadow = '0 4px 20px rgba(46, 0, 0, 0.2)';
    });
    
    closeBtn.addEventListener('mouseout', () => {
        closeBtn.style.transform = 'translateY(0)';
        closeBtn.style.boxShadow = 'none';
    });
    
    // Закрытие по клику на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Закрытие по ESC
    const closeModal = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeModal);
        }
    };
    document.addEventListener('keydown', closeModal);
    
    // Убираем обработчик при удалении модального окна
    modal.addEventListener('DOMNodeRemoved', () => {
        document.removeEventListener('keydown', closeModal);
    });
}

    // Кнопки в карточках услуг
    setupServiceCardButtons() {
        document.querySelectorAll('.service-card__btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                // Scroll to contact form
                document.getElementById('contact').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }

    // Форма
    setupForm() {
        const form = document.getElementById('order-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validateForm()) {
                this.submitForm();
            }
        });

        // Add real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('.form__input, .form__select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearError(input);
            });
        });
    }

    validateField(input) {
        const value = input.value.trim();
        
        switch(input.type) {
            case 'text':
                if (!value) {
                    this.showError(input, 'Пожалуйста, введите ваше имя');
                    return false;
                }
                break;
            case 'tel':
                if (!value) {
                    this.showError(input, 'Пожалуйста, введите ваш телефон');
                    return false;
                }
                break;
        }
        
        if (input.id === 'service' && !value) {
            this.showError(input, 'Пожалуйста, выберите услугу');
            return false;
        }
        
        return true;
    }

    validateForm() {
        let isValid = true;
        const fields = [
            document.getElementById('name'),
            document.getElementById('phone'),
            document.getElementById('service')
        ];
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    showError(input, message) {
        this.clearError(input);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form__error';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = '#A45B45';
    }

    clearError(input) {
        const errorDiv = input.parentNode.querySelector('.form__error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '';
    }

    submitForm() {
        const form = document.getElementById('order-form');
        const successMessage = document.getElementById('form-success');

        // Simulate form submission
        setTimeout(() => {
            form.reset();
            if (successMessage) {
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            }
        }, 1000);
    }

    // Scroll effects
    setupScrollEffects() {
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.portfolio-item, .service-card, .process-step, .feature').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
}

// Initialize the app
const app = new SweetArtApp();