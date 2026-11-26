const products = [
  {
    name: "Royal Enfield Hunter 350",
    category: "Automotive",
    status: "owned",
    link: "https://www.royalenfield.com/in/en/motorcycles/hunter-350/",
    image: "https://www.royalenfield.com/content/dam/royal-enfield-revamp/book-a-test-ride/desktop/hunter-350.webp"
  },
  {
    name: "MacBook Air M3",
    category: "Tech",
    status: "owned",
    link: "https://www.apple.com/in/macbook-air/",
    image: "https://media-ik.croma.com/Croma%20Assets/Computers%20Peripherals/Laptop/Images/305382_uvrdrb.png?tr=w-1000"
  },
  {
    name: "Google Pixel 7a",
    category: "Tech",
    status: "owned",
    link: "",
    image: "https://m.media-amazon.com/images/W/BW_MEDIAX_AVIF_MEASUREMENT_1306696-T4/images/I/61Ekp1sHS1L._SL1000_.jpg"
  },
  {
    name: "realme Buds Air 5 Pro",
    category: "Audio",
    status: "owned",
    link: "https://www.realme.com/in/realme-buds-air-5-pro",
    image: "https://rukminim2.flixcart.com/image/2940/2940/xif0q/headphone/z/n/n/-enriched-transparent-original-imagsjzc93u5eskr.png?q=90"
  },
  {
    name: "Bose SoundLink Flex 2nd Gen",
    category: "Audio",
    status: "owned",
    link: "https://www.boseindia.com/products/soundlink-flex-2nd-gen?srsltid=AYCX9vJRbBI3AJ0Z6ugZqiLkY6Etjt4h4W1j94mk-zTFRt15UrSgXxzA&variant=51436615041297",
    image: "https://www.boseindia.com/cdn/shop/files/SLFLXII_BlueDusk_Front_RGB_result.webp?v=1745485782"
  },
  {
    name: "MoYu RS3M V5 3x3 Cube",
    category: "Hobbies",
    status: "owned",
    link: "https://www.cubelelo.com/products/rs3m-v5-3x3-cube-magnetic-dual-adjustment?variant=47710476173601",
    image: "./Things%20page/rmbg-transparent.png"
  },
  {
    name: "DJI Osmo Action 5 Pro",
    category: "Photography",
    status: "wishlist",
    link: "https://djiindiashop.com/products/osmo-action-5-pro-standard-combo?srsltid=AYCX9vJ43k2gXgdRg1DloVWvD7ACmXT72CJiJWU-0VOyU7OuHTkDts_x",
    image: "https://djistoredanmark.dk/cdn/shop/files/Osmo-Action-5-Pro_Front-View.png?format=webp&v=1725965169&width=1800"
  },
  {
    name: "Casio Enticer A2418",
    category: "Watches",
    status: "wishlist",
    link: "https://www.casio.com/in/watches/casio/product.MTP-E735B-7AV/",
    image: "https://www.casio.com/content/dam/casio/product-info/locales/in/en/timepiece/product/watch/M/MT/MTP/mtp-e735b-7av/assets/MTP-E735B-7AV.png.transform/main-visual-pc/image.png"
  },
  {
    name: "Casio MTP-E740-2A1V",
    category: "Watches",
    status: "wishlist",
    link: "https://www.casio.com/in/watches/casio/product.MTP-E740-2A1V/",
    image: "https://www.casio.com/content/dam/casio/product-info/locales/in/en/timepiece/product/watch/M/MT/MTP/mtp-e740-2a1v/assets/MTP-E740-2A1V.png"
  }
];

const productGrid = document.getElementById("product-grid");
const categoryFilters = document.getElementById("categories");
const searchInput = document.getElementById("search");
const productCount = document.getElementById("product-count");
const sectionTitle = document.getElementById("section-title");

let selectedStatus = "all";
let selectedCategory = new URLSearchParams(window.location.search).get("filter") || "all";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function renderCategories() {
  const categories = ["all", ...new Set(products.map((product) => product.category))];

  const matchedCategory = categories.find(
    (category) => category.toLowerCase() === selectedCategory.toLowerCase()
  );

  if (!matchedCategory) {
    selectedCategory = "all";
  } else {
    selectedCategory = matchedCategory;
  }

  categoryFilters.innerHTML = categories.map((category) => `
    <button
      class="filter category-filter${selectedCategory === category ? " active" : ""}"
      type="button"
      data-category="${escapeHtml(category)}"
    >
      ${category === "all" ? "All categories" : escapeHtml(category)}
    </button>
  `).join("");

  categoryFilters.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(query);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const statusTitle = selectedStatus === "owned"
    ? "Things I own"
    : selectedStatus === "wishlist" ? "My wishlist" : "Everything";
  sectionTitle.textContent = selectedCategory === "all" || selectedStatus === "all"
    ? (selectedCategory === "all" ? statusTitle : selectedCategory)
    : `${statusTitle} · ${selectedCategory}`;
  productCount.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? "item" : "items"}`;

  if (!filteredProducts.length) {
    productGrid.innerHTML = '<p class="thing-empty">Nothing here yet.</p>';
    return;
  }

  productGrid.innerHTML = filteredProducts.map((product) => {
    const name = escapeHtml(product.name);
    const category = escapeHtml(product.category);
    const image = escapeHtml(product.image);
    const link = escapeHtml(product.link);
    const badge = product.status === "owned" ? "Owned" : "Wishlist";
    const imageContent = image
      ? `<img src="${image}" alt="${name}" loading="lazy">`
      : `<span class="thing-placeholder" aria-hidden="true">${name.charAt(0)}</span>`;
    const imageHtml = link
      ? `<a class="thing-image-link" href="${link}" target="_blank" rel="noopener noreferrer">${imageContent}</a>`
      : imageContent;

    return `
      <article class="thing-card">
        <div class="thing-image">
          ${imageHtml}
          <span class="thing-badge">${badge}</span>
        </div>
        <div class="thing-info">
          <span class="thing-category">${category}</span>
          <h3 class="thing-name">${name}</h3>
          ${link ? `<a class="thing-link" href="${link}" target="_blank" rel="noopener noreferrer">View product ↗</a>` : ""}
        </div>
      </article>
    `;
  }).join("");

  productGrid.querySelectorAll(".thing-image img").forEach((image) => {
    image.addEventListener("error", () => {
      image.replaceWith(Object.assign(document.createElement("span"), {
        className: "thing-placeholder",
        textContent: image.alt.charAt(0)
      }));
    }, { once: true });
  });
}

document.querySelectorAll("[data-status]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedStatus = button.dataset.status;
    document.querySelectorAll("[data-status]").forEach((tab) => {
      tab.classList.toggle("active", tab === button);
    });
    renderProducts();
  });
});

searchInput.addEventListener("input", renderProducts);

renderCategories();
renderProducts();
