
// ========================================
// AUTOPARTS — ОСНОВНАЯ ЛОГИКА
// ========================================


// Получение элементов страницы

const themeToggle = document.getElementById("theme-toggle");
const menuToggle = document.getElementById("menu-toggle");
const navigation = document.getElementById("navigation");
const featuredProducts = document.getElementById("featured-products");
const cartCount = document.getElementById("cart-count");


// ========================================
// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
// ========================================

function applyTheme(theme) {
    document.body.classList.toggle(
        "light-theme",
        theme === "light"
    );

    if (themeToggle) {
        themeToggle.textContent =
            theme === "light" ? "☾" : "☀";
    }
}

// Загружаем сохранённую тему

const savedTheme = localStorage.getItem("autoparts-theme") || "dark";

applyTheme(savedTheme);

// Обработчик переключения темы

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isLight =
            document.body.classList.contains("light-theme");

        const newTheme = isLight ? "dark" : "light";

        localStorage.setItem("autoparts-theme", newTheme);

        applyTheme(newTheme);
    });
}


// ========================================
// МОБИЛЬНАЯ НАВИГАЦИЯ
// ========================================

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
        navigation.classList.toggle("active");
    });
}


// ========================================
// КОРЗИНА
// ========================================

function getCart() {
    return JSON.parse(localStorage.getItem("autoparts-cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem(
        "autoparts-cart",
        JSON.stringify(cart)
    );

    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();

    const total = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    if (cartCount) {
        cartCount.textContent = total;
    }
}

// Добавление товара в корзину

function addToCart(productId) {
    const cart = getCart();

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveCart(cart);

    showToast("Товар добавлен в корзину");
}

// Отображение уведомления

function showToast(message) {
    let toast = document.querySelector(".toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";

        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");

        document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// ========================================
// ОТОБРАЖЕНИЕ ТОВАРОВ
// ========================================

function renderFeaturedProducts() {
    if (!featuredProducts || typeof PRODUCTS === "undefined") {
        return;
    }

    featuredProducts.innerHTML = PRODUCTS.map(product => `
        <article class="product-card">

            <div class="product-image">
                ${product.icon}
            </div>

            <div class="product-info">

                <span class="product-category">
                    ${product.category}
                </span>

                <h3>${product.name}</h3>

                <p class="product-description">
                    ${product.description}
                </p>

                <div class="product-price">
                    ${product.price.toLocaleString("ru-RU")} ₽
                </div>

                <button
                    class="btn btn-primary add-to-cart"
                    data-id="${product.id}">
                    В корзину
                </button>

            </div>

        </article>
    `).join("");

    // Обработчики кнопок добавления в корзину

    featuredProducts.querySelectorAll(".add-to-cart")
        .forEach(button => {
            button.addEventListener("click", () => {
                addToCart(Number(button.dataset.id));
            });
        });
}


// ========================================
// ПОИСК ТОВАРОВ
// ========================================

const searchForm = document.getElementById("search-form");

if (searchForm) {
    searchForm.addEventListener("submit", event => {
        event.preventDefault();

        const searchInput =
            document.getElementById("search-input");

        const query = searchInput.value.trim();

        if (query) {
            window.location.href =
                `catalog.html?search=${encodeURIComponent(query)}`;
        }
    });
}


// ========================================
// ИНИЦИАЛИЗАЦИЯ
// ========================================

renderFeaturedProducts();
updateCartCount();
