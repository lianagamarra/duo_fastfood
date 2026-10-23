// Reemplaza por el indicativo del país y el número real, usando solo dígitos.
const WHATSAPP_NUMBER = "573135856433";

const image = (id, width = 720) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=78`;

let pizzaFlavors = [];
let sections = [];

const money = (amount) =>
  `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(amount)} COP`;

const escapeHTML = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const menuRoot = document.querySelector("#menu-sections");
const cartDialog = document.querySelector(".cart-dialog");
const customizeDialog = document.querySelector(".customize-dialog");
const customizeContent = document.querySelector(".customize-content");
const cartItemsRoot = document.querySelector(".cart-items");
const mobileCartBar = document.querySelector(".mobile-cart-bar");
const toast = document.querySelector(".toast");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const checkoutForm = document.querySelector(".checkout-form");
const deliveryAddressGroup = checkoutForm.querySelector("[data-address-group]");
const deliveryAddressInput = checkoutForm.querySelector("#delivery-address");
const cashGroup = checkoutForm.querySelector("[data-cash-group]");
const cashChangeInput = checkoutForm.querySelector("#cash-change");
const changeAmountGroup = checkoutForm.querySelector("[data-change-amount-group]");
const cashAmountInput = checkoutForm.querySelector("#cash-amount");
const changeSummary = checkoutForm.querySelector("[data-change-summary]");
let cart = [];
let toastTimeout;

function setColorTheme(theme, persist = false) {
  document.documentElement.dataset.theme = theme;
  const nextTheme = theme === "dark" ? "claro" : "oscuro";
  themeToggle.setAttribute("aria-label", `Cambiar a modo ${nextTheme}`);
  themeToggle.title = `Cambiar a modo ${nextTheme}`;
  themeToggle.querySelector("[data-theme-icon]").textContent = theme === "dark" ? "☀" : "☾";
  themeColorMeta.content = theme === "dark" ? "#08090b" : "#ffffff";
  if (persist) localStorage.setItem("duofast-theme", theme);
}

function updateCheckoutFields() {
  const deliveryType = checkoutForm.querySelector('input[name="deliveryType"]:checked').value;
  const paymentMethod = checkoutForm.querySelector('input[name="paymentMethod"]:checked').value;
  const needsAddress = deliveryType === "Domicilio";
  const paysInCash = paymentMethod === "Efectivo";
  const needsChange = paysInCash && cashChangeInput.value === "Sí";

  deliveryAddressGroup.hidden = !needsAddress;
  deliveryAddressInput.required = needsAddress;
  if (!needsAddress) deliveryAddressInput.setCustomValidity("");
  cashGroup.hidden = !paysInCash;
  changeAmountGroup.hidden = !needsChange;
  cashAmountInput.required = needsChange;
  if (!needsChange) cashAmountInput.setCustomValidity("");
  updateChangeSummary();
}

function updateChangeSummary() {
  const amountPaid = cashAmountInput.valueAsNumber;
  const total = totalPrice();
  const isValidPayment = Number.isFinite(amountPaid) && amountPaid > total;
  const needsChange = !cashGroup.hidden && cashChangeInput.value === "Sí";

  changeSummary.hidden = !needsChange;
  changeSummary.textContent = isValidPayment
    ? `Tu cambio será ${money(amountPaid - total)}.`
    : `El total es ${money(total)}. Ingresa un valor mayor para calcular el cambio.`;
}

function productCard(product, special = false) {
  return `
    <article class="product-card${special ? " product-card-special" : ""}">
      <div class="product-photo">
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)} ${escapeHTML(product.presentation)}" loading="lazy" decoding="async" />
        ${special ? '<span class="availability-tag">✦ Solo domingos · Bajo pedido</span>' : ""}
      </div>
      <div class="product-info">
        <div class="product-title-row"><h3>${escapeHTML(product.name)}</h3><span class="product-price">${money(product.price)}</span></div>
        <p class="product-description">${escapeHTML(product.description || product.presentation)}</p>
        <button class="add-button" type="button" data-product-id="${escapeHTML(product.id)}">
          ${product.hasAddons ? "Personalizar" : product.pizzaLimit !== undefined ? "Elegir sabores" : "Agregar"} <span aria-hidden="true">+</span>
        </button>
      </div>
    </article>`;
}

function renderMenu() {
  const categoryLinks = sections.map((section) =>
    `<a href="#${escapeHTML(section.id)}">${escapeHTML(section.navLabel)}</a>`,
  ).join("");
  document.querySelector(".desktop-nav").innerHTML = categoryLinks;
  document.querySelector(".mobile-category-nav").innerHTML = categoryLinks;
  menuRoot.innerHTML = sections.map((section) => `
    <section class="menu-section${section.special ? " sunday-section" : ""}" id="${escapeHTML(section.id)}">
      <div class="section-heading">
        <div class="section-title-wrap">
          <div><p class="section-kicker">${section.special ? "UN ANTOJO ESPECIAL" : "HECHO PARA DISFRUTAR"}</p><h2>${escapeHTML(section.title)}</h2></div>
        </div>
        <p class="section-subtitle">${escapeHTML(section.subtitle)}</p>
      </div>
      ${section.special ? '<div class="sunday-notice"><span aria-hidden="true">✳</span><div><strong>Solo domingos · Bajo pedido</strong><p>Estos especiales se preparan únicamente bajo pedido para los domingos.</p></div></div>' : ""}
      <div class="product-grid">${section.products.map((product) => productCard(product, section.special)).join("")}</div>
    </section>`).join("");
}

function validateCatalog(catalog) {
  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const isText = (value) => typeof value === "string" && value.trim().length > 0;
  const isId = (value) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

  if (!isObject(catalog) || !Array.isArray(catalog.sections) || !catalog.sections.length) {
    throw new Error("El archivo del catálogo debe contener al menos una categoría.");
  }
  if (
    !Array.isArray(catalog.pizzaFlavors) || !catalog.pizzaFlavors.length
    || !catalog.pizzaFlavors.every(isText)
  ) {
    throw new Error("La lista de sabores de pizza no es válida.");
  }
  const sectionIds = new Set();
  const productIds = new Set();
  for (const section of catalog.sections) {
    if (
      !isObject(section) || !isId(section.id) || sectionIds.has(section.id)
      || !isText(section.navLabel) || !isText(section.title) || !isText(section.subtitle)
      || typeof section.special !== "boolean" || !Array.isArray(section.products)
    ) {
      throw new Error("Hay una categoría incompleta o con un identificador repetido.");
    }
    sectionIds.add(section.id);
    for (const product of section.products) {
      if (
        !isObject(product) || !isId(product.id) || productIds.has(product.id)
        || !isText(product.name) || !Number.isFinite(product.price) || product.price < 0
        || !isText(product.image) || !/^(?:\/?assets\/|https:\/\/)/.test(product.image)
        || !isText(product.presentation)
        || (product.description !== undefined && typeof product.description !== "string")
        || (product.pizzaLimit !== undefined && (!Number.isInteger(product.pizzaLimit) || product.pizzaLimit < 0))
        || (product.hasAddons !== undefined && typeof product.hasAddons !== "boolean")
      ) {
        throw new Error("Hay un producto incompleto o con un identificador repetido.");
      }
      if (product.addons !== undefined) {
        const addonIds = new Set();
        if (!Array.isArray(product.addons) || !product.addons.every((addon) => {
          if (
            !isObject(addon) || !isId(addon.id) || addonIds.has(addon.id)
            || !isText(addon.name) || !Number.isFinite(addon.price) || addon.price < 0
          ) {
            return false;
          }
          addonIds.add(addon.id);
          return true;
        })) {
          throw new Error("La lista de toppings o adiciones de un producto no es válida.");
        }
      }
      productIds.add(product.id);
    }
  }
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
  const productAddons = product.addons || [];
  const flavorOptions = isPizza ? `
    <p class="customize-instruction">${isSlice ? "Si quieres, elige un sabor para tu porción. Pregunta por disponibilidad." : `Elige de 1 a ${product.pizzaLimit} sabores. Puedes elegir uno solo o combinarlos sin costo adicional.`}</p>
    <div class="flavor-options">${pizzaFlavors.map((flavor) => `
      <label class="choice-option"><input type="checkbox" name="flavor" value="${escapeHTML(flavor)}" /><span class="choice-check"></span><span>${escapeHTML(flavor)}</span></label>`).join("")}
    </div>
    <p class="selection-count" data-selection-count>0 de ${isSlice ? "1 opcional" : product.pizzaLimit} sabores elegidos</p>
  ` : "";
  const addonOptions = product.hasAddons ? `
    <div class="addon-section">
      <p class="addon-heading">${isPizza ? "Agrega toppings" : "Adiciones opcionales"}</p>
      <p class="customize-instruction">Elige los extras que quieras. Se suman al precio del producto.</p>
      <div class="flavor-options">${productAddons.map((addon) => `
        <label class="choice-option addon-choice"><input type="checkbox" name="addon" value="${escapeHTML(addon.id)}" /><span class="choice-check"></span><span>${escapeHTML(addon.name)}</span><strong>+ ${money(addon.price)}</strong></label>`).join("")}
      </div>
    </div>
  ` : "";
  customizeContent.innerHTML = `
    <p class="eyebrow">${isPizza ? "ARMA TU PIZZA" : "A TU GUSTO"}</p>
    <h2 id="customize-title">${escapeHTML(product.name)}</h2>
    <p class="customize-price">${money(product.price)} <span>· ${escapeHTML(product.presentation)}</span></p>
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
      .reduce((sum, input) => sum + productAddons.find((addon) => addon.id === input.value).price, 0);
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
      .map((input) => productAddons.find((addon) => addon.id === input.value));
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
  mobileCartBar.hidden = cart.length === 0;
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = totalItems();
  });
  document.querySelectorAll("[data-cart-total], [data-checkout-total]").forEach((element) => {
    element.textContent = money(totalPrice());
  });
  updateChangeSummary();

  if (cart.length === 0) {
    cartItemsRoot.innerHTML = `
      <div class="empty-cart"><span aria-hidden="true">🍕</span><h3>Tu carrito está esperando.</h3><p>Explora el menú y agrega algo rico para empezar tu pedido.</p><button class="button button-primary" type="button" data-empty-browse>Explorar el menú</button></div>`;
    cartItemsRoot.querySelector("[data-empty-browse]").addEventListener("click", () => cartDialog.close());
    return;
  }

  cartItemsRoot.innerHTML = cart.map((item) => {
    const details = [
        escapeHTML(item.product.presentation),
        ...(item.flavors.length ? [`Sabores: ${item.flavors.map(escapeHTML).join(", ")}`] : []),
        ...(item.addons.length ? [`Adiciones: ${item.addons.map((addon) => `${escapeHTML(addon.name)} (+${money(addon.price)})`).join(", ")}`] : []),
    ];
    return `
      <article class="cart-item">
          <div class="cart-item-main"><div><h3>${escapeHTML(item.product.name)}</h3><p>${details.join(" · ")}</p>
          <span class="cart-item-price">${money(unitPrice(item))} c/u</span></div>
            <button class="remove-item" type="button" data-remove="${escapeHTML(item.key)}" aria-label="Eliminar ${escapeHTML(item.product.name)}">×</button></div>
        <div class="cart-item-bottom"><div class="quantity-control">
            <button type="button" data-quantity="-1" data-key="${escapeHTML(item.key)}" aria-label="Disminuir cantidad">−</button>
          <span>${item.quantity}</span>
            <button type="button" data-quantity="1" data-key="${escapeHTML(item.key)}" aria-label="Aumentar cantidad">+</button>
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

function whatsappMessage(customerName, notes, deliveryType, deliveryAddress, paymentMethod, cashChange, cashAmount) {
  const lines = [
    "¡Hola, DUO FAST FOOD! Quiero realizar el siguiente pedido:",
    "",
    `Nombre: ${customerName}`,
    `Entrega: ${deliveryType}`,
    ...(deliveryType === "Domicilio" ? [`Dirección: ${deliveryAddress}`] : []),
    `Método de pago: ${paymentMethod}`,
    ...(paymentMethod === "Efectivo"
      ? [`Cambio: ${cashChange === "Sí" ? `Sí, pagaré con ${money(cashAmount)}. Devolver ${money(cashAmount - totalPrice())}` : "No, tengo el valor exacto"}`]
      : []),
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

document.querySelector("[data-year]").textContent = new Date().getFullYear();
setColorTheme(document.documentElement.dataset.theme);
updateCheckoutFields();

const footerObserver = new IntersectionObserver(([entry]) => {
  mobileCartBar.classList.toggle("is-footer-visible", entry.isIntersecting);
}, { rootMargin: "0px 0px 80px 0px" });
footerObserver.observe(document.querySelector(".site-footer"));

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setColorTheme(nextTheme, true);
});

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

checkoutForm.addEventListener("change", updateCheckoutFields);
checkoutForm.addEventListener("input", (event) => {
  event.target.setCustomValidity("");
  if (event.target === cashAmountInput) updateChangeSummary();
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!cart.length) {
    showToast("Agrega al menos un producto antes de continuar");
    return;
  }
  updateCheckoutFields();
  const nameInput = checkoutForm.querySelector("#customer-name");
  const deliveryType = checkoutForm.querySelector('input[name="deliveryType"]:checked').value;
  const paymentMethod = checkoutForm.querySelector('input[name="paymentMethod"]:checked').value;
  const needsChange = paymentMethod === "Efectivo" && cashChangeInput.value === "Sí";
  const customerName = nameInput.value.trim();
  const deliveryAddress = deliveryAddressInput.value.trim();
  const cashAmount = cashAmountInput.valueAsNumber;

  nameInput.setCustomValidity(customerName ? "" : "Escribe tu nombre para continuar.");
  deliveryAddressInput.setCustomValidity(
    deliveryType !== "Domicilio" || deliveryAddress ? "" : "Escribe la dirección para el domicilio.",
  );
  cashAmountInput.setCustomValidity(
    !needsChange || (Number.isFinite(cashAmount) && cashAmount > totalPrice())
      ? ""
      : `El valor debe ser mayor al total del pedido (${money(totalPrice())}).`,
  );
  if (!checkoutForm.reportValidity()) {
    return;
  }
  if (WHATSAPP_NUMBER === "REEMPLAZA_CON_TU_NUMERO") {
    showToast("Configura el número real de WhatsApp en app.js antes de publicar");
    return;
  }
  const notes = checkoutForm.querySelector("#order-notes").value.trim();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage(
      customerName,
      notes,
      deliveryType,
      deliveryAddress,
      paymentMethod,
      cashChangeInput.value,
      cashAmount,
    ),
  )}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

async function initializeMenu() {
  try {
    const response = await fetch("content/menu.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`No se pudo cargar el catálogo (${response.status}).`);
    const catalog = await response.json();
    validateCatalog(catalog);
    sections = catalog.sections;
    pizzaFlavors = catalog.pizzaFlavors;
    renderMenu();
    renderCart();
  } catch (error) {
    menuRoot.innerHTML = `
      <div class="menu-load-error" role="alert">
        <h2>No pudimos cargar el menú</h2>
        <p>Intenta de nuevo más tarde o visita el sitio publicado. Si abriste el archivo directamente, necesitas usar un servidor local para cargar los productos.</p>
      </div>`;
    console.error("No fue posible inicializar el menú.", error);
  }
}

renderCart();
initializeMenu();
