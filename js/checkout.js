
const checkoutForm = document.getElementById("checkout-form");
const checkoutLayout = document.getElementById("checkout-layout");
const checkoutEmpty = document.getElementById("checkout-empty");
const checkoutSuccess = document.getElementById("checkout-success");

const checkoutItems = document.getElementById("checkout-items");
const checkoutSubtotal = document.getElementById("checkout-subtotal");
const checkoutDelivery = document.getElementById("checkout-delivery");
const checkoutTotal = document.getElementById("checkout-total");

const deliveryMethod = document.getElementById("delivery-method");
const addressGroup = document.getElementById("address-group");
const addressInput = document.getElementById("customer-address");

const DELIVERY_PRICE = 500;

// Получение корзины
function getCheckoutCart() {
    try {
        const cart = JSON.parse(
            localStorage.getItem("autoparts-cart") || "[]"
        );

        if (!Array.isArray(cart)) {
            return [];
        }

        return cart.map(item => {
            const product = PRODUCTS.find(
                product => product.id === Number(item.id)
            );

            const quantity = Math.floor(Number(item.quantity));

            if (!product || !Number.isFinite(quantity) ||
                quantity < 1 || quantity > 99) {
                return null;
            }

            return {
                id: product.id,
                quantity,
                product
            };
        }).filter(Boolean);

    } catch (error) {
        console.error("Ошибка чтения корзины:", error);
        return [];
    }
}

// Форматирование цены
function formatCheckoutPrice(price) {
    return `${price.toLocaleString("ru-RU")} ₽`;
}

// Экранирование текста
function escapeCheckoutHTML(value) {
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

// Расчёт стоимости товаров
function calculateSubtotal(cart) {
    return cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );
}

// Обновление способа доставки
function updateDeliveryFields() {
    const isPickup = deliveryMethod.value === "pickup";

    addressGroup.hidden = isPickup;
    addressInput.required = !isPickup;

    renderCheckoutSummary();
}

// Отображение состава заказа
function renderCheckoutSummary() {
    const cart = getCheckoutCart();

    const subtotal = calculateSubtotal(cart);
    const delivery = deliveryMethod.value === "pickup"
        ? 0
        : DELIVERY_PRICE;

    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span class="checkout-item-name">
                ${escapeCheckoutHTML(item.product.name)}
                × ${item.quantity}
            </span>

            <span class="checkout-item-price">
                ${formatCheckoutPrice(
                    item.product.price * item.quantity
                )}
            </span>
        </div>
    `).join("");

    checkoutSubtotal.textContent = formatCheckoutPrice(subtotal);
    checkoutDelivery.textContent = formatCheckoutPrice(delivery);
    checkoutTotal.textContent = formatCheckoutPrice(subtotal + delivery);
}

// Инициализация страницы
function initCheckout() {
    const cart = getCheckoutCart();

    if (cart.length === 0) {
        checkoutLayout.hidden = true;
        checkoutEmpty.hidden = false;
        return;
    }

    checkoutLayout.hidden = false;
    checkoutEmpty.hidden = true;

    updateDeliveryFields();
}

// Обработка изменения доставки
deliveryMethod.addEventListener("change", updateDeliveryFields);

// Оформление заказа
checkoutForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!checkoutForm.reportValidity()) {
        return;
    }

    const cart = getCheckoutCart();

    if (cart.length === 0) {
        checkoutLayout.hidden = true;
        checkoutEmpty.hidden = false;
        return;
    }

    const formData = new FormData(checkoutForm);

    const subtotal = calculateSubtotal(cart);

    const delivery = deliveryMethod.value === "pickup"
        ? 0
        : DELIVERY_PRICE;

    const order = {
        id: `AP-${Date.now()}`,
        date: new Date().toISOString(),

        customer: {
            name: formData.get("name").trim(),
            phone: formData.get("phone").trim(),
            email: formData.get("email").trim()
        },

        delivery: {
            method: formData.get("delivery"),
            address: formData.get("address").trim()
        },

        payment: formData.get("payment"),

        items: cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
        })),

        subtotal,
        deliveryPrice: delivery,
        total: subtotal + delivery
    };

    // Сохраняем демонстрационный заказ
    const orders = JSON.parse(
        localStorage.getItem("autoparts-orders") || "[]"
    );

    orders.push(order);

    localStorage.setItem(
        "autoparts-orders",
        JSON.stringify(orders)
    );

    // Очищаем корзину
    localStorage.setItem("autoparts-cart", "[]");

    if (typeof updateCartCount === "function") {
        updateCartCount();
    }

    // Показываем подтверждение
    checkoutLayout.hidden = true;
    checkoutSuccess.hidden = false;

    document.getElementById("success-order-number").textContent =
        `Номер вашего заказа: ${order.id}`;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// Запуск
initCheckout();
