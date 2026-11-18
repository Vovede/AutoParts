
const cartItemsContainer = document.getElementById("cart-items");
const cartLayout = document.getElementById("cart-layout");
const cartEmpty = document.getElementById("cart-empty");

const summaryQuantity = document.getElementById("summary-quantity");
const summarySubtotal = document.getElementById("summary-subtotal");
const summaryTotal = document.getElementById("summary-total");

const clearCartButton = document.getElementById("clear-cart");

// Получение корзины
function getCartItems() {
    try {
        const cart = JSON.parse(
            localStorage.getItem("autoparts-cart") || "[]"
        );

        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error("Ошибка чтения корзины:", error);
        return [];
    }
}

// Сохранение корзины
function saveCartItems(cart) {
    localStorage.setItem("autoparts-cart", JSON.stringify(cart));

    if (typeof updateCartCount === "function") {
        updateCartCount();
    }
}

// Форматирование цены
function formatPrice(price) {
    return `${price.toLocaleString("ru-RU")} ₽`;
}

// Безопасное отображение текста
function escapeCartHTML(value) {
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

// Обновление корзины
function renderCart() {
    const cart = getCartItems();

    // Находим существующие товары
    const validItems = cart.map(item => {
        const product = PRODUCTS.find(
            product => product.id === Number(item.id)
        );

        if (!product) {
            return null;
        }

        return {
            product,
            quantity: Math.max(
                1,
                Math.min(99, Math.floor(Number(item.quantity) || 1))
            )
        };
    }).filter(Boolean);

    const totalQuantity = validItems.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    const totalPrice = validItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity, 0
    );

    // Если корзина пуста
    if (validItems.length === 0) {
        cartLayout.hidden = true;
        cartEmpty.hidden = false;
        cartItemsContainer.innerHTML = "";

        summaryQuantity.textContent = "0";
        summarySubtotal.textContent = "0 ₽";
        summaryTotal.textContent = "0 ₽";

        saveCartItems([]);
        return;
    }

    cartLayout.hidden = false;
    cartEmpty.hidden = true;

    cartItemsContainer.innerHTML = validItems.map(item => `
        <article class="cart-item">
            <div class="cart-item-image">
                ${escapeCartHTML(item.product.icon)}
            </div>

            <div class="cart-item-info">
                <p class="cart-item-category">
                    ${escapeCartHTML(item.product.category)}
                </p>

                <h3 class="cart-item-name">
                    ${escapeCartHTML(item.product.name)}
                </h3>

                <p class="cart-item-price">
                    ${formatPrice(item.product.price)} за шт.
                </p>
            </div>

            <div class="cart-item-controls">
                <div class="cart-quantity">
                    <button type="button" data-action="decrease"
                            data-id="${item.product.id}"
                            aria-label="Уменьшить количество">−</button>

                    <span>${item.quantity}</span>

                    <button type="button" data-action="increase"
                            data-id="${item.product.id}"
                            aria-label="Увеличить количество">+</button>
                </div>

                <span class="cart-item-total">
                    ${formatPrice(item.product.price * item.quantity)}
                </span>

                <button type="button" class="remove-item"
                        data-action="remove"
                        data-id="${item.product.id}">
                    Удалить
                </button>
            </div>
        </article>
    `).join("");

    summaryQuantity.textContent = totalQuantity;
    summarySubtotal.textContent = formatPrice(totalPrice);
    summaryTotal.textContent = formatPrice(totalPrice);

    // Сохраняем нормализованные данные
    saveCartItems(validItems.map(item => ({
        id: item.product.id,
        quantity: item.quantity
    })));
}

// Изменение количества и удаление
cartItemsContainer.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.id);
    const action = button.dataset.action;

    let cart = getCartItems();

    if (action === "remove") {
        cart = cart.filter(item => Number(item.id) !== productId);
    }

    if (action === "increase") {
        const item = cart.find(
            item => Number(item.id) === productId
        );

        if (item && item.quantity < 99) {
            item.quantity++;
        }
    }

    if (action === "decrease") {
        const item = cart.find(
            item => Number(item.id) === productId
        );

        if (item) {
            item.quantity--;

            if (item.quantity <= 0) {
                cart = cart.filter(
                    item => Number(item.id) !== productId
                );
            }
        }
    }

    saveCartItems(cart);
    renderCart();
});

// Очистка корзины
clearCartButton.addEventListener("click", () => {
    saveCartItems([]);
    renderCart();
});

// Первоначальное отображение
renderCart();
