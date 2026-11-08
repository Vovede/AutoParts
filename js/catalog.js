
// Элементы страницы
const catalogProducts = document.getElementById("catalog-products");
const catalogSearch = document.getElementById("catalog-search");
const catalogSort = document.getElementById("catalog-sort");
const productsCount = document.getElementById("products-count");
const catalogEmpty = document.getElementById("catalog-empty");
const resetFiltersButton = document.getElementById("reset-filters");

// Текущие параметры каталога
let catalogItems = [];
let selectedCategory = "all";
let searchQuery = "";
let sortOrder = "default";

// Имитация загрузки товаров с сервера
async function loadProducts() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(PRODUCTS);
        }, 400);
    });
}

// Защита текста при добавлении в HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

// Получение выбранной категории
function getSelectedCategory() {
    const selected = document.querySelector(
        'input[name="category"]:checked'
    );

    return selected ? selected.value : "all";
}

// Фильтрация и сортировка товаров
function getFilteredProducts() {
    let result = [...catalogItems];

    // Фильтр по категории
    if (selectedCategory !== "all") {
        result = result.filter(
            product => product.categoryKey === selectedCategory
        );
    }

    // Поиск по названию и бренду
    if (searchQuery) {
        result = result.filter(product => {
            const searchableText =
                `${product.name} ${product.brand} ${product.category}`
                    .toLowerCase();

            return searchableText.includes(searchQuery);
        });
    }

    // Сортировка
    switch (sortOrder) {
        case "price-asc":
            result.sort((a, b) => a.price - b.price);
            break;

        case "price-desc":
            result.sort((a, b) => b.price - a.price);
            break;

        case "name-asc":
            result.sort((a, b) =>
                a.name.localeCompare(b.name, "ru")
            );
            break;
    }

    return result;
}

// Отображение товаров
function renderCatalogProducts() {
    const products = getFilteredProducts();

    productsCount.textContent =
        `Найдено товаров: ${products.length}`;

    catalogEmpty.hidden = products.length !== 0;
    catalogProducts.hidden = products.length === 0;

    catalogProducts.innerHTML = products.map(product => `
        <article class="product-card">
            <div class="product-image">
                <span>${escapeHTML(product.icon)}</span>
            </div>

            <div class="product-info">
                <p class="product-category">
                    ${escapeHTML(product.category)}
                </p>

                <h3 class="product-name">
                    ${escapeHTML(product.name)}
                </h3>

                <p class="product-description">
                    ${escapeHTML(product.description)}
                </p>

                <div class="product-footer">
                    <span class="product-price">
                        ${product.price.toLocaleString("ru-RU")} ₽
                    </span>

                    <button
                        class="add-to-cart"
                        data-product-id="${product.id}"
                        type="button"
                    >
                        В корзину
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

// Обработка поиска
catalogSearch.addEventListener("input", () => {
    searchQuery = catalogSearch.value.trim().toLowerCase();
    renderCatalogProducts();
});

// Обработка фильтров
document.querySelectorAll('input[name="category"]')
    .forEach(input => {
        input.addEventListener("change", () => {
            selectedCategory = getSelectedCategory();
            renderCatalogProducts();
        });
    });

// Обработка сортировки
catalogSort.addEventListener("change", () => {
    sortOrder = catalogSort.value;
    renderCatalogProducts();
});

// Сброс фильтров
resetFiltersButton.addEventListener("click", () => {
    catalogSearch.value = "";
    catalogSort.value = "default";

    document.querySelector(
        'input[name="category"][value="all"]'
    ).checked = true;

    selectedCategory = "all";
    searchQuery = "";
    sortOrder = "default";

    renderCatalogProducts();
});

// Добавление товара в корзину
catalogProducts.addEventListener("click", event => {
    const button = event.target.closest(".add-to-cart");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.productId);
    addToCart(productId);
});

// Начальная загрузка каталога
async function initCatalog() {
    try {
        productsCount.textContent = "Загрузка товаров...";

        catalogItems = await loadProducts();

        // Чтение параметров из адресной строки
        const params = new URLSearchParams(window.location.search);

        const initialSearch = params.get("search") || "";
        const initialCategory = params.get("category") || "all";

        catalogSearch.value = initialSearch;
        searchQuery = initialSearch.trim().toLowerCase();

        const categoryInput = document.querySelector(
            `input[name="category"][value="${initialCategory}"]`
        );

        if (categoryInput) {
            categoryInput.checked = true;
            selectedCategory = initialCategory;
        }

        renderCatalogProducts();

    } catch (error) {
        console.error("Ошибка загрузки каталога:", error);
        productsCount.textContent = "Не удалось загрузить товары.";
    }
}

initCatalog();
