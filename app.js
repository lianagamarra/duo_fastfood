// Reemplaza por el indicativo del país y el número real, usando solo dígitos.
const WHATSAPP_NUMBER = "573135856433";

const pizzaFlavors = [
  "Pizza perro",
  "Jamón con queso",
  "Hawaiana",
  "Pollo champiñones",
  "Costeña",
  "Pizza-neta",
  "Pollo-jamón",
];

const image = (id, width = 720) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=78`;

const sections = [
  {
    id: "pizzas",
    emoji: "🍕",
    title: "Nuestras pizzas",
    subtitle: "Elige tu tamaño favorito y combina sabores a tu gusto.",
    products: [
      { id: "pizza-porcion", name: "Pizza por porción", price: 8000, image: image("photo-1579751626657-72bc17010498"), presentation: "Porción", pizzaLimit: 0, hasAddons: true },
      { id: "pizza-personal", name: "Pizza personal", price: 15000, image: image("photo-1593560708920-61dd98c46a4e"), presentation: "Personal", pizzaLimit: 2, hasAddons: true },
      { id: "pizza-small", name: "Pizza small", price: 20000, image: image("photo-1571407970349-bc81e7e96d47"), presentation: "Small", pizzaLimit: 2, hasAddons: true },
      { id: "pizza-medium", name: "Pizza medium", price: 36000, image: image("photo-1579751626657-72bc17010498"), presentation: "Medium", pizzaLimit: 4, hasAddons: true },
      { id: "pizza-familiar", name: "Pizza familiar", price: 64000, image: image("photo-1571407970349-bc81e7e96d47"), presentation: "Familiar", pizzaLimit: 5, hasAddons: true },
    ],
  },
  {
    id: "picadas",
    emoji: "😋",
    title: "Picadas para compartir",
    subtitle: "Un antojo para disfrutar bocado a bocado.",
    products: [
      { id: "picada-chorizo", name: "Picada de chorizo artesanal de cerdo", price: 8000, image: "assets/picada-chorizo.png", presentation: "Porción", hasAddons: true },
      { id: "picada-chicharron", name: "Picada de chicharrón frito", price: 16000, image: "assets/picada-chicharron-frito.png", presentation: "Porción", hasAddons: true },
      { id: "picada-mixta", name: "Picada mixta", price: 16000, image: "assets/picada-mixta.png", presentation: "Porción", hasAddons: true },
    ],
  },
  {
    id: "chuzos",
    emoji: "🍡",
    title: "Chuzos desgranados",
    subtitle: "Escoge tu favorito y dale un toque extra si quieres.",
    products: [
      { id: "chuzo-pollo", name: "Chuzo desgranado de pollo", price: 19000, image: "assets/chuzo-desgranado-pollo.png", presentation: "Porción", hasAddons: true },
      { id: "chuzo-cerdo", name: "Chuzo desgranado de cerdo", price: 19000, image: "assets/chuzo-desgranado-cerdo.png", presentation: "Porción", hasAddons: true },
      { id: "chuzo-mixto", name: "Chuzo desgranado mixto", price: 19000, image: "assets/chuzo-desgranado-mixto.png", presentation: "Porción", hasAddons: true },
    ],
  },
  {
    id: "domingo",
    emoji: "🔥",
    title: "Especiales de domingo",
    subtitle: "Sabores especiales, preparados bajo pedido. Disponibles solo los domingos.",
    special: true,
    products: [
      {
        id: "chicharron-barril", name: "Chicharrón al barril", price: 20000,
        description: "200 g de chicharrón al barril acompañado de yuca cocida, guacamole, chimichurri y limón.",
        image: image("photo-1626082927389-6cd097cdc6ec"), presentation: "200 g", hasAddons: true,
      },
      {
        id: "picada-mixta-barril", name: "Picada mixta barril", price: 18000,
        description: "120 g de chicharrón al barril, chorizo artesanal de cerdo, bollo limpio, salsas de la casa, chimichurri y limón.",
        image: image("photo-1544025162-d76694265947"), presentation: "Porción", hasAddons: true,
      },
    ],
  },
  {
    id: "bebidas",
    emoji: "🥤",
    title: "Bebidas",
    subtitle: "Algo refrescante para acompañar.",
    products: [
      { id: "postobon-250", name: "Gaseosa personal Postobón", price: 2500, image: "assets/postobon-250ml.png", presentation: "250 ml" },
      { id: "agua-manzana-500", name: "Agua de manzana Postobón", price: 3000, image: "assets/postobon-acqua-manzana.png", presentation: "500 ml" },
      { id: "hit-500", name: "Jugo HIT Postobón", price: 4500, image: "assets/hit-500ml.png", presentation: "500 ml" },
      { id: "postobon-400", name: "Gaseosa personal Postobón", price: 4000, image: "assets/postobon-400ml.png", presentation: "400 ml" },
      { id: "postobon-125", name: "Gaseosa Postobón", price: 6000, image: "assets/postobon-125l.png", presentation: "1,25 litros" },
      { id: "postobon-15", name: "Gaseosa Postobón", price: 8000, image: "assets/postobon-15-litros.png", presentation: "1,5 litros" },
    ],
  },
];

const addons = [
  { id: "tocineta", name: "Tocineta", price: 2000 },
  { id: "queso", name: "Queso gratinado", price: 3800 },
];

const money = (amount) =>
  `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(amount)} COP`;

const menuRoot = document.querySelector("#menu-sections");
const cartDialog = document.querySelector(".cart-dialog");
const customizeDialog = document.querySelector(".customize-dialog");
const customizeContent = document.querySelector(".customize-content");
const cartItemsRoot = document.querySelector(".cart-items");
const toast = document.querySelector(".toast");
let cart = [];
let toastTimeout;

function productCard(product, special = false) {
  return `
    <article class="product-card${special ? " product-card-special" : ""}">
      <div class="product-photo">
        <img src="${product.image}" alt="${product.name} ${product.presentation}" loading="lazy" decoding="async" />
        ${special ? '<span class="availability-tag">✦ Solo domingos · Bajo pedido</span>' : ""}
      </div>
      <div class="product-info">
        <div class="product-title-row"><h3>${product.name}</h3><span class="product-price">${money(product.price)}</span></div>
        <p class="product-description">${product.description || product.presentation}</p>
        <button class="add-button" type="button" data-product-id="${product.id}">
          ${product.hasAddons ? "Personalizar" : product.pizzaLimit !== undefined ? "Elegir sabores" : "Agregar"} <span aria-hidden="true">+</span>
        </button>
      </div>
    </article>`;
}

function renderMenu() {
  menuRoot.innerHTML = sections.map((section) => `
    <section class="menu-section${section.special ? " sunday-section" : ""}" id="${section.id}">
      <div class="section-heading">
        <div class="section-title-wrap">
          <span class="section-emoji" aria-hidden="true">${section.emoji}</span>
          <div><p class="section-kicker">${section.special ? "UN ANTOJO ESPECIAL" : "HECHO PARA DISFRUTAR"}</p><h2>${section.title}</h2></div>
        </div>
        <p class="section-subtitle">${section.subtitle}</p>
      </div>
      ${section.special ? '<div class="sunday-notice"><span aria-hidden="true">✳</span><div><strong>Solo domingos · Bajo pedido</strong><p>Estos especiales se preparan únicamente bajo pedido para los domingos.</p></div></div>' : ""}
      <div class="product-grid">${section.products.map((product) => productCard(product, section.special)).join("")}</div>
    </section>`).join("");
}

function findProduct(productId) {
  return sections.flatMap((section) => section.products).find((product) => product.id === productId);
}

function makeCartKey(product, flavors = [], selectedAddons = []) {
  return `${product.id}|${[...flavors].sort().join(",")}|${selectedAddons.map((addon) => addon.id).sort().join(",")}`;
}

function unitPrice(item) {
  return item.product.price + item.addons.reduce((sum, addon) => sum + addon.price, 0);
}

function addToCart(product, flavors = [], selectedAddons = [], quantity = 1) {
  const key = makeCartKey(product, flavors, selectedAddons);
  const existing = cart.find((item) => item.key === key);
  if (existing) existing.quantity += quantity;
  else cart.push({ key, product, flavors, addons: selectedAddons, quantity });
  renderCart();
  showToast(`${quantity} × ${product.name} agregado${quantity > 1 ? "s" : ""} al pedido`);
}

function openCustomization(product) {
  const isPizza = product.pizzaLimit !== undefined;
  const isSlice = isPizza && product.pizzaLimit === 0;
  const flavorOptions = isPizza ? `
    <p class="customize-instruction">${isSlice ? "Si quieres, elige un sabor para tu porción. Combinar sabores no tiene costo adicional." : `Elige de 1 a ${product.pizzaLimit} sabores. Puedes elegir uno solo o combinarlos sin costo adicional.`}</p>
    <div class="flavor-options">${pizzaFlavors.map((flavor) => `
      <label class="choice-option"><input type="checkbox" name="flavor" value="${flavor}" /><span class="choice-check"></span><span>${flavor}</span></label>`).join("")}
    </div>
    <p class="selection-count" data-selection-count>0 de ${isSlice ? "1 opcional" : product.pizzaLimit} sabores elegidos</p>
  ` : "";
  const addonOptions = product.hasAddons ? `
    <div class="addon-section">
      <p class="addon-heading">${isPizza ? "Agrega toppings" : "Adiciones opcionales"}</p>
      <p class="customize-instruction">Elige los extras que quieras. Se suman al precio del producto.</p>
      <div class="flavor-options">${addons.map((addon) => `
        <label class="choice-option addon-choice"><input type="checkbox" name="addon" value="${addon.id}" /><span class="choice-check"></span><span>${addon.name}</span><strong>+ ${money(addon.price)}</strong></label>`).join("")}
      </div>
    </div>
  ` : "";
  customizeContent.innerHTML = `
    <p class="eyebrow">${isPizza ? "ARMA TU PIZZA" : "A TU GUSTO"}</p>
    <h2 id="customize-title">${product.name}</h2>
    <p class="customize-price">${money(product.price)} <span>· ${product.presentation}</span></p>
    ${flavorOptions}
    ${addonOptions}
    ${isPizza ? `
      <div class="pizza-quantity">
        <span>Cantidad</span>
        <div class="quantity-control">
          <button type="button" data-pizza-quantity="-1" aria-label="Disminuir cantidad de pizzas">−</button>
          <output data-pizza-quantity-value aria-live="polite">1</output>
          <button type="button" data-pizza-quantity="1" aria-label="Aumentar cantidad de pizzas">+</button>
        </div>
      </div>` : ""}
    <div class="customize-actions">
      <button class="button button-primary" type="button" data-confirm-customization>Agregar · <span data-custom-total>${money(product.price)}</span></button>
      <button class="text-button" type="button" data-cancel-customization>Volver al menú</button>
    </div>`;
  customizeDialog.showModal();

  const flavorInputs = [...customizeContent.querySelectorAll('input[name="flavor"]')];
  const countLabel = customizeContent.querySelector("[data-selection-count]");
  const updateFlavorControls = () => {
    if (isPizza) {
      const selectedCount = flavorInputs.filter((input) => input.checked).length;
      const limit = isSlice ? 1 : product.pizzaLimit;
      flavorInputs.forEach((input) => {
        input.disabled = !input.checked && selectedCount >= limit;
      });
      countLabel.textContent = isSlice
        ? `${selectedCount} de 1 sabor opcional elegido`
        : `${selectedCount} de ${limit} sabores elegidos`;
    }
  };
  flavorInputs.forEach((input) => input.addEventListener("change", updateFlavorControls));

  const addonInputs = [...customizeContent.querySelectorAll('input[name="addon"]')];
  const customTotal = customizeContent.querySelector("[data-custom-total]");
  let quantity = 1;
  const updateCustomTotal = () => {
    const extrasTotal = addonInputs
      .filter((input) => input.checked)
      .reduce((sum, input) => sum + addons.find((addon) => addon.id === input.value).price, 0);
    customTotal.textContent = money((product.price + extrasTotal) * quantity);
  };
  addonInputs.forEach((input) => input.addEventListener("change", updateCustomTotal));

  customizeContent.querySelectorAll("[data-pizza-quantity]").forEach((button) => {
    button.addEventListener("click", () => {
      quantity = Math.max(1, quantity + Number(button.dataset.pizzaQuantity));
      customizeContent.querySelector("[data-pizza-quantity-value]").textContent = quantity;
      updateCustomTotal();
    });
  });

  customizeContent.querySelector("[data-cancel-customization]").addEventListener("click", () => customizeDialog.close());
  customizeContent.querySelector("[data-confirm-customization]").addEventListener("click", () => {
    const flavors = flavorInputs.filter((input) => input.checked).map((input) => input.value);
    if (isPizza && !isSlice && flavors.length === 0) {
      showToast("Elige al menos un sabor para tu pizza");
      return;
    }
    const selectedAddons = [...customizeContent.querySelectorAll('input[name="addon"]:checked')]
      .map((input) => addons.find((addon) => addon.id === input.value));
    addToCart(product, flavors, selectedAddons, quantity);
    customizeDialog.close();
  });
}

function addRegularProduct(product) {
  addToCart(product);
}

function totalItems() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function totalPrice() {
  return cart.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
}

function renderCart() {
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = totalItems();
  });
  document.querySelectorAll("[data-cart-total], [data-checkout-total]").forEach((element) => {
    element.textContent = money(totalPrice());
  });

  if (cart.length === 0) {
    cartItemsRoot.innerHTML = `
      <div class="empty-cart"><span aria-hidden="true">🍕</span><h3>Tu carrito está esperando.</h3><p>Explora el menú y agrega algo rico para empezar tu pedido.</p><button class="button button-primary" type="button" data-empty-browse>Explorar el menú</button></div>`;
    cartItemsRoot.querySelector("[data-empty-browse]").addEventListener("click", () => cartDialog.close());
    return;
  }

  cartItemsRoot.innerHTML = cart.map((item) => {
    const details = [
      item.product.presentation,
      ...(item.flavors.length ? [`Sabores: ${item.flavors.join(", ")}`] : []),
      ...(item.addons.length ? [`Adiciones: ${item.addons.map((addon) => `${addon.name} (+${money(addon.price)})`).join(", ")}`] : []),
    ];
    return `
      <article class="cart-item">
        <div class="cart-item-main"><div><h3>${item.product.name}</h3><p>${details.join(" · ")}</p>
          <span class="cart-item-price">${money(unitPrice(item))} c/u</span></div>
          <button class="remove-item" type="button" data-remove="${item.key}" aria-label="Eliminar ${item.product.name}">×</button></div>
        <div class="cart-item-bottom"><div class="quantity-control">
          <button type="button" data-quantity="-1" data-key="${item.key}" aria-label="Disminuir cantidad">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-quantity="1" data-key="${item.key}" aria-label="Aumentar cantidad">+</button>
        </div><strong>${money(unitPrice(item) * item.quantity)}</strong></div>
      </article>`;
  }).join("");
}

function updateQuantity(key, amount) {
  const item = cart.find((entry) => entry.key === key);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter((entry) => entry.key !== key);
  renderCart();
}

function whatsappMessage(customerName, notes) {
  const lines = [
    "¡Hola, DUO FAST FOOD! Quiero realizar el siguiente pedido:",
    "",
    `Nombre: ${customerName}`,
    "",
    ...cart.flatMap((item) => {
      const additions = [
        ...(item.flavors.length ? [`Sabores: ${item.flavors.join(", ")}`] : []),
        ...(item.addons.length ? [`Adiciones: ${item.addons.map((addon) => `${addon.name} (+${money(addon.price)})`).join(", ")}`] : []),
      ];
      return [
        `• ${item.quantity} × ${item.product.name} (${item.product.presentation})`,
        ...additions.map((line) => `  ${line}`),
        `  Unitario: ${money(unitPrice(item))} · Subtotal: ${money(unitPrice(item) * item.quantity)}`,
        "",
      ];
    }),
    `TOTAL DEL PEDIDO: ${money(totalPrice())}`,
  ];
  if (notes) lines.push("", `Observaciones: ${notes}`);
  lines.push("", "Quedo atento(a) a la confirmación de mi pedido. ¡Gracias!");
  return lines.join("\n");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("toast-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("toast-visible"), 2400);
}

renderMenu();
renderCart();
document.querySelector("[data-year]").textContent = new Date().getFullYear();

menuRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-id]");
  if (!button) return;
  const product = findProduct(button.dataset.productId);
  if (product.pizzaLimit !== undefined || product.hasAddons) openCustomization(product);
  else addRegularProduct(product);
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-open-cart]")) cartDialog.showModal();
  if (event.target.closest("[data-close-cart]")) cartDialog.close();
  const quantityButton = event.target.closest("[data-quantity]");
  if (quantityButton) updateQuantity(quantityButton.dataset.key, Number(quantityButton.dataset.quantity));
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    cart = cart.filter((item) => item.key !== removeButton.dataset.remove);
    renderCart();
  }
});

document.querySelector(".checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!cart.length) {
    showToast("Agrega al menos un producto antes de continuar");
    return;
  }
  const customerName = document.querySelector("#customer-name").value.trim();
  if (!customerName) {
    const nameInput = document.querySelector("#customer-name");
    nameInput.setCustomValidity("Escribe tu nombre para continuar.");
    nameInput.reportValidity();
    nameInput.focus();
    return;
  }
  document.querySelector("#customer-name").setCustomValidity("");
  if (WHATSAPP_NUMBER === "REEMPLAZA_CON_TU_NUMERO") {
    showToast("Configura el número real de WhatsApp en app.js antes de publicar");
    return;
  }
  const notes = document.querySelector("#order-notes").value.trim();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage(customerName, notes))}`;
  window.open(url, "_blank", "noopener,noreferrer");
});
