
(async function () {


    async function onCartUpdate() {
        try {
            const res = await fetch("/cart.js", {
                headers: { Accept: "application/json" }
            });

            const cart = await res.json();
            console.log("vs_cart", cart);



        } catch (err) {
            console.error("Cart update failed:", err);
        }
    }

    const triggerCartUpdate = () => onCartUpdate();

    onCartUpdate();

    document.addEventListener("cart:updated", triggerCartUpdate);

    if (!window.__shippingBarPatched) {
        window.__shippingBarPatched = true;

        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            try {
                const url = typeof args[0] === "string"
                    ? args[0]
                    : args[0]?.url || "";

                if (/\/cart\/(add|change|update)/.test(url)) {
                    triggerCartUpdate();
                }
            } catch (e) { }

            return response;
        };

        const originalOpen = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener("load", () => {
                const url = typeof args[1] === "string" ? args[1] : "";

                if (/\/cart\/(add|change|update)/.test(url)) {
                    triggerCartUpdate();
                }
            });

            return originalOpen.apply(this, args);
        };
    }
})();

(async function () {
    async function onCartUpdate() {
        try {
            const res = await fetch("/cart.js", {
                headers: {
                    Accept: "application/json"
                }
            });

            const cart = await res.json();
            console.log("vs_cart", cart);

            const cartItems = cart?.items || [];
            const storeFrontItems = document.querySelectorAll(".cart__popup-item");

            storeFrontItems.forEach(storeFrontItem => {
                const pId = storeFrontItem.getAttribute("id");
                let dcDiscount = storeFrontItem.querySelector('.cart__popup-discount .dd-discount');

                cartItems.forEach(cartItem => {
                    const cartId = String(cartItem?.id);

                    if (String(pId) === cartId) {
                        const discounts = cartItem?.discounts || [];

                        discounts.forEach(discount => {
                            const updatedAmount = Number(discount?.amount || 0);
                            dcDiscount.textContent = updatedAmount

                            
                        });
                    }
                });
            });

        } catch (err) {
            console.error("Cart update failed:", err);
        }
    }

    const triggerCartUpdate = () => onCartUpdate();

    onCartUpdate();

    document.addEventListener("cart:updated", triggerCartUpdate);

    if (!window.__shippingBarPatched) {
        window.__shippingBarPatched = true;

        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            try {
                const url =
                    typeof args[0] === "string"
                        ? args[0]
                        : args[0]?.url || "";

                if (/\/cart\/(add|change|update)/.test(url)) {
                    triggerCartUpdate();
                }
            } catch (e) {}

            return response;
        };

        const originalOpen = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function (...args) {
            this.addEventListener("load", () => {
                const url = typeof args[1] === "string" ? args[1] : "";

                if (/\/cart\/(add|change|update)/.test(url)) {
                    triggerCartUpdate();
                }
            });

            return originalOpen.apply(this, args);
        };
    }
})();
