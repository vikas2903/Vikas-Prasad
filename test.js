
document.addEventListener('DOMContentLoaded', function () {
    const paired_form = document.getElementById('paired-product-form');

    if (!paired_form) return;

    paired_form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const main_product_id = paired_form.querySelector('[name="main_variant"]').value;
        const paired_product_id = paired_form.querySelector('[name="paired_variant"]').value;
        const quantity = parseInt(paired_form.querySelector('[name="quantity"]').value, 10);

        const button = paired_form.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;


        button.disabled = true;
        button.innerHTML = 'Adding...';

        try {
            const response = await fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    items: [
                        {
                            id: Number(main_product_id),
                            quantity: quantity
                        },
                        {
                            id: Number(paired_product_id),
                            quantity: quantity
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.description || 'Failed to add products to cart');
            }

            const data = await response.json();

            button.innerHTML = 'Added to Cart';

            window.location.href = '/cart';

        } catch (err) {
            console.error(err);

            button.disabled = false;
            button.innerHTML = originalText;

            alert(err.message);
        }
    });


    async function checkPairedProducts(){
        const response = await fetch('/cart.js');
        const cartData = await response.json();
        
         cartData.items.forEach( async function(item){
            const bundleId = item.properties && item.properties._bundle_id;
            if(!bundleId) return;
            console.log('Bundle ID found in cart item:', bundleId);
         })
    }
});

