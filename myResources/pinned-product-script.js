



(function () {


  async function initPinnedProducts() {


    // Prevent script from running twice
    if (window.__pinnedProductsInitialized) return;
    window.__pinnedProductsInitialized = true;




    // =========================================================
    // SETTINGS
    // =========================================================


    const MAX_PAGE = 10;


    // Number of pages fetched simultaneously.
    // Higher = faster, but more requests at once.
    const BATCH_SIZE = 4;




    // =========================================================
    // CURRENT URL
    // =========================================================


    const currentPageUrl = new URL(window.location.href);
    const pinnedParam = currentPageUrl.searchParams.get("pinned");


    if (!pinnedParam) return;




    // =========================================================
    // CONVERT URL / VALUE TO PRODUCT HANDLE
    // =========================================================


    function getProductHandle(value) {


      if (!value) return "";


      let cleanedValue = value.trim();


      try {
        cleanedValue = decodeURIComponent(cleanedValue);
      } catch (e) {
        // Keep original value if decoding fails
      }


      cleanedValue = cleanedValue.replace(/\/+$/, "");




      // Full Shopify product URL
      if (cleanedValue.includes("/products/")) {


        cleanedValue = cleanedValue
          .split("/products/")
          .pop()
          .split("?")[0]
          .split("#")[0]
          .split("/")[0];


      } else {


        // Clean normal handle
        cleanedValue = cleanedValue
          .split("?")[0]
          .split("#")[0]
          .replace(/^\/+|\/+$/g, "");


      }


      return cleanedValue.trim();
    }




    // =========================================================
    // GET PINNED HANDLES
    // =========================================================


    const pinnedHandles = [
      ...new Set(
        pinnedParam
          .split(",")
          .map(getProductHandle)
          .filter(Boolean)
      )
    ];


    if (!pinnedHandles.length) return;


    const pinnedSet = new Set(pinnedHandles);




    // =========================================================
    // CLEAN URL
    // =========================================================


    const cleanedPinnedValue = pinnedHandles.join(",");


    if (pinnedParam !== cleanedPinnedValue) {


      currentPageUrl.searchParams.set(
        "pinned",
        cleanedPinnedValue
      );


      window.history.replaceState(
        {},
        "",
        currentPageUrl.toString()
      );
    }




    // =========================================================
    // FIND PRODUCT GRID
    // =========================================================


    const productGrid =
      document.querySelector(".collection__products .grid") ||
      document.querySelector(".product-collection") ||
      document.querySelector(".product-grid");


    if (!productGrid) {
      console.warn("Pinned Products: Product grid not found.");
      return;
    }




    // =========================================================
    // PRODUCT CARD SELECTOR
    // =========================================================


    const cardSelector =
      ".grid__item, " +
      ".product-grid__item, " +
      ".collection-product-card, " +
      ".grid-item, " +
      "li";




    // =========================================================
    // FOUND PRODUCTS STORAGE
    // =========================================================


    const foundCards = new Map();




    // =========================================================
    // EXTRACT HANDLE FROM PRODUCT LINK
    // =========================================================


    function getHandleFromHref(href) {


      if (!href || !href.includes("/products/")) {
        return "";
      }


      try {


        return decodeURIComponent(
          href
            .split("/products/")
            .pop()
            .split("?")[0]
            .split("#")[0]
            .split("/")[0]
        );


      } catch (e) {


        return href
          .split("/products/")
          .pop()
          .split("?")[0]
          .split("#")[0]
          .split("/")[0];


      }
    }




    // =========================================================
    // SCAN DOCUMENT
    //
    // Important optimization:
    // Instead of searching document separately for every
    // pinned handle, we scan product links only once.
    // =========================================================


    function scanDocument(doc, isFetchedDocument = false) {


      const productLinks =
        doc.querySelectorAll('a[href*="/products/"]');


      for (const link of productLinks) {


        // Stop scanning once everything is found
        if (foundCards.size === pinnedHandles.length) {
          break;
        }


        const handle =
          getHandleFromHref(link.getAttribute("href"));


        if (!handle) continue;


        if (!pinnedSet.has(handle)) continue;


        if (foundCards.has(handle)) continue;




        const card = link.closest(cardSelector);


        if (!card) continue;




        // Import fetched card into current document
        const finalCard = isFetchedDocument
          ? document.importNode(card, true)
          : card;




        finalCard.setAttribute(
          "data-pinned-product",
          "true"
        );




        foundCards.set(
          handle,
          finalCard
        );
      }
    }




    // =========================================================
    // MOVE PINNED PRODUCTS TO TOP
    // =========================================================


    function movePinnedProductsToTop() {


      if (!foundCards.size) return;


      const fragment =
        document.createDocumentFragment();




      pinnedHandles.forEach((handle) => {


        const card = foundCards.get(handle);


        if (!card) return;


        card.setAttribute(
          "data-pinned-product",
          "true"
        );


        fragment.appendChild(card);


      });




      productGrid.prepend(fragment);
    }




    // =========================================================
    // STEP 1:
    // CHECK CURRENT PAGE IMMEDIATELY
    // =========================================================


    scanDocument(document, false);




    // Move current-page pinned products instantly
    movePinnedProductsToTop();




    // Everything already found
    if (foundCards.size === pinnedHandles.length) {
      return;
    }




    // =========================================================
    // BASE FETCH URL
    // =========================================================


    const baseFetchUrl =
      new URL(window.location.href);


    baseFetchUrl.searchParams.delete("pinned");
    baseFetchUrl.searchParams.delete("page");




    // =========================================================
    // FETCH SINGLE PAGE
    // =========================================================


    async function fetchCollectionPage(page) {


      const fetchUrl =
        new URL(baseFetchUrl.toString());


      fetchUrl.searchParams.set(
        "page",
        page
      );




      try {


        const response = await fetch(
          fetchUrl.toString(),
          {
            method: "GET",
            credentials: "same-origin",
            cache: "default"
          }
        );




        if (!response.ok) {
          return null;
        }




        const html =
          await response.text();




        const parser =
          new DOMParser();




        return parser.parseFromString(
          html,
          "text/html"
        );




      } catch (error) {


        console.warn(
          "Pinned product fetch failed:",
          page,
          error
        );


        return null;
      }
    }




    // =========================================================
    // CREATE PAGE LIST
    // =========================================================


    const pages = [];


    for (let page = 2; page <= MAX_PAGE; page++) {
      pages.push(page);
    }




    // =========================================================
    // FETCH IN PARALLEL BATCHES
    //
    // OLD:
    //
    // page 2
    // wait
    // page 3
    // wait
    // page 4
    // wait
    //
    //
    // NEW:
    //
    // page 2 + 3 + 4 + 5 together
    //
    // then only continue if product not found.
    // =========================================================


    for (
      let index = 0;
      index < pages.length;
      index += BATCH_SIZE
    ) {


      // Stop requesting pages when all products found
      if (foundCards.size === pinnedHandles.length) {
        break;
      }




      const batch =
        pages.slice(
          index,
          index + BATCH_SIZE
        );




      const results =
        await Promise.all(
          batch.map(fetchCollectionPage)
        );




      // =======================================================
      // SCAN FETCHED PAGES
      // =======================================================


      for (const doc of results) {


        if (!doc) continue;




        scanDocument(
          doc,
          true
        );




        if (
          foundCards.size ===
          pinnedHandles.length
        ) {
          break;
        }
      }




      // =======================================================
      // MOVE NEWLY FOUND CARDS IMMEDIATELY
      // =======================================================


      movePinnedProductsToTop();




      if (
        foundCards.size ===
        pinnedHandles.length
      ) {
        break;
      }


    }


  }




  // =========================================================
  // RUN
  // =========================================================


  if (document.readyState === "loading") {


    document.addEventListener(
      "DOMContentLoaded",
      initPinnedProducts,
      {
        once: true
      }
    );


  } else {


    initPinnedProducts();


  }


})();


