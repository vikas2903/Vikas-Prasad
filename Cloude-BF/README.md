# Black Friday sale section — install guide

## What to install

`bf-landing.liquid` is the complete, standalone Shopify section. It includes its product cards, quick view, cart drawer, filters, countdown and live-sale offer status. It does **not** require the old `black-friday.liquid` layout or `bf-card.liquid` snippet.

1. In Shopify, go to **Online Store → Themes → Edit code → Sections → Add a new section**.
2. Name it `bf-landing`, then replace its contents with `bf-landing.liquid` from this folder.
3. Create a page template and add the section in the theme editor. You can use `page.black-friday.json` as the template file; it now uses your normal theme layout.
4. Assign that template to the Black Friday page and choose its collections, images and sale settings in the editor.

The section’s own header and footer are off by default, avoiding duplicates with your theme header/footer. Turn either on in **Page integration** only if the page is intentionally running without the corresponding theme element.

## Dynamic Black Friday offers

The section includes editable offer cards for:

- Buy 2, get 1 free
- Buy 3 for ₹999
- Buy 2, get 20% off

Their progress updates from the actual cart item count whenever a customer adds, removes or changes an item. In the section settings you can turn each offer on or off, change its copy and set how many eligible items are needed.

Create matching **automatic discounts** in **Shopify Admin → Discounts**. Theme code can show accurate cart progress, but Shopify Admin is what securely applies the actual discount and controls eligible products, lowest-price-item logic and whether the three discounts can combine.

Test on a duplicate theme before publishing: add eligible products, open the cart, alter quantities, and confirm Shopify applies the discount exactly as configured.
