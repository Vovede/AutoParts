const PRODUCTS = [
    {
        id: 1,
        name: "Тормозные колодки Bosch",
        category: "Тормозная система",
        categoryKey: "brakes",
        brand: "Bosch",
        description: "Комплект передних тормозных колодок.",
        price: 4500,
        icon: "◉"
    },
    {
        id: 2,
        name: "Масляный фильтр Mann",
        category: "Фильтры",
        categoryKey: "filters",
        brand: "Mann",
        description: "Фильтр для эффективной очистки моторного масла.",
        price: 1200,
        icon: "▤"
    },
    {
        id: 3,
        name: "Амортизатор KYB",
        category: "Подвеска",
        categoryKey: "suspension",
        brand: "KYB",
        description: "Газомасляный амортизатор подвески.",
        price: 6800,
        icon: "↕"
    },
    {
        id: 4,
        name: "Свечи зажигания NGK",
        category: "Двигатель",
        categoryKey: "engine",
        brand: "NGK",
        description: "Комплект свечей для бензинового двигателя.",
        price: 2100,
        icon: "⚡"
    },
    {
        id: 5,
        name: "Воздушный фильтр Bosch",
        category: "Фильтры",
        categoryKey: "filters",
        brand: "Bosch",
        description: "Воздушный фильтр для системы впуска.",
        price: 950,
        icon: "▤"
    },
    {
        id: 6,
        name: "Тормозной диск Brembo",
        category: "Тормозная система",
        categoryKey: "brakes",
        brand: "Brembo",
        description: "Вентилируемый тормозной диск.",
        price: 5200,
        icon: "◉"
    },
    {
        id: 7,
        name: "Ремень ГРМ Gates",
        category: "Двигатель",
        categoryKey: "engine",
        brand: "Gates",
        description: "Ремень газораспределительного механизма.",
        price: 3400,
        icon: "⚙"
    },
    {
        id: 8,
        name: "Стойка стабилизатора Lemforder",
        category: "Подвеска",
        categoryKey: "suspension",
        brand: "Lemforder",
        description: "Стойка стабилизатора поперечной устойчивости.",
        price: 1800,
        icon: "↕"
    }
];

// Получаем элементы страницы
const productDetails = document.getElementById("product-details");
const productNotFound = document.getElementById("product-not-found");
const breadcrumbName = document.getElementById("breadcrumb-name");

// Получаем ID товара из адресной строки
const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));

// Находим товар в общем массиве
const product = PRODUCTS.find(item => item.id === productId);

// Экранирование текста
function escapeProductHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
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

// Отображение товара
function renderProduct() {
    if (!product) {
        productDetails.hidden = true;
        productNotFound.hidden = false;
        return;
    }

    breadcrumbName.textContent = product.name;
    document.title = `${product.name} | AutoParts`;

    productDetails.innerHTML = `
        <div class="product-details-layout">

            <div class="product-main-image">
                <span>${escapeProductHTML(product.icon)}</span>
            </div>

            <div class="product-detail-info">

                <p class="product-detail-category">
                    ${escapeProductHTML(product.category)}
                </p>

                <h1>${escapeProductHTML(product.name)}</h1>

                <p class="product-detail-description">
                    ${escapeProductHTML(product.description)}
                </p>

                <p class="product-detail-brand">
                    Производитель:
                    <strong>${escapeProductHTML(product.brand)}</strong>
                </p>

                <p class="product-detail-price">
                    ${product.price.toLocaleString("ru-RU")} ₽
                </p>

                <div class="product-purchase">

                    <div class="product-quantity">
                        <button type="button" id="quantity-minus"
                                aria-label="Уменьшить количество">−</button>

                        <input type="number" id="product-quantity"
                               value="1" min="1" max="99"
                               aria-label="Количество товаров">

                        <button type="button" id="quantity-plus"
                                aria-label="Увеличить количество">+</button>
                    </div>

                    <button type="button" class="product-detail-add"
                            id="product-add">
                        Добавить в корзину
                    </button>

                </div>

            </div>
        </div>
    `;

    setupProductControls();
}

// Управление количеством и корзиной
function setupProductControls() {
    const quantityInput = document.getElementById("product-quantity");
    const minusButton = document.getElementById("quantity-minus");
    const plusButton = document.getElementById("quantity-plus");
    const addButton = document.getElementById("product-add");

    minusButton.addEventListener("click", () => {
        const quantity = Number(quantityInput.value) || 1;
        quantityInput.value = Math.max(1, quantity - 1);
    });

    plusButton.addEventListener("click", () => {
        const quantity = Number(quantityInput.value) || 1;
        quantityInput.value = Math.min(99, quantity + 1);
    });

    quantityInput.addEventListener("change", () => {
        let quantity = Number(quantityInput.value);

        if (!Number.isFinite(quantity)) {
            quantity = 1;
        }

        quantity = Math.floor(quantity);
        quantityInput.value = Math.max(1, Math.min(99, quantity));
    });

    addButton.addEventListener("click", () => {
        const quantity = Math.max(
            1,
            Math.min(99, Math.floor(Number(quantityInput.value) || 1))
        );

        // Добавляем выбранное количество товара
        const cart = JSON.parse(
            localStorage.getItem("autoparts-cart") || "[]"
        );

        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                quantity: quantity
            });
        }

        localStorage.setItem("autoparts-cart", JSON.stringify(cart));

        // Обновляем счётчик корзины
        if (typeof updateCartCount === "function") {
            updateCartCount();
        }

        // Показываем уведомление
        if (typeof showToast === "function") {
            showToast(`Добавлено в корзину: ${quantity} шт.`);
        }
    });
}

// Запускаем отображение
renderProduct();
